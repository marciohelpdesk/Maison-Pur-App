import { useParams } from 'react-router-dom';
import { usePublicInvoice } from '@/hooks/useInvoices';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CheckCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import purLogo from '@/assets/pur-logo.png';

export default function PublicInvoice() {
  const { token } = useParams<{ token: string }>();
  const { data: invoice, isLoading, isError } = usePublicInvoice(token);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Fatura não encontrada</h1>
          <p className="text-muted-foreground">O link pode estar inválido ou expirado.</p>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === 'paid';

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background rounded-2xl shadow-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="bg-primary/5 border-b border-border px-6 py-5 flex items-center justify-between">
          <img src={purLogo} alt="Pur" className="h-8 object-contain" />
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${isPaid ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'}`}>
            {isPaid ? <CheckCircle size={12} /> : <Clock size={12} />}
            {isPaid ? 'Pago' : 'Pendente'}
          </span>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Faturado a</p>
            <p className="text-lg font-semibold text-foreground">{invoice.client_name}</p>
            {invoice.client_email && <p className="text-sm text-muted-foreground">{invoice.client_email}</p>}
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Descrição</p>
            <p className="text-sm text-foreground">{invoice.description || '—'}</p>
          </div>

          <div className="flex justify-between items-end border-t border-dashed border-border pt-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Data</p>
              <p className="text-sm text-foreground">{format(new Date(invoice.created_at), 'dd MMMM yyyy', { locale: pt })}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total</p>
              <p className="text-3xl font-bold text-foreground">€{Number(invoice.amount).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          {isPaid ? (
            <div className="w-full py-3 rounded-xl bg-emerald-500/10 text-emerald-600 text-center font-semibold text-sm">
              ✓ Esta fatura já foi paga
            </div>
          ) : (
            <Button className="w-full h-12 rounded-xl text-base font-semibold" onClick={() => { /* placeholder */ }}>
              Pagar agora — €{Number(invoice.amount).toFixed(2)}
            </Button>
          )}
        </div>

        <div className="bg-muted/30 border-t border-border px-6 py-3 text-center">
          <p className="text-[10px] text-muted-foreground">Emitido por Pur · maisonpur.lovable.app</p>
        </div>
      </div>
    </div>
  );
}
