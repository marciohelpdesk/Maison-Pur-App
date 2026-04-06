import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInvoices } from '@/hooks/useInvoices';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, CheckCircle, Clock, ExternalLink, DollarSign, TrendingUp, FileText, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface InvoiceHistoryContentProps {
  userId?: string;
}

const isOverdue = (inv: { status: string; due_date: string }) => {
  if (inv.status === 'paid') return false;
  if (!inv.due_date) return false;
  return new Date(inv.due_date) < new Date();
};

type FilterType = 'all' | 'pending' | 'paid' | 'overdue';

export default function InvoiceHistoryContent({ userId }: InvoiceHistoryContentProps) {
  const { invoices, isLoading, toggleStatus, deleteInvoice } = useInvoices(userId);
  const [filter, setFilter] = useState<FilterType>('all');

  const overdueInvoices = invoices.filter(isOverdue);
  const pendingOnly = invoices.filter(i => i.status === 'pending' && !isOverdue(i));
  const paidList = invoices.filter(i => i.status === 'paid');

  const filtered = filter === 'all' ? invoices
    : filter === 'overdue' ? overdueInvoices
    : filter === 'paid' ? paidList
    : pendingOnly;

  const totalPaid = paidList.reduce((s, i) => s + Number(i.amount), 0);
  const totalPending = pendingOnly.reduce((s, i) => s + Number(i.amount), 0);
  const totalOverdue = overdueInvoices.reduce((s, i) => s + Number(i.amount), 0);

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`https://maisonpur.lovable.app/invoice/${token}?v=${Date.now()}`);
    toast.success('Invoice link copied!');
  };

  const getStatusDisplay = (inv: { status: string; due_date: string }) => {
    if (inv.status === 'paid') return { label: 'Paid', icon: CheckCircle, classes: 'border-emerald-500/40 text-emerald-600 bg-emerald-500/10' };
    if (isOverdue(inv)) return { label: 'Overdue', icon: AlertTriangle, classes: 'border-destructive/40 text-destructive bg-destructive/10' };
    return { label: 'Pending', icon: Clock, classes: 'border-amber-500/40 text-amber-600 bg-amber-500/10' };
  };

  return (
    <>
      {/* Revenue Cards */}
      <div className={`grid ${overdueInvoices.length > 0 ? 'grid-cols-4' : 'grid-cols-3'} gap-2 mb-5`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-3 text-center">
          <DollarSign size={16} className="mx-auto text-primary mb-1" />
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Total</p>
          <p className="text-base font-bold text-foreground">${(totalPaid + totalPending + totalOverdue).toFixed(0)}</p>
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
        {overdueInvoices.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-panel p-3 text-center border border-destructive/20">
            <AlertTriangle size={16} className="mx-auto text-destructive mb-1" />
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Overdue</p>
            <p className="text-base font-bold text-destructive">${totalOverdue.toFixed(0)}</p>
          </motion.div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
        {([
          { key: 'all' as FilterType, label: `All (${invoices.length})` },
          { key: 'pending' as FilterType, label: `Pending (${pendingOnly.length})` },
          { key: 'paid' as FilterType, label: `Paid (${paidList.length})` },
          ...(overdueInvoices.length > 0 ? [{ key: 'overdue' as FilterType, label: `Overdue (${overdueInvoices.length})` }] : []),
        ]).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
              filter === f.key
                ? f.key === 'overdue' ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {f.label}
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
          {filtered.map((inv, i) => {
            const status = getStatusDisplay(inv);
            const StatusIcon = status.icon;
            return (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`glass-panel p-4 ${isOverdue(inv) ? 'border border-destructive/20' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-sm text-foreground truncate">{inv.client_name}</p>
                      <Badge variant="outline" className={`text-[8px] px-1.5 py-0 h-4 shrink-0 ${status.classes}`}>
                        <StatusIcon size={8} className="mr-0.5" />
                        {status.label}
                      </Badge>
                    </div>
                    {inv.invoice_number && <p className="text-[10px] font-mono text-muted-foreground">{inv.invoice_number}</p>}
                  </div>
                  <p className="text-lg font-bold text-foreground shrink-0">${Number(inv.amount).toFixed(2)}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-muted-foreground">
                    {format(new Date(inv.created_at), 'MMM dd, yyyy')}
                    {inv.due_date && ` · Due ${format(new Date(inv.due_date), 'MMM dd')}`}
                    {inv.line_items?.length > 0 && ` · ${inv.line_items.length} service${inv.line_items.length !== 1 ? 's' : ''}`}
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => toggleStatus.mutate({ id: inv.id, currentStatus: inv.status })}>
                      {inv.status === 'paid' ? <Clock size={13} /> : <CheckCircle size={13} />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => copyLink(inv.public_token)}>
                      <Copy size={13} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => window.open(`https://maisonpur.lovable.app/invoice/${inv.public_token}`, '_blank')}>
                      <ExternalLink size={13} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-destructive hover:text-destructive" onClick={() => deleteInvoice.mutate(inv.id)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </>
  );
}
