import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Briefcase, Clock, Target, ChevronLeft, ChevronRight, PieChart, LineChart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Tooltip, PieChart as RechartsPie, Pie, Cell } from 'recharts';
import { Job, JobStatus, Property } from '@/types';
import { Invoice } from '@/hooks/useInvoices';
import { Expense } from '@/hooks/useExpenses';
import { PageHeader } from '@/components/PageHeader';
import { format, parseISO, startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';
import { calculateHealthScore, buildPropertyProfitability } from '@/lib/financeMetrics';
import { HealthScoreCard } from '@/components/finance/HealthScoreCard';
import { PropertyProfitabilityCard } from '@/components/finance/PropertyProfitabilityCard';
import { useNavigate } from 'react-router-dom';

interface KpiDashboardViewProps {
  jobs: Job[];
  invoices: Invoice[];
  expenses: Expense[];
  properties: Property[];
  monthlyExpenses: number;
  categoryBreakdown: Record<string, number>;
  onBack: () => void;
}

const PIE_COLORS = ['hsl(162, 64%, 50%)', 'hsl(200, 80%, 55%)', 'hsl(38, 90%, 55%)', 'hsl(280, 60%, 55%)', 'hsl(340, 70%, 55%)'];

export const KpiDashboardView = ({ jobs, invoices, expenses, properties, monthlyExpenses, categoryBreakdown, onBack }: KpiDashboardViewProps) => {
  const navigate = useNavigate();
  const [monthOffset, setMonthOffset] = useState(0);

  const targetDate = useMemo(() => subMonths(new Date(), monthOffset), [monthOffset]);
  const monthStart = startOfMonth(targetDate);
  const monthEnd = endOfMonth(targetDate);
  const monthStr = format(targetDate, 'yyyy-MM');
  const monthLabel = format(targetDate, 'MMMM yyyy');

  // Filter data for selected month
  const monthJobs = useMemo(() => jobs.filter(j => j.date.startsWith(monthStr)), [jobs, monthStr]);
  const completedJobs = monthJobs.filter(j => j.status === JobStatus.COMPLETED);
  const scheduledJobs = monthJobs.filter(j => j.status === JobStatus.SCHEDULED);

  const monthInvoices = useMemo(() => invoices.filter(i => i.created_at.startsWith(monthStr)), [invoices, monthStr]);
  const paidInvoices = monthInvoices.filter(i => i.status === 'paid');
  const pendingInvoices = monthInvoices.filter(i => i.status === 'pending');
  const overdueInvoices = monthInvoices.filter(i => {
    if (i.status === 'paid') return false;
    if (!i.due_date) return false;
    return new Date(i.due_date) < new Date();
  });

  const monthExpenses = useMemo(() => expenses.filter(e => e.expense_date.startsWith(monthStr)), [expenses, monthStr]);

  // KPIs
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const completionRate = monthJobs.length > 0 ? (completedJobs.length / monthJobs.length) * 100 : 0;
  
  const avgDuration = useMemo(() => {
    const withTime = completedJobs.filter(j => j.startTime && j.endTime);
    if (withTime.length === 0) return 0;
    const totalMin = withTime.reduce((sum, j) => sum + ((j.endTime! - j.startTime!) / 60000), 0);
    return Math.round(totalMin / withTime.length);
  }, [completedJobs]);

  // Revenue trend (last 6 months)
  const revenueTrend = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i);
      const m = format(d, 'yyyy-MM');
      const rev = invoices.filter(inv => inv.status === 'paid' && inv.created_at.startsWith(m)).reduce((s, inv) => s + Number(inv.amount), 0);
      const exp = expenses.filter(e => e.expense_date.startsWith(m)).reduce((s, e) => s + e.amount, 0);
      return { month: format(d, 'MMM'), revenue: rev, expenses: exp, profit: rev - exp };
    });
  }, [invoices, expenses]);

  // Expense breakdown for pie chart
  const pieData = useMemo(() => {
    return Object.entries(categoryBreakdown).map(([name, value]) => ({ name, value }));
  }, [categoryBreakdown]);

  // Duration by type
  const durationByType = useMemo(() => {
    const types: Record<string, { total: number; count: number }> = {};
    completedJobs.filter(j => j.startTime && j.endTime).forEach(j => {
      const dur = (j.endTime! - j.startTime!) / 60000;
      if (!types[j.type]) types[j.type] = { total: 0, count: 0 };
      types[j.type].total += dur;
      types[j.type].count += 1;
    });
    return Object.entries(types).map(([type, { total, count }]) => ({
      type,
      avg: Math.round(total / count),
    }));
  }, [completedJobs]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 !rounded-xl shadow-lg text-xs">
          <p className="font-medium text-foreground mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }}>{p.name}: ${p.value.toFixed(0)}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full relative z-10 overflow-y-auto hide-scrollbar pb-32">
      <PageHeader
        title="KPI Dashboard"
        subtitle="Business Intelligence"
        leftElement={
          <button onClick={onBack} className="liquid-btn p-2">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
        }
      />

      <div className="px-6 pt-2 relative z-10 space-y-6">
        {/* Month Selector */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => setMonthOffset(o => o + 1)} className="p-2 rounded-xl glass-panel-subtle">
            <ChevronLeft size={18} className="text-foreground" />
          </button>
          <h2 className="text-lg font-bold text-foreground capitalize min-w-[160px] text-center">{monthLabel}</h2>
          <button onClick={() => setMonthOffset(o => Math.max(0, o - 1))} className="p-2 rounded-xl glass-panel-subtle" disabled={monthOffset === 0}>
            <ChevronRight size={18} className={monthOffset === 0 ? 'text-muted-foreground/30' : 'text-foreground'} />
          </button>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Revenue', value: `$${totalRevenue.toFixed(0)}`, icon: DollarSign, color: 'text-success', bg: 'bg-success/10' },
            { label: 'Net Profit', value: `$${netProfit.toFixed(0)}`, icon: netProfit >= 0 ? TrendingUp : TrendingDown, color: netProfit >= 0 ? 'text-success' : 'text-destructive', bg: netProfit >= 0 ? 'bg-success/10' : 'bg-destructive/10' },
            { label: 'Jobs Done', value: `${completedJobs.length}/${monthJobs.length}`, icon: Briefcase, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Avg Duration', value: avgDuration > 0 ? `${avgDuration}min` : 'N/A', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.05 }}
              className="glass-panel p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-full ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon size={16} className={kpi.color} />
                </div>
              </div>
              <p className={`text-2xl font-light ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Completion Rate + Profit Margin */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Completion</span>
            </div>
            <p className="text-3xl font-light text-foreground">{completionRate.toFixed(0)}%</p>
            <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
              <div className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all" style={{ width: `${completionRate}%` }} />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-2">
              <PieChart size={16} className="text-success" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Margin</span>
            </div>
            <p className={`text-3xl font-light ${profitMargin >= 0 ? 'text-success' : 'text-destructive'}`}>{profitMargin.toFixed(0)}%</p>
            <p className="text-[10px] text-muted-foreground mt-1">Expenses: ${totalExpenses.toFixed(0)}</p>
          </motion.div>
        </div>

        {/* Invoice Status */}
        {(pendingInvoices.length > 0 || overdueInvoices.length > 0) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-panel p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Invoice Status</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xl font-light text-success">{paidInvoices.length}</p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Paid</p>
              </div>
              <div>
                <p className="text-xl font-light text-amber-500">{pendingInvoices.length}</p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Pending</p>
              </div>
              <div>
                <p className="text-xl font-light text-destructive">{overdueInvoices.length}</p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Overdue</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Revenue Trend Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-success" />
            <span className="text-sm font-medium text-foreground">Revenue vs Expenses (6 months)</span>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrend}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(215, 16%, 47%)' }} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="hsl(162, 64%, 50%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="hsl(0, 70%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Duration by Type */}
        {durationByType.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-amber-500" />
              <span className="text-sm font-medium text-foreground">Avg Duration by Type</span>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={durationByType} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="type" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }} width={80} />
                  <Tooltip formatter={(val: number) => `${val} min`} />
                  <Bar dataKey="avg" fill="hsl(38, 90%, 55%)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Expense Breakdown Pie */}
        {pieData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-panel p-4">
            <div className="flex items-center gap-2 mb-4">
              <PieChart size={18} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Expense Breakdown</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-32 w-32 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={25} outerRadius={50} paddingAngle={3} dataKey="value">
                      {pieData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 flex-1">
                {pieData.map((entry, idx) => (
                  <div key={entry.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      <span className="text-muted-foreground capitalize">{entry.name}</span>
                    </div>
                    <span className="font-medium text-foreground">${entry.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
