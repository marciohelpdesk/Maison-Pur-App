import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Copy, Trash2, CheckCircle, Clock, X } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface InvoiceSectionProps {
  userId?: string;
}

export const InvoiceSection = ({ userId }: InvoiceSectionProps) => {
  const { invoices, isLoading, createInvoice, toggleStatus, deleteInvoice } = useInvoices(userId);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client_name: '', client_email: '', description: '', amount: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_name.trim() || !form.amount) return;
    createInvoice.mutate(
      { client_name: form.client_name.trim(), client_email: form.client_email.trim(), description: form.description.trim(), amount: parseFloat(form.amount) },
      { onSuccess: () => { setForm({ client_name: '', client_email: '', description: '', amount: '' }); setShowForm(false); } }
    );
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/invoice/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="glass-panel p-4 mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Invoices</h3>
            <p className="text-xs text-muted-foreground">{invoices.length} fatura{invoices.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          <span className="ml-1">{showForm ? 'Fechar' : 'Nova'}</span>
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 mb-4 p-3 rounded-lg bg-muted/30 border border-border">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Nome do cliente</Label>
              <Input value={form.client_name} onChange={e => setForm(p => ({ ...p, client_name: e.target.value }))} placeholder="Ex: João Silva" required className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs">E-mail</Label>
              <Input type="email" value={form.client_email} onChange={e => setForm(p => ({ ...p, client_email: e.target.value }))} placeholder="email@exemplo.com" className="h-9 text-sm" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Descrição do serviço</Label>
            <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Ex: Limpeza completa T2" rows={2} className="text-sm" />
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Label className="text-xs">Valor (€)</Label>
              <Input type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" required className="h-9 text-sm" />
            </div>
            <Button type="submit" size="sm" disabled={createInvoice.isPending} className="h-9">
              {createInvoice.isPending ? 'Criando...' : 'Criar Invoice'}
            </Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-4 text-muted-foreground text-sm">Carregando...</div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm">Nenhuma invoice criada ainda</div>
      ) : (
        <div className="space-y-2">
          {invoices.map(inv => (
            <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-foreground truncate">{inv.client_name}</p>
                  <Badge variant={inv.status === 'paid' ? 'default' : 'secondary'} className={`text-[10px] ${inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30' : 'bg-amber-500/20 text-amber-600 border-amber-500/30'}`}>
                    {inv.status === 'paid' ? <CheckCircle size={10} className="mr-1" /> : <Clock size={10} className="mr-1" />}
                    {inv.status === 'paid' ? 'Pago' : 'Pendente'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  €{Number(inv.amount).toFixed(2)} · {format(new Date(inv.created_at), 'dd MMM yyyy', { locale: pt })}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggleStatus.mutate({ id: inv.id, currentStatus: inv.status })} title="Alternar status">
                  {inv.status === 'paid' ? <Clock size={14} /> : <CheckCircle size={14} />}
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyLink(inv.public_token)} title="Copiar link">
                  <Copy size={14} />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteInvoice.mutate(inv.id)} title="Eliminar">
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
