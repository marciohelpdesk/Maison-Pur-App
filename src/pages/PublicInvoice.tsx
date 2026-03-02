import { useParams } from 'react-router-dom';
import { usePublicInvoice } from '@/hooks/useInvoices';
import { format } from 'date-fns';
import { CheckCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
          <h1 className="text-2xl font-bold text-foreground mb-2">Invoice Not Found</h1>
          <p className="text-muted-foreground">The link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === 'paid';
  const hasLineItems = invoice.line_items && invoice.line_items.length > 0;

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-background rounded-2xl shadow-xl border border-border overflow-hidden">
        {/* Header */}
        <div className="bg-primary/5 border-b border-border px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={purLogo} alt="Pur" className="h-8 object-contain" />
            {invoice.invoice_number && <span className="text-xs font-mono text-muted-foreground">{invoice.invoice_number}</span>}
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${isPaid ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'}`}>
            {isPaid ? <CheckCircle size={12} /> : <Clock size={12} />}
            {isPaid ? 'Paid' : 'Pending'}
          </span>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          <div className="flex justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Billed To</p>
              <p className="text-lg font-semibold text-foreground">{invoice.client_name}</p>
              {invoice.client_email && <p className="text-sm text-muted-foreground">{invoice.client_email}</p>}
            </div>
            {invoice.service_date && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Service Date</p>
                <p className="text-sm text-foreground">{invoice.service_date}</p>
              </div>
            )}
          </div>

          {/* Line items table */}
          {hasLineItems ? (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Services</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs h-8">Property</TableHead>
                    <TableHead className="text-xs h-8">Service</TableHead>
                    <TableHead className="text-xs h-8 text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.line_items.map((li, i) => (
                    <TableRow key={i}>
                      <TableCell className="py-2 text-sm">
                        <div>{li.property_name}</div>
                        <div className="text-[10px] text-muted-foreground">{li.address}</div>
                      </TableCell>
                      <TableCell className="py-2 text-sm">{li.service_type}</TableCell>
                      <TableCell className="py-2 text-sm text-right">${Number(li.price).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : invoice.description ? (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-foreground">{invoice.description}</p>
            </div>
          ) : null}

          <div className="flex justify-between items-end border-t border-dashed border-border pt-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Date</p>
              <p className="text-sm text-foreground">{format(new Date(invoice.created_at), 'MMMM dd, yyyy')}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total</p>
              <p className="text-3xl font-bold text-foreground">${Number(invoice.amount).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          {isPaid ? (
            <div className="w-full py-3 rounded-xl bg-emerald-500/10 text-emerald-600 text-center font-semibold text-sm">
              ✓ This invoice has been paid
            </div>
          ) : (
            <Button className="w-full h-12 rounded-xl text-base font-semibold" onClick={() => { /* placeholder */ }}>
              Pay Now — ${Number(invoice.amount).toFixed(2)}
            </Button>
          )}
        </div>

        <div className="bg-muted/30 border-t border-border px-6 py-3 text-center">
          <p className="text-[10px] text-muted-foreground">Issued by Pur · maisonpur.lovable.app</p>
        </div>
      </div>
    </div>
  );
}
