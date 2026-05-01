import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { HealthScore } from '@/lib/financeMetrics';

interface Props {
  health: HealthScore;
}

const COLOR_MAP = {
  success: { ring: 'hsl(162, 64%, 50%)', bg: 'bg-success/10', text: 'text-success', label: 'Excellent' },
  warn: { ring: 'hsl(38, 90%, 55%)', bg: 'bg-amber-500/10', text: 'text-amber-500', label: 'Fair' },
  danger: { ring: 'hsl(0, 70%, 55%)', bg: 'bg-destructive/10', text: 'text-destructive', label: 'Needs attention' },
};

const LEVEL_COPY: Record<HealthScore['level'], string> = {
  excellent: 'Excellent',
  good: 'Healthy',
  fair: 'Fair',
  poor: 'Needs attention',
};

export const HealthScoreCard = ({ health }: Props) => {
  const c = COLOR_MAP[health.color];
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (health.score / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-panel p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Business Health</span>
      </div>

      <div className="flex items-center gap-5">
        {/* Score ring */}
        <div className="relative flex-shrink-0">
          <svg width="100" height="100" className="-rotate-90">
            <circle cx="50" cy="50" r={radius} stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              stroke={c.ring}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-light ${c.text}`}>{health.score}</span>
            <span className="text-[9px] text-muted-foreground -mt-1">out of 100</span>
          </div>
        </div>

        {/* Level + components */}
        <div className="flex-1 min-w-0">
          <p className={`text-base font-medium ${c.text}`}>{LEVEL_COPY[health.level]}</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 text-[10px]">
            <Bar label="Margin" value={health.components.margin} max={25} />
            <Bar label="Payments" value={health.components.paymentDiscipline} max={25} />
            <Bar label="Growth" value={health.components.growth} max={20} />
            <Bar label="Completion" value={health.components.completion} max={15} />
            <Bar label="Diversity" value={health.components.diversification} max={15} />
          </div>
        </div>
      </div>

      {/* Insights */}
      {health.insights.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          {health.insights.map((ins, i) => {
            const Icon = ins.level === 'good' ? CheckCircle2 : ins.level === 'warn' ? AlertCircle : AlertTriangle;
            const color = ins.level === 'good' ? 'text-success' : ins.level === 'warn' ? 'text-amber-500' : 'text-destructive';
            return (
              <div key={i} className="flex items-start gap-2">
                <Icon size={14} className={`${color} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground">{ins.message}</p>
                  {ins.action && <p className="text-[10px] text-muted-foreground">→ {ins.action}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

const Bar = ({ label, value, max }: { label: string; value: number; max: number }) => (
  <div>
    <div className="flex justify-between text-muted-foreground mb-0.5">
      <span>{label}</span>
      <span className="text-foreground/70">{value}/{max}</span>
    </div>
    <div className="h-1 bg-muted rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-full bg-gradient-to-r from-primary to-success rounded-full"
      />
    </div>
  </div>
);
