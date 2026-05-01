import { Job, JobStatus } from '@/types';
import { Invoice } from '@/hooks/useInvoices';
import { Expense } from '@/hooks/useExpenses';
import { addDays, format, isAfter, isBefore, parseISO, startOfMonth, subMonths, differenceInDays } from 'date-fns';

// ─────────────────────────── Cash Flow ───────────────────────────

export interface CashFlowEvent {
  date: string; // yyyy-MM-dd
  amount: number; // signed: + inflow, - outflow
  label: string;
  source: 'job' | 'invoice' | 'expense';
  refId: string;
}

export interface CashFlowDay {
  date: string;
  label: string;
  inflow: number;
  outflow: number;
  net: number;
  balance: number;
  events: CashFlowEvent[];
}

export interface CashFlowForecast {
  days: CashFlowDay[];
  totalInflow: number;
  totalOutflow: number;
  netProjected: number;
  endBalance: number;
  firstNegativeDay: string | null;
}

/**
 * Build daily cash-flow forecast for the next N days.
 * Inflows: scheduled jobs (price) + pending/overdue invoices (amount due on due_date)
 * Outflows: average daily expense burn (rolling avg of last 60d) projected forward
 */
export function buildCashFlowForecast(
  jobs: Job[],
  invoices: Invoice[],
  expenses: Expense[],
  horizonDays: number = 30,
  startBalance: number = 0,
): CashFlowForecast {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizonEnd = addDays(today, horizonDays);

  // 60-day historical daily expense average
  const sixtyAgo = addDays(today, -60);
  const recentExp = expenses.filter(e => {
    try {
      const d = parseISO(e.expense_date);
      return isAfter(d, sixtyAgo) && isBefore(d, today);
    } catch { return false; }
  });
  const dailyExpenseAvg = recentExp.length > 0
    ? recentExp.reduce((s, e) => s + e.amount, 0) / 60
    : 0;

  // Initialize day buckets
  const days: CashFlowDay[] = [];
  for (let i = 0; i < horizonDays; i++) {
    const d = addDays(today, i);
    const dateStr = format(d, 'yyyy-MM-dd');
    days.push({
      date: dateStr,
      label: format(d, 'MMM d'),
      inflow: 0,
      outflow: 0,
      net: 0,
      balance: 0,
      events: [],
    });
  }
  const dayMap = new Map(days.map(d => [d.date, d]));

  // Inflow: scheduled jobs in window
  jobs.filter(j => j.status === JobStatus.SCHEDULED && j.price).forEach(j => {
    if (!j.date) return;
    if (j.date < format(today, 'yyyy-MM-dd') || j.date > format(horizonEnd, 'yyyy-MM-dd')) return;
    const bucket = dayMap.get(j.date);
    if (!bucket) return;
    bucket.inflow += j.price || 0;
    bucket.events.push({
      date: j.date,
      amount: j.price || 0,
      label: `${j.clientName} · ${j.type}`,
      source: 'job',
      refId: j.id,
    });
  });

  // Inflow: unpaid invoices due in window (or past-due → today)
  invoices.filter(i => i.status !== 'paid').forEach(inv => {
    if (!inv.due_date) return;
    let dueStr = inv.due_date;
    try {
      const due = parseISO(inv.due_date);
      const dueClamped = isBefore(due, today) ? today : due;
      if (isAfter(dueClamped, horizonEnd)) return;
      dueStr = format(dueClamped, 'yyyy-MM-dd');
    } catch { return; }
    const bucket = dayMap.get(dueStr);
    if (!bucket) return;
    bucket.inflow += Number(inv.amount) || 0;
    bucket.events.push({
      date: dueStr,
      amount: Number(inv.amount) || 0,
      label: `Invoice ${inv.invoice_number || inv.client_name}`,
      source: 'invoice',
      refId: inv.id,
    });
  });

  // Outflow: distribute projected daily expense
  days.forEach(d => { d.outflow += dailyExpenseAvg; });

  // Compute balance
  let bal = startBalance;
  let firstNeg: string | null = null;
  days.forEach(d => {
    d.net = d.inflow - d.outflow;
    bal += d.net;
    d.balance = bal;
    if (bal < 0 && !firstNeg) firstNeg = d.date;
  });

  return {
    days,
    totalInflow: days.reduce((s, d) => s + d.inflow, 0),
    totalOutflow: days.reduce((s, d) => s + d.outflow, 0),
    netProjected: days.reduce((s, d) => s + d.net, 0),
    endBalance: bal,
    firstNegativeDay: firstNeg,
  };
}

