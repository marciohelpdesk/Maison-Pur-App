import { motion } from 'framer-motion';
import { Building2, TrendingDown, TrendingUp } from 'lucide-react';
import { PropertyProfit } from '@/lib/financeMetrics';

interface Props {
  data: PropertyProfit[];
}

export const PropertyProfitabilityCard = ({ data }: Props) => {
  if (data.length === 0) return null;

  const maxAbsProfit = Math.max(...data.map(d => Math.abs(d.profit)), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-panel p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Building2 size={16} className="text-primary" />
        <span className="text-sm font-medium text-foreground">Profit by property</span>
      </div>

      <div className="space-y-3">
        {data.slice(0, 6).map((p, i) => {
          const positive = p.profit >= 0;
          const widthPct = (Math.abs(p.profit) / maxAbsProfit) * 100;
          return (
            <motion.div
              key={p.propertyId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.04 }}
              className="space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground truncate flex-1 min-w-0 pr-2">{p.propertyName}</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {positive ? <TrendingUp size={12} className="text-success" /> : <TrendingDown size={12} className="text-destructive" />}
                  <span className={`font-semibold ${positive ? 'text-success' : 'text-destructive'}`}>
                    {positive ? '+' : '-'}${Math.abs(p.profit).toFixed(0)}
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ duration: 0.7, delay: 0.5 + i * 0.04 }}
                  className={`h-full rounded-full ${positive ? 'bg-gradient-to-r from-success/60 to-success' : 'bg-gradient-to-r from-destructive/60 to-destructive'}`}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{p.jobs} job{p.jobs !== 1 ? 's' : ''} · ${p.revenue.toFixed(0)} rev</span>
                <span>{p.margin.toFixed(0)}% margin</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
