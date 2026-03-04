import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInvoices } from '@/hooks/useInvoices';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, Trash2, CheckCircle, Clock, ExternalLink, DollarSign, TrendingUp, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function InvoiceHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { invoices, isLoading, toggleStatus, deleteInvoice } = useInvoices(user?.id);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status === filter);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + Number(i.amount), 0);
  const totalAll = totalPaid + totalPending;

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`https://maisonpur.lovable.app/invoice/${token}?v=${Date.now()}`);
    toast.success('Invoice link copied!');
  };

  return (
    <div className="flex flex-col h-full relative z-10 pb-8">
      <div className="sticky top-0 z-20 px-6 py-4" style={{ background: 'linear-gradient(to bottom, hsl(160 35% 18%) 0%, hsl(160 40% 30%) 60%, transparent 100%)' }}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <p className="text-[10px] text-white/70 font-medium uppercase tracking-wider">Revenue</p>
            <h1 className="font-bold text-white text-2xl">Invoice History</h1>
          </div>
        </div>
      </div>

      <div className="px-6 pt-2 relative z-10">
        {/* Revenue Cards */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-3 text-center">
            <DollarSign size={16} className="mx-auto text-primary mb-1" />
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Total</p>
            <p className="text-base font-bold text-foreground">${totalAll.toFixed(0)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-panel p-3 text-center">
            <TrendingUp size={16} className="mx-auto text-emerald-500 mb-1" />
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Paid</p>
            <p className="text-base font-bold text-emerald-600">${totalPaid.toFixed(0)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-3 text-center">
            <Clock size={16} className="mx-auto text-amber-500 mb-1" />
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Pending</p>
            <p className="text-base font-bold text-amber-600">${totalPending.toFixed(0)}</p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {(['all', 'pending', 'paid'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {f === 'all' ? `All (${invoices.length})` : f === 'paid' ? `Paid (${invoices.filter(i => i.status === 'paid').length})` : `Pending (${invoices.filter(i => i.status === 'pending').length})`}
            </button>
          ))}
        </div>

        {/* Invoice List */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={40} className="mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground">No invoices found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((inv, i) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-panel p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-sm text-foreground truncate">{inv.client_name}</p>
                      <Badge variant="outline" className={`text-[8px] px-1.5 py-0 h-4 shrink-0 ${inv.status === 'paid' ? 'border-emerald-500/40 text-emerald-600 bg-emerald-500/10' : 'border-amber-500/40 text-amber-600 bg-amber-500/10'}`}>
                        {inv.status === 'paid' ? <CheckCircle size={8} className="mr-0.5" /> : <Clock size={8} className="mr-0.5" />}
                        {inv.status}
                      </Badge>
                    </div>
                    {inv.invoice_number && <p className="text-[10px] font-mono text-muted-foreground">{inv.invoice_number}</p>}
                  </div>
                  <p className="text-lg font-bold text-foreground shrink-0">${Number(inv.amount).toFixed(2)}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-muted-foreground">
                    {format(new Date(inv.created_at), 'MMM dd, yyyy')}
                    {inv.line_items?.length > 0 && ` · ${inv.line_items.length} service${inv.line_items.length !== 1 ? 's' : ''}`}
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => toggleStatus.mutate({ id: inv.id, currentStatus: inv.status })}>
                      {inv.status === 'paid' ? <Clock size={13} /> : <CheckCircle size={13} />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => copyLink(inv.public_token)}>
                      <Copy size={13} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => window.open(`/invoice/${inv.public_token}`, '_blank')}>
                      <ExternalLink size={13} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-destructive hover:text-destructive" onClick={() => deleteInvoice.mutate(inv.id)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