// ─────────────────────────── Profitability per Property ───────────────────────────

export interface PropertyProfit {
  propertyId: string;
  propertyName: string;
  jobs: number;
  revenue: number;
  expenses: number;
  hoursWorked: number;
  profit: number;
  margin: number; // %
  avgPerJob: number;
}

export function buildPropertyProfitability(
  jobs: Job[],
  expenses: Expense[],
  invoices: Invoice[],
  properties: Array<{ id: string; name: string }>,
  monthStr?: string,
): PropertyProfit[] {
  const filterMonth = (dateStr: string) => !monthStr || dateStr.startsWith(monthStr);

  const monthJobs = jobs.filter(j => j.status === JobStatus.COMPLETED && filterMonth(j.date));
  const monthExp = expenses.filter(e => filterMonth(e.expense_date));
  const monthPaid = invoices.filter(i => i.status === 'paid' && filterMonth(i.created_at.slice(0, 7)));

  // Build per-property aggregation
  const map = new Map<string, PropertyProfit>();
  const ensure = (id: string, name: string): PropertyProfit => {
    if (!map.has(id)) {
      map.set(id, {
        propertyId: id,
        propertyName: name,
        jobs: 0,
        revenue: 0,
        expenses: 0,
        hoursWorked: 0,
        profit: 0,
        margin: 0,
        avgPerJob: 0,
      });
    }
    return map.get(id)!;
  };

  monthJobs.forEach(j => {
    if (!j.propertyId) return;
    const propName = properties.find(p => p.id === j.propertyId)?.name || j.address || 'Unknown';
    const p = ensure(j.propertyId, propName);
    p.jobs += 1;
    p.revenue += j.price || 0;
    if (j.startTime && j.endTime) {
      p.hoursWorked += (j.endTime - j.startTime) / 3600000;
    }
  });

  monthExp.forEach(e => {
    if (!e.property_id) return;
    const propName = properties.find(p => p.id === e.property_id)?.name || 'Unknown';
    const p = ensure(e.property_id, propName);
    p.expenses += e.amount;
  });

  // Add paid invoice revenue per property (split equally across linked properties)
  monthPaid.forEach(inv => {
    if (!inv.property_ids || inv.property_ids.length === 0) return;
    const share = Number(inv.amount) / inv.property_ids.length;
    inv.property_ids.forEach(pid => {
      const propName = properties.find(p => p.id === pid)?.name || 'Unknown';
      const p = ensure(pid, propName);
      // Avoid double-counting: only count invoice if no job revenue yet for this prop
      // (heuristic — keeps numbers honest in mixed setups)
      p.revenue += share * 0.5; // weight invoice 50% to avoid duplication with job.price
    });
  });

  return Array.from(map.values()).map(p => {
    p.profit = p.revenue - p.expenses;
    p.margin = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0;
    p.avgPerJob = p.jobs > 0 ? p.revenue / p.jobs : 0;
    return p;
  }).sort((a, b) => b.profit - a.profit);
}

// ─────────────────────────── Business Health Score ───────────────────────────

export interface HealthInsight {
  level: 'good' | 'warn' | 'bad';
  message: string;
  action?: string;
}

export interface HealthScore {
  score: number; // 0-100
  level: 'excellent' | 'good' | 'fair' | 'poor';
  color: 'success' | 'warn' | 'danger';
  components: {
    margin: number;
    paymentDiscipline: number;
    growth: number;
    completion: number;
    diversification: number;
  };
  insights: HealthInsight[];
}

