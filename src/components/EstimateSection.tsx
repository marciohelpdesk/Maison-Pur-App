import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Copy, Trash2, X, CalendarIcon, ExternalLink, ChevronRight, Receipt, Send, CheckCircle, XCircle, FileEdit } from 'lucide-react';
import { useEstimates } from '@/hooks/useEstimates';
import { useInvoices, LineItem } from '@/hooks/useInvoices';
import { useProperties } from '@/hooks/useProperties';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const ESTIMATE_SERVICE_PRESETS = [
  { label: '🛋️ Sofa Cleaning', description: 'Sofa / Upholstery Cleaning' },
  { label: '🧶 Carpet Cleaning', description: 'Carpet Cleaning Service' },
  { label: '🏢 Commercial', description: 'Commercial Cleaning Service' },
  { label: '🏗️ Post-Construction', description: 'Post-Construction Cleaning' },
  { label: '🧹 Deep Clean', description: 'Full Deep Cleaning Service' },
  { label: '📦 Move-in/out', description: 'Move-in / Move-out Cleaning' },
];

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; icon: any }> = {
  draft: { color: 'text-muted-foreground', bg: 'bg-muted/50', border: 'border-muted-foreground/30', icon: FileEdit },
  sent: { color: 'text-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/40', icon: Send },
  accepted: { color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', icon: CheckCircle },
  declined: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/40', icon: XCircle },
};

interface EstimateSectionProps {
  userId?: string;
}

export const EstimateSection = ({ userId }: EstimateSectionProps) => {
  const { estimates, isLoading, createEstimate, updateStatus, deleteEstimate } = useEstimates(userId);
  const { createInvoice } = useInvoices(userId);
  const { properties } = useProperties(userId);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [dueDate, setDueDate] = useState<Date>();
  const [validUntil, setValidUntil] = useState<Date>();
  const [notes, setNotes] = useState('Thank you for considering Maison Pur! This estimate is valid for 30 days.');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  const addPropertyLineItem = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;
    const rate = property.basePrice || 0;
    setLineItems(prev => [...prev, {
      description: `${property.serviceType || 'Standard'} Cleaning — ${property.name}`,
      property_name: property.name,
      address: property.address,
      service_type: property.serviceType || 'Standard',
      quantity: 1,
      rate,
      total: rate,
      service_date: format(new Date(), 'yyyy-MM-dd'),
    }]);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    setLineItems(prev => prev.map((li, i) => {
      if (i !== index) return li;
      const updated = { ...li, [field]: value };
      if (field === 'quantity' || field === 'rate') {
        updated.total = (updated.quantity || 0) * (updated.rate || 0);
      }
      return updated;
    }));
  };

  const addCustomService = (description = 'Custom Service', rate = 0) => {
    setLineItems(prev => [...prev, {
      description,
      property_name: '',
      address: '',
      service_type: 'Custom',
      quantity: 1,
      rate,
      total: rate,
      service_date: format(new Date(), 'yyyy-MM-dd'),
    }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const subtotal = lineItems.reduce((sum, li) => sum + li.total, 0);
  const grandTotal = subtotal + tax - discount;

  const resetForm = () => {
    setClientName(''); setClientEmail(''); setClientAddress(''); setClientPhone('');
    setDueDate(undefined); setValidUntil(undefined);
    setNotes('Thank you for considering Maison Pur! This estimate is valid for 30 days.');
    setDiscount(0); setTax(0); setLineItems([]);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || lineItems.length === 0) {
      toast.error('Please add a client name and at least one service.');
      return;
    }
    const estimateNumber = `EST-${new Date().getFullYear()}-${String(estimates.length + 1).padStart(3, '0')}`;
    createEstimate.mutate(
      {
        client_name: clientName.trim(),
        client_email: clientEmail.trim(),
        client_address: clientAddress.trim(),
        client_phone: clientPhone.trim(),
        description: lineItems.map(li => `${li.description} — ${li.property_name}`).join('; '),
        amount: grandTotal,
        property_ids: [],
        service_date: (() => {
          const dates = lineItems.map(li => li.service_date).filter(Boolean).sort();
          if (dates.length === 0) return '';
          if (dates.length === 1 || dates[0] === dates[dates.length - 1]) return dates[0]!;
          return `${format(new Date(dates[0]! + 'T12:00:00'), 'MMM dd')} – ${format(new Date(dates[dates.length - 1]! + 'T12:00:00'), 'MMM dd, yyyy')}`;
        })(),
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : '',
        valid_until: validUntil ? format(validUntil, 'yyyy-MM-dd') : '',
        estimate_number: estimateNumber,
        line_items: lineItems,
        notes: notes.trim(),
        discount,
        tax,
      },
      { onSuccess: resetForm }
    );
  };

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`https://ebafqcanwdqomqcrifrj.supabase.co/functions/v1/share-estimate?token=${token}`);
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

  const recentEstimates = estimates.slice(0, 3);
  const totalEstimated = estimates.reduce((s, e) => s + Number(e.amount), 0);
  const acceptedTotal = estimates.filter(e => e.status === 'accepted').reduce((s, e) => s + Number(e.amount), 0);
  const pendingTotal = estimates.filter(e => e.status === 'sent').reduce((s, e) => s + Number(e.amount), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="glass-panel p-5 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-primary/10 flex items-center justify-center">
            <FileText size={22} className="text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-base">Estimates</h3>
            <p className="text-[11px] text-muted-foreground">{estimates.length} total · ${totalEstimated.toFixed(0)} estimated</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="rounded-xl h-9 gap-1.5">
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? 'Cancel' : 'New Estimate'}
        </Button>
      </div>

      {/* Revenue Summary */}
      {!showForm && estimates.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">Total</p>
            <p className="text-lg font-bold text-primary">${totalEstimated.toFixed(0)}</p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold">Accepted</p>
            <p className="text-lg font-bold text-emerald-600">${acceptedTotal.toFixed(0)}</p>
          </div>
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-center">
            <p className="text-[10px] uppercase tracking-wider text-amber-600 font-semibold">Pending</p>
            <p className="text-lg font-bold text-amber-600">${pendingTotal.toFixed(0)}</p>
          </div>
        </div>
      )}

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4 mb-4 overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-card/50 border border-border/50 space-y-4">
              {/* Client Info */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Client Information</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Full Name *</Label>
                    <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="John Smith" required className="h-10 rounded-xl bg-card/50 border-border/50" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <Input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="john@email.com" className="h-10 rounded-xl bg-card/50 border-border/50" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Address</Label>
                    <Input value={clientAddress} onChange={e => setClientAddress(e.target.value)} placeholder="123 Main St, City, State" className="h-10 rounded-xl bg-card/50 border-border/50" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <Input value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+1 (941) 000-0000" className="h-10 rounded-xl bg-card/50 border-border/50" />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Dates</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Valid Until</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10 rounded-xl bg-card/50 border-border/50", !validUntil && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {validUntil ? format(validUntil, 'MMM dd, yyyy') : 'Expiry date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={validUntil} onSelect={setValidUntil} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10 rounded-xl bg-card/50 border-border/50", !dueDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, 'MMM dd, yyyy') : 'Due date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Properties */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Add Properties</p>
                <div className="max-h-36 overflow-y-auto space-y-1 border border-border/50 rounded-xl p-2.5 bg-card/30">
                  {properties.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-3 text-center">No properties found</p>
                  ) : properties.map(p => (
                    <div key={p.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground truncate block">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground truncate block">{p.address} · ${p.basePrice?.toFixed(2) || '0.00'}</span>
                      </div>
                      <Button type="button" variant="outline" size="sm" className="h-7 rounded-lg text-[11px] gap-1 shrink-0" onClick={() => addPropertyLineItem(p.id)}>
                        <Plus size={12} /> Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick-Add Services */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Quick-Add Services</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {ESTIMATE_SERVICE_PRESETS.map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => addCustomService(preset.description)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border/50 bg-card/50 hover:bg-primary/10 hover:border-primary/30 transition-colors text-foreground"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => addCustomService()} className="rounded-xl h-8 gap-1.5 text-xs">
                  <Plus size={14} /> Add Custom Service
                </Button>
              </div>

              {/* Line Items Table */}
              {lineItems.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Services</p>
                  <div className="overflow-x-auto rounded-xl border border-border/50">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-primary/5">
                          <TableHead className="text-[10px] font-bold uppercase h-8">Description</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase h-8 w-28">Date</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase h-8 w-16 text-center">Qty</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase h-8 w-24 text-right">Rate</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase h-8 w-20 text-right">Total</TableHead>
                          <TableHead className="text-[10px] font-bold uppercase h-8 w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lineItems.map((li, i) => (
                          <TableRow key={i}>
                            <TableCell className="py-2">
                              <Input value={li.description} onChange={e => updateLineItem(i, 'description', e.target.value)} className="h-7 text-xs border-0 bg-transparent p-0" />
                              {li.property_name && <span className="text-[9px] text-muted-foreground">{li.property_name}</span>}
                            </TableCell>
                            <TableCell className="py-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="sm" className={cn("h-7 text-[11px] px-1.5 w-full justify-start gap-1", !li.service_date && "text-muted-foreground")}>
                                    <CalendarIcon size={12} />
                                    {li.service_date ? format(new Date(li.service_date + 'T12:00:00'), 'MMM dd') : 'Date'}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={li.service_date ? new Date(li.service_date + 'T12:00:00') : undefined}
                                    onSelect={(d) => updateLineItem(i, 'service_date', d ? format(d, 'yyyy-MM-dd') : '')}
                                    initialFocus
                                    className="p-3 pointer-events-auto"
                                  />
                                </PopoverContent>
                              </Popover>
                            </TableCell>
                            <TableCell className="py-2 text-center">
                              <Input type="number" min="1" value={li.quantity} onChange={e => updateLineItem(i, 'quantity', parseInt(e.target.value) || 1)} className="h-7 w-12 text-xs text-center mx-auto border-0 bg-transparent p-0" />
                            </TableCell>
                            <TableCell className="py-2 text-right">
                              <Input type="number" step="0.01" min="0" value={li.rate} onChange={e => updateLineItem(i, 'rate', parseFloat(e.target.value) || 0)} className="h-7 w-20 text-xs text-right ml-auto border-0 bg-transparent p-0" />
                            </TableCell>
                            <TableCell className="py-2 text-right text-xs font-semibold">${li.total.toFixed(2)}</TableCell>
                            <TableCell className="py-2 text-center">
                              <button type="button" onClick={() => removeLineItem(i)} className="text-destructive hover:text-destructive/80 transition-colors">
                                <Trash2 size={13} />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Financial Summary */}
                  <div className="mt-3 space-y-1.5 text-right">
                    <div className="flex justify-end items-center gap-4 text-xs">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium w-24">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-end items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Tax</span>
                      <Input type="number" step="0.01" min="0" value={tax} onChange={e => setTax(parseFloat(e.target.value) || 0)} className="h-7 w-20 text-xs text-right border-0 bg-card/50 rounded-lg" />
                    </div>
                    <div className="flex justify-end items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Discount</span>
                      <Input type="number" step="0.01" min="0" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="h-7 w-20 text-xs text-right border-0 bg-card/50 rounded-lg" />
                    </div>
                    <div className="flex justify-end items-center gap-4 text-sm font-bold border-t border-border/50 pt-2 mt-2">
                      <span>TOTAL</span>
                      <span className="w-24 text-primary">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <Label className="text-xs text-muted-foreground">Notes</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="rounded-xl bg-card/50 border-border/50 text-xs" />
              </div>
            </div>

            <Button type="submit" disabled={createEstimate.isPending} className="w-full h-11 rounded-xl font-bold text-sm">
              {createEstimate.isPending ? 'Creating...' : `Generate Estimate — $${grandTotal.toFixed(2)}`}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Recent Estimates */}
      {!showForm && (
        <>
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground text-sm">Loading...</div>
          ) : estimates.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={32} className="mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No estimates yet</p>
              <p className="text-[11px] text-muted-foreground/60">Create your first estimate above</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentEstimates.map(est => {
                const cfg = STATUS_CONFIG[est.status] || STATUS_CONFIG.draft;
                const StatusIcon = cfg.icon;
                return (
                  <motion.div
                    key={est.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col p-3.5 rounded-xl bg-card/30 border border-border/30 hover:border-border/60 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-sm text-foreground truncate">{est.client_name}</p>
                          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${cfg.border} ${cfg.color} ${cfg.bg}`}>
                            <StatusIcon size={8} className="mr-0.5" />
                            {est.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {est.estimate_number && <span className="font-mono">{est.estimate_number} · </span>}
                          ${Number(est.amount).toFixed(2)} · {format(new Date(est.created_at), 'MMM dd')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1">
                        {/* Status actions */}
                        {est.status === 'draft' && (
                          <Button size="sm" variant="outline" className="h-6 text-[10px] rounded-lg gap-1 px-2" onClick={() => updateStatus.mutate({ id: est.id, status: 'sent' })}>
                            <Send size={10} /> Mark Sent
                          </Button>
                        )}
                        {est.status === 'sent' && (
                          <>
                            <Button size="sm" variant="outline" className="h-6 text-[10px] rounded-lg gap-1 px-2 border-emerald-500/40 text-emerald-600" onClick={() => updateStatus.mutate({ id: est.id, status: 'accepted' })}>
                              <CheckCircle size={10} /> Accept
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 text-[10px] rounded-lg gap-1 px-2 border-destructive/40 text-destructive" onClick={() => updateStatus.mutate({ id: est.id, status: 'declined' })}>
                              <XCircle size={10} /> Decline
                            </Button>
                          </>
                        )}
                        {est.status === 'accepted' && (
                          <Button size="sm" variant="outline" className="h-6 text-[10px] rounded-lg gap-1 px-2 border-primary/40 text-primary" onClick={() => handleConvertToInvoice(est)}>
                            <Receipt size={10} /> Convert to Invoice
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => copyLink(est.public_token)} title="Copy link">
                          <Copy size={14} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => window.open(`https://maisonpur.lovable.app/estimate/${est.public_token}`, '_blank')} title="View">
                          <ExternalLink size={14} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-destructive hover:text-destructive" onClick={() => deleteEstimate.mutate(est.id)} title="Delete">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {estimates.length > 3 && (
                <Button variant="ghost" className="w-full text-xs text-muted-foreground gap-1 h-9 rounded-xl" onClick={() => navigate('/estimates')}>
                  View All {estimates.length} Estimates <ChevronRight size={14} />
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};
