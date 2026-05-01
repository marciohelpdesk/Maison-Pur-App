import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, AlertTriangle, ArrowDownRight, ArrowUpRight, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { useInvoices } from '@/hooks/useInvoices';
import { useExpenses } from '@/hooks/useExpenses';
import { PageHeader } from '@/components/PageHeader';
import { PageLoader } from '@/lib/routes';
import { buildCashFlowForecast, CashFlowEvent } from '@/lib/financeMetrics';

type Horizon = 30 | 60 | 90;

export default function CashFlow() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs, isLoading: jl } = useJobs(user?.id);
  const { invoices, isLoading: il } = useInvoices(user?.id);
  const { expenses, isLoading: el } = useExpenses(user?.id);
  const [horizon, setHorizon] = useState<Horizon>(30);

  const forecast = useMemo(
    () => buildCashFlowForecast(jobs, invoices, expenses, horizon, 0),
    [jobs, invoices, expenses, horizon],
  );

  if (jl || il || el) return <PageLoader />;

  const allEvents: CashFlowEvent[] = forecast.days.flatMap(d => d.events).sort((a, b) => a.date.localeCompare(b.date));

  const Tooltip3 = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="glass-panel p-3 !rounded-xl shadow-lg text-xs space-y-0.5">
        <p className="font-medium text-foreground mb-1">{label}</p>
        <p className="text-success">+ ${d.inflow.toFixed(0)} in</p>
        <p className="text-destructive">- ${d.outflow.toFixed(0)} out</p>
        <p className="text-foreground pt-1 border-t border-border mt-1">Balance: ${d.balance.toFixed(0)}</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full relative z-10 overflow-y-auto hide-scrollbar pb-32">
      <PageHeader
        title="Cash Flow"
        subtitle="Forecast"
        leftElement={
          <button onClick={() => navigate('/finance')} className="liquid-btn p-2">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
        }
      />

      <div className="px-6 pt-2 space-y-6">
        {/* Horizon */}
        <div className="flex gap-2">
          {([30, 60, 90] as Horizon[]).map(h => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                horizon === h ? 'bg-primary text-primary-foreground' : 'glass-panel-subtle text-muted-foreground'
              }`}
            >
              {h} days
            </button>
          ))}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-4">
            <div className="flex items-center gap-1 mb-1 text-success">
              <ArrowUpRight size={14} /><span className="text-[10px] font-bold uppercase tracking-wider">Inflow</span>
            </div>
            <p className="text-lg font-light text-foreground">${forecast.totalInflow.toFixed(0)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-panel p-4">
            <div className="flex items-center gap-1 mb-1 text-destructive">
              <ArrowDownRight size={14} /><span className="text-[10px] font-bold uppercase tracking-wider">Outflow</span>
            </div>
            <p className="text-lg font-light text-foreground">${forecast.totalOutflow.toFixed(0)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-4">
            <div className="flex items-center gap-1 mb-1 text-primary">
              <TrendingUp size={14} /><span className="text-[10px] font-bold uppercase tracking-wider">Net</span>
            </div>
            <p className={`text-lg font-light ${forecast.netProjected >= 0 ? 'text-success' : 'text-destructive'}`}>
              ${forecast.netProjected.toFixed(0)}
            </p>
          </motion.div>
        </div>

        {/* Negative-balance alert */}
        {forecast.firstNegativeDay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-4 border-l-4 border-destructive flex items-start gap-3"
          >
            <AlertTriangle size={20} className="text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Projected balance turns negative</p>
              <p className="text-xs text-muted-foreground mt-1">
                Around <span className="font-medium">{forecast.firstNegativeDay}</span>. Consider chasing pending invoices or postponing non-essential expenses.
              </p>
            </div>
          </motion.div>
        )}

        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Projected balance</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast.days}>
                <defs>
                  <linearGradient id="balPos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(162, 64%, 50%)" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="hsl(162, 64%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(215, 16%, 47%)' }}
                  interval={Math.floor(forecast.days.length / 6)}
                />
                <YAxis hide />
                <Tooltip content={<Tooltip3 />} />
                <ReferenceLine y={0} stroke="hsl(0, 70%, 55%)" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="hsl(162, 64%, 50%)"
                  strokeWidth={2}
                  fill="url(#balPos)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Upcoming events */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Upcoming events ({allEvents.length})
          </h3>
          <div className="space-y-2">
            {allEvents.length === 0 && (
              <div className="glass-panel p-6 text-center text-sm text-muted-foreground">
                No scheduled inflows in this horizon.
              </div>
            )}
            {allEvents.slice(0, 30).map((e, i) => (
              <motion.div
                key={`${e.refId}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.4) }}
                className="glass-panel p-3 flex items-center justify-between cursor-pointer"
                onClick={() => {
                  if (e.source === 'job') navigate(`/jobs/${e.refId}`);
                  else if (e.source === 'invoice') navigate('/invoices');
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    e.source === 'invoice' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'
                  }`}>
                    {e.source === 'invoice' ? '📄' : '🧹'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{e.label}</p>
                    <p className="text-[10px] text-muted-foreground">{e.date} · {e.source === 'invoice' ? 'Invoice due' : 'Job scheduled'}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-success flex-shrink-0">+${e.amount.toFixed(0)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