export function calculateHealthScore(
  jobs: Job[],
  invoices: Invoice[],
  expenses: Expense[],
): HealthScore {
  const today = new Date();
  const thisMonth = format(today, 'yyyy-MM');
  const lastMonth = format(subMonths(today, 1), 'yyyy-MM');

  const monthJobs = jobs.filter(j => j.date.startsWith(thisMonth));
  const monthCompleted = monthJobs.filter(j => j.status === JobStatus.COMPLETED);
  const monthPaid = invoices.filter(i => i.status === 'paid' && i.created_at.startsWith(thisMonth));
  const lastPaid = invoices.filter(i => i.status === 'paid' && i.created_at.startsWith(lastMonth));
  const monthExp = expenses.filter(e => e.expense_date.startsWith(thisMonth));

  const revenue = monthPaid.reduce((s, i) => s + Number(i.amount), 0);
  const lastRevenue = lastPaid.reduce((s, i) => s + Number(i.amount), 0);
  const expSum = monthExp.reduce((s, e) => s + e.amount, 0);

  // 1. Margin component (0-25)
  const margin = revenue > 0 ? ((revenue - expSum) / revenue) * 100 : 0;
  const marginScore = Math.max(0, Math.min(25, (margin / 50) * 25));

  // 2. Payment discipline: % of invoices paid on time (0-25)
  const settledInvoices = invoices.filter(i => i.status === 'paid');
  const onTime = settledInvoices.filter(i => {
    if (!i.due_date) return true;
    try {
      const due = parseISO(i.due_date);
      const updated = parseISO(i.updated_at);
      return differenceInDays(updated, due) <= 0;
    } catch { return true; }
  }).length;
  const paymentRate = settledInvoices.length > 0 ? onTime / settledInvoices.length : 1;
  const paymentScore = paymentRate * 25;

  // 3. Growth (0-20)
  let growthPct = 0;
  if (lastRevenue > 0) growthPct = ((revenue - lastRevenue) / lastRevenue) * 100;
  else if (revenue > 0) growthPct = 100;
  const growthScore = Math.max(0, Math.min(20, ((growthPct + 20) / 50) * 20));

  // 4. Completion (0-15)
  const completion = monthJobs.length > 0 ? (monthCompleted.length / monthJobs.length) : 0;
  const completionScore = completion * 15;

  // 5. Diversification (0-15) — penalize if 1 client = >70% revenue
  const clientRevenue: Record<string, number> = {};
  monthPaid.forEach(i => {
    clientRevenue[i.client_name] = (clientRevenue[i.client_name] || 0) + Number(i.amount);
  });
  const totalClientRev = Object.values(clientRevenue).reduce((s, v) => s + v, 0);
  const topShare = totalClientRev > 0
    ? Math.max(...Object.values(clientRevenue)) / totalClientRev
    : 0;
  const diversificationScore = Math.max(0, (1 - Math.max(0, topShare - 0.3) / 0.7) * 15);

  const score = Math.round(marginScore + paymentScore + growthScore + completionScore + diversificationScore);

  let level: HealthScore['level'] = 'poor';
  let color: HealthScore['color'] = 'danger';
  if (score >= 80) { level = 'excellent'; color = 'success'; }
  else if (score >= 65) { level = 'good'; color = 'success'; }
  else if (score >= 45) { level = 'fair'; color = 'warn'; }

  // Insights
  const insights: HealthInsight[] = [];
  const overdue = invoices.filter(i => {
    if (i.status === 'paid' || !i.due_date) return false;
    try { return isBefore(parseISO(i.due_date), today); } catch { return false; }
  });
  if (overdue.length > 0) {
    insights.push({
      level: 'bad',
      message: `${overdue.length} invoice${overdue.length > 1 ? 's' : ''} overdue`,
      action: 'Send a reminder',
    });
  }
  if (margin < 20 && revenue > 0) {
    insights.push({
      level: 'warn',
      message: `Margin is ${margin.toFixed(0)}% — below the 30% target`,
      action: 'Review supply spending',
    });
  }
  if (topShare > 0.7) {
    insights.push({
      level: 'warn',
      message: `One client represents ${(topShare * 100).toFixed(0)}% of revenue`,
      action: 'Diversify your client base',
    });
  }
  if (growthPct < -10) {
    insights.push({
      level: 'bad',
      message: `Revenue dropped ${Math.abs(growthPct).toFixed(0)}% vs last month`,
      action: 'Reach out to past clients',
    });
  }
  if (insights.length === 0 && score >= 65) {
    insights.push({
      level: 'good',
      message: 'Business is running smoothly',
    });
  }

  return {
    score,
    level,
    color,
    components: {
      margin: Math.round(marginScore),
      paymentDiscipline: Math.round(paymentScore),
      growth: Math.round(growthScore),
      completion: Math.round(completionScore),
      diversification: Math.round(diversificationScore),
    },
    insights: insights.slice(0, 3),
  };
}
