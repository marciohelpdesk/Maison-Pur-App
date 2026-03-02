import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Copy, Trash2, CheckCircle, Clock, X, CalendarIcon } from 'lucide-react';
import { useInvoices, LineItem } from '@/hooks/useInvoices';
import { useProperties } from '@/hooks/useProperties';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface InvoiceSectionProps {
  userId?: string;
}

export const InvoiceSection = ({ userId }: InvoiceSectionProps) => {
  const { invoices, isLoading, createInvoice, toggleStatus, deleteInvoice } = useInvoices(userId);
  const { properties } = useProperties(userId);
  const [showForm, setShowForm] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [serviceDate, setServiceDate] = useState<Date>();
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  const toggleProperty = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;

    if (selectedPropertyIds.includes(propertyId)) {
      setSelectedPropertyIds(prev => prev.filter(id => id !== propertyId));
      setLineItems(prev => prev.filter(li => li.property_name !== property.name || li.address !== property.address));
    } else {
      setSelectedPropertyIds(prev => [...prev, propertyId]);
      setLineItems(prev => [...prev, {
        property_name: property.name,
        address: property.address,
        service_type: property.serviceType || 'Standard',
        price: property.basePrice || 0,
      }]);
    }
  };

  const updateLineItemPrice = (index: number, price: number) => {
    setLineItems(prev => prev.map((li, i) => i === index ? { ...li, price } : li));
  };

  const total = lineItems.reduce((sum, li) => sum + li.price, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || lineItems.length === 0) {
      toast.error('Please add a client name and select at least one property.');
      return;
    }
    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
    createInvoice.mutate(
      {
        client_name: clientName.trim(),
        client_email: clientEmail.trim(),
        description: lineItems.map(li => `${li.service_type} — ${li.property_name}`).join('; '),
        amount: total,
        property_ids: selectedPropertyIds,
        service_date: serviceDate ? format(serviceDate, 'yyyy-MM-dd') : '',
        invoice_number: invoiceNumber,
        line_items: lineItems,
      },
      {
        onSuccess: () => {
          setClientName(''); setClientEmail(''); setServiceDate(undefined);
          setSelectedPropertyIds([]); setLineItems([]); setShowForm(false);
        },
      }
    );
  };

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/invoice/${token}`);
    toast.success('Link copied!');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="glass-panel p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Invoices</h3>
            <p className="text-xs text-muted-foreground">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={16} /> : <Plus size={16} />}
          <span className="ml-1">{showForm ? 'Close' : 'New'}</span>
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-4 p-4 rounded-lg bg-muted/30 border border-border">
          {/* Client info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Client Name</Label>
              <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="e.g. John Smith" required className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Client Email</Label>
              <Input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="client@email.com" className="h-9 text-sm" />
            </div>
          </div>

          {/* Service date */}
          <div>
            <Label className="text-xs">Service Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-9 text-sm", !serviceDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {serviceDate ? format(serviceDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={serviceDate} onSelect={setServiceDate} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>

          {/* Property selector */}
          <div>
            <Label className="text-xs mb-2 block">Select Properties</Label>
            <div className="max-h-40 overflow-y-auto space-y-1 border border-border rounded-lg p-2">
              {properties.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2 text-center">No properties found</p>
              ) : properties.map(p => (
                <label key={p.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 cursor-pointer">
                  <Checkbox checked={selectedPropertyIds.includes(p.id)} onCheckedChange={() => toggleProperty(p.id)} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate block">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground truncate block">{p.address} · ${p.basePrice?.toFixed(2) || '0.00'}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Line items */}
          {lineItems.length > 0 && (
            <div>
              <Label className="text-xs mb-2 block">Line Items</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs h-8">Property</TableHead>
                    <TableHead className="text-xs h-8">Service</TableHead>
                    <TableHead className="text-xs h-8 text-right">Price ($)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((li, i) => (
                    <TableRow key={i}>
                      <TableCell className="py-1.5 text-xs">{li.property_name}</TableCell>
                      <TableCell className="py-1.5 text-xs">{li.service_type}</TableCell>
                      <TableCell className="py-1.5 text-right">
                        <Input type="number" step="0.01" min="0" value={li.price} onChange={e => updateLineItemPrice(i, parseFloat(e.target.value) || 0)} className="h-7 w-24 text-xs text-right ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} className="py-1.5 text-xs font-semibold text-right">Total</TableCell>
                    <TableCell className="py-1.5 text-xs font-bold text-right">${total.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          <Button type="submit" size="sm" disabled={createInvoice.isPending} className="w-full h-9">
            {createInvoice.isPending ? 'Creating...' : `Create Invoice — $${total.toFixed(2)}`}
          </Button>
        </form>
      )}

      {/* Invoice list */}
      {isLoading ? (
        <div className="text-center py-4 text-muted-foreground text-sm">Loading...</div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm">No invoices created yet</div>
      ) : (
        <div className="space-y-2">
          {invoices.map(inv => (
            <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-foreground truncate">{inv.client_name}</p>
                  {inv.invoice_number && <span className="text-[10px] text-muted-foreground">{inv.invoice_number}</span>}
                  <Badge variant={inv.status === 'paid' ? 'default' : 'secondary'} className={`text-[10px] ${inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30' : 'bg-amber-500/20 text-amber-600 border-amber-500/30'}`}>
                    {inv.status === 'paid' ? <CheckCircle size={10} className="mr-1" /> : <Clock size={10} className="mr-1" />}
                    {inv.status === 'paid' ? 'Paid' : 'Pending'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ${Number(inv.amount).toFixed(2)} · {format(new Date(inv.created_at), 'MMM dd, yyyy')}
                  {inv.line_items?.length > 0 && ` · ${inv.line_items.length} propert${inv.line_items.length !== 1 ? 'ies' : 'y'}`}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggleStatus.mutate({ id: inv.id, currentStatus: inv.status })} title="Toggle status">
                  {inv.status === 'paid' ? <Clock size={14} /> : <CheckCircle size={14} />}
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyLink(inv.public_token)} title="Copy link">
                  <Copy size={14} />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteInvoice.mutate(inv.id)} title="Delete">
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
