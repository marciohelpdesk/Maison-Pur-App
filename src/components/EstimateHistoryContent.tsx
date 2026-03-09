import { useState } from 'react';
import { motion } from 'framer-motion';
import { useEstimates } from '@/hooks/useEstimates';
import { useInvoices } from '@/hooks/useInvoices';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Trash2, ExternalLink, FileText, Send, CheckCircle, XCircle, FileEdit, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; icon: any }> = {
  draft: { color: 'text-muted-foreground', bg: 'bg-muted/50', border: 'border-muted-foreground/30', icon: FileEdit },
  sent: { color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/40', icon: Send },
  accepted: { color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', icon: CheckCircle },
  declined: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/40', icon: XCircle },
};

interface EstimateHistoryContentProps {
  userId?: string;
}

export default function EstimateHistoryContent({ userId }: EstimateHistoryContentProps) {
  const { estimates, isLoading, updateStatus, deleteEstimate } = useEstimates(userId);
  const { createInvoice } = useInvoices(userId);
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'accepted' | 'declined'>('all');

  const filtered = filter === 'all' ? estimates : estimates.filter(e => e.status === filter);
  const totalEstimated = estimates.reduce((s, e) => s + Number(e.amount), 0);
  const acceptedTotal = estimates.filter(e => e.status === 'accepted').reduce((s, e) => s + Number(e.amount), 0);
  const pendingTotal = estimates.filter(e => e.status === 'sent').reduce((s, e) => s + Number(e.amount), 0);

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`https://maisonpur.lovable.app/estimate/${token}?v=${Date.now()}`);
    toast.success('Estimate link copied!');
  };

  const handleConvertToInvoice = (est: any) => {
    const invoiceNumber = `MP-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
    createInvoice.mutate(
      {
        client_name: est.client_name,
        client_email: est.client_email,
        client_address: est.client_address,
        client_phone: est.client_phone,
        description: est.description,
        amount: Number(est.amount),
        property_ids: est.property_ids || [],
        service_date: est.service_date || '',
        due_date: est.due_date || '',
        invoice_number: invoiceNumber,
        line_items: est.line_items || [],
        notes: est.notes || '',
        discount: Number(est.discount) || 0,
        tax: Number(est.tax) || 0,
      },
      {
        onSuccess: () => {
          updateStatus.mutate({ id: est.id, status: 'accepted' });
          toast.success('Invoice created from estimate!');
        },
      }
    );
  };

  return (
    <>
      {/* Summary */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {(['draft', 'sent', 'accepted', 'declined'] as const).map((s, idx) => {
          const count = estimates.filter(e => e.status === s).length;
          const cfg = STATUS_CONFIG[s];
          return (
            <motion.div key={s} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className={`glass-panel p-3 text-center`}>
              <cfg.icon size={16} className={`mx-auto ${cfg.color} mb-1`} />
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">{s}</p>
              <p className={`text-base font-bold ${cfg.color}`}>{count}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(['all', 'draft', 'sent', 'accepted', 'declined'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {f === 'all' ? `All (${estimates.length})` : `${f} (${estimates.filter(e => e.status === f).length})`}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <FileText size={40} className="mx-auto text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground">No estimates found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((est, i) => {
            const cfg = STATUS_CONFIG[est.status] || STATUS_CONFIG.draft;
            const StatusIcon = cfg.icon;
            return (
              <motion.div
                key={est.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-panel p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-sm text-foreground truncate">{est.client_name}</p>
                      <Badge variant="outline" className={`text-[8px] px-1.5 py-0 h-4 shrink-0 ${cfg.border} ${cfg.color} ${cfg.bg}`}>
                        <StatusIcon size={8} className="mr-0.5" />
                        {est.status}
                      </Badge>
                    </div>
                    {est.estimate_number && <p className="text-[10px] font-mono text-muted-foreground">{est.estimate_number}</p>}
                  </div>
                  <p className="text-lg font-bold text-foreground shrink-0">${Number(est.amount).toFixed(2)}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">
                      {format(new Date(est.created_at), 'MMM dd, yyyy')}
                      {est.valid_until && ` · Valid until ${est.valid_until}`}
                    </span>
                    {est.status === 'draft' && (
                      <Button size="sm" variant="outline" className="h-5 text-[9px] rounded-md gap-0.5 px-1.5" onClick={() => updateStatus.mutate({ id: est.id, status: 'sent' })}>
                        <Send size={8} /> Send
                      </Button>
                    )}
                    {est.status === 'sent' && (
                      <>
                        <Button size="sm" variant="outline" className="h-5 text-[9px] rounded-md gap-0.5 px-1.5 border-emerald-500/40 text-emerald-600" onClick={() => updateStatus.mutate({ id: est.id, status: 'accepted' })}>
                          <CheckCircle size={8} /> Accept
                        </Button>
                        <Button size="sm" variant="outline" className="h-5 text-[9px] rounded-md gap-0.5 px-1.5 border-destructive/40 text-destructive" onClick={() => updateStatus.mutate({ id: est.id, status: 'declined' })}>
                          <XCircle size={8} /> Decline
                        </Button>
                      </>
                    )}
                    {est.status === 'accepted' && (
                      <Button size="sm" variant="outline" className="h-5 text-[9px] rounded-md gap-0.5 px-1.5 border-primary/40 text-primary" onClick={() => handleConvertToInvoice(est)}>
                        <Receipt size={8} /> → Invoice
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => copyLink(est.public_token)}>
                      <Copy size={13} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => window.open(`https://maisonpur.lovable.app/estimate/${est.public_token}`, '_blank')}>
                      <ExternalLink size={13} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-destructive hover:text-destructive" onClick={() => deleteEstimate.mutate(est.id)}>
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
