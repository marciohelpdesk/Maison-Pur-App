import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Minus, Trash2, Camera, Share2, ExternalLink, Copy, Send, CheckCircle2,
  History, AlertTriangle, Pencil,
} from 'lucide-react';
import { Property, InventoryItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInventory } from '@/hooks/useInventory';
import { useSupplyRequests, SupplyRequestItem } from '@/hooks/useSupplyRequests';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { AddInventoryItemSheet } from './AddInventoryItemSheet';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface Props {
  property: Property;
  userId?: string;
}

export const PropertySuppliesPanel = ({ property, userId }: Props) => {
  const { inventory, addItem, updateItem, deleteItem, isLoading } = useInventory(userId, property.id);
  const { requests, createRequest, updateStatus, deleteRequest } = useSupplyRequests(userId, property.id);
  const { uploadPhoto } = usePhotoUpload();
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [requestNotes, setRequestNotes] = useState('');
  const [selectedForRequest, setSelectedForRequest] = useState<Record<string, number>>({});

  const lowItems = useMemo(
    () => inventory.filter(i => i.quantity <= i.threshold),
    [inventory],
  );

  const inc = (item: InventoryItem, delta: number) => {
    const next = Math.max(0, item.quantity + delta);
    updateItem({ ...item, quantity: next });
  };

  const onPhoto = async (item: InventoryItem, file: File) => {
    if (!userId) return;
    const url = await uploadPhoto(file, {
      userId,
      category: 'properties',
      entityId: property.id,
    });
    if (url) updateItem({ ...item, reorderPhoto: url });
  };

  const toggleSelect = (item: InventoryItem) => {
    setSelectedForRequest(prev => {
      const next = { ...prev };
      if (next[item.id] != null) delete next[item.id];
      else next[item.id] = Math.max(1, item.threshold - item.quantity || 1);
      return next;
    });
  };

  const createRequestFromSelection = () => {
    const items: SupplyRequestItem[] = Object.entries(selectedForRequest)
      .map(([id, qty]) => {
        const inv = inventory.find(i => i.id === id);
        if (!inv) return null;
        return {
          inventory_id: inv.id,
          name: inv.name,
          category: inv.category,
          qty_needed: qty,
          unit: inv.unit,
          photo_url: inv.reorderPhoto || null,
        };
      })
      .filter(Boolean) as SupplyRequestItem[];

    if (items.length === 0) {
      toast.error('Select at least one item');
      return;
    }

    createRequest.mutate(
      {
        property_id: property.id,
        property_name: property.name,
        property_address: property.address,
        status: 'sent',
        notes: requestNotes.trim(),
        items,
      },
      {
        onSuccess: () => {
          setSelectedForRequest({});
          setRequestNotes('');
        },
      },
    );
  };

  const copyLink = (token: string) => {
    const url = `https://maisonpur.lovable.app/supplies/${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied');
  };

  const shareWhatsApp = (token: string) => {
    const url = `https://maisonpur.lovable.app/supplies/${token}`;
    const text = `Maison Pur – Supply request for ${property.name}\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-3">
      {/* Property header */}
      <div className="rounded-2xl border border-border bg-card/40 p-3 flex items-center gap-3">
        {property.photo ? (
          <img src={property.photo} alt="" className="w-14 h-14 rounded-xl object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-muted" />
        )}
        <div className="min-w-0 flex-1">
          <h2
            className="text-lg font-semibold text-foreground truncate"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {property.name}
          </h2>
          <p className="text-xs text-muted-foreground truncate">{property.address}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Low stock</p>
          <p className="text-base font-bold text-amber-600">{lowItems.length}</p>
        </div>
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="grid grid-cols-3 h-9">
          <TabsTrigger value="inventory" className="text-xs">Inventory</TabsTrigger>
          <TabsTrigger value="request" className="text-xs">Request</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
        </TabsList>

        {/* INVENTORY TAB */}
        <TabsContent value="inventory" className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{inventory.length} items</p>
            <Button size="sm" className="h-8 gap-1.5 rounded-lg" onClick={() => setAddOpen(true)}>
              <Plus size={14} /> Add item
            </Button>
          </div>

          {isLoading && (
            <p className="text-xs text-muted-foreground py-6 text-center">Loading…</p>
          )}

          {!isLoading && inventory.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">No inventory yet for this property.</p>
              <Button size="sm" onClick={() => setAddOpen(true)} className="rounded-lg gap-1.5">
                <Plus size={14} /> Add first item
              </Button>
            </div>
          )}

          <div className="rounded-xl border border-border overflow-hidden divide-y divide-stone-200/60">
            {inventory.map(item => {
              const isLow = item.quantity <= item.threshold;
              return (
                <div key={item.id} className="flex items-center gap-2 px-3 py-2 bg-card/30 hover:bg-card/60 transition-colors">
                  {item.reorderPhoto ? (
                    <img src={item.reorderPhoto} alt="" className="w-10 h-10 rounded-md object-cover shrink-0" />
                  ) : (
                    <label className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0 cursor-pointer hover:bg-muted/70">
                      <Camera size={14} className="text-muted-foreground" />
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && onPhoto(item, e.target.files[0])}
                      />
                    </label>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      {isLow && (
                        <Badge variant="outline" className="h-4 text-[9px] px-1.5 border-amber-500/40 text-amber-600 bg-amber-500/10">
                          LOW
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {item.category} · min {item.threshold} {item.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => inc(item, -1)}>
                      <Minus size={13} />
                    </Button>
                    <span className={cn('text-sm font-semibold w-8 text-center', isLow && 'text-amber-600')}>
                      {item.quantity}
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => inc(item, 1)}>
                      <Plus size={13} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setEditItem(item)}>
                      <Pencil size={13} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteItem(item.id)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* REQUEST TAB */}
        <TabsContent value="request" className="mt-3 space-y-2">
          {inventory.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Add inventory items first.
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Select items to include in the request to the client.
              </p>
              <div className="rounded-xl border border-border overflow-hidden divide-y divide-stone-200/60">
                {inventory.map(item => {
                  const checked = selectedForRequest[item.id] != null;
                  const qty = selectedForRequest[item.id] ?? 0;
                  return (
                    <label
                      key={item.id}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors',
                        checked ? 'bg-primary/5' : 'bg-card/30 hover:bg-card/60',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelect(item)}
                        className="h-4 w-4 rounded border-input accent-primary"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {item.category} · current {item.quantity} {item.unit}
                        </p>
                      </div>
                      {checked && (
                        <Input
                          type="number"
                          min={1}
                          value={qty}
                          onClick={e => e.preventDefault()}
                          onChange={e =>
                            setSelectedForRequest(prev => ({
                              ...prev,
                              [item.id]: Math.max(1, parseInt(e.target.value) || 1),
                            }))
                          }
                          className="w-16 h-7 text-xs text-right"
                        />
                      )}
                    </label>
                  );
                })}
              </div>

              <Input
                value={requestNotes}
                onChange={e => setRequestNotes(e.target.value)}
                placeholder="Optional note for the client…"
                className="h-9 text-sm"
              />

              <Button
                onClick={createRequestFromSelection}
                disabled={Object.keys(selectedForRequest).length === 0 || createRequest.isPending}
                className="w-full h-9 rounded-lg gap-1.5"
              >
                <Send size={14} />
                Create & share request
              </Button>
            </>
          )}
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history" className="mt-3 space-y-2">
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No requests sent yet.
            </p>
          ) : (
            <div className="space-y-2">
              {requests.map(r => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border bg-card/40 p-3"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <History size={13} className="text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(r.created_at), 'MMM dd, yyyy · HH:mm')}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'h-5 text-[9px] px-2',
                        r.status === 'sent' && 'border-blue-500/40 text-blue-600 bg-blue-500/10',
                        r.status === 'fulfilled' && 'border-emerald-500/40 text-emerald-600 bg-emerald-500/10',
                        r.status === 'draft' && 'border-muted-foreground/40 text-muted-foreground',
                      )}
                    >
                      {r.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground">{r.items.length} items</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {r.items.map(i => i.name).join(', ')}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1 rounded-lg" onClick={() => copyLink(r.public_token)}>
                      <Copy size={11} /> Copy link
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1 rounded-lg" onClick={() => shareWhatsApp(r.public_token)}>
                      <Share2 size={11} /> WhatsApp
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1 rounded-lg" asChild>
                      <a href={`/supplies/${r.public_token}`} target="_blank" rel="noreferrer">
                        <ExternalLink size={11} /> Open
                      </a>
                    </Button>
                    {r.status !== 'fulfilled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] gap-1 rounded-lg text-emerald-600 border-emerald-500/40"
                        onClick={() => updateStatus.mutate({ id: r.id, status: 'fulfilled' })}
                      >
                        <CheckCircle2 size={11} /> Mark fulfilled
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[11px] gap-1 rounded-lg text-muted-foreground hover:text-destructive"
                      onClick={() => deleteRequest.mutate(r.id)}
                    >
                      <Trash2 size={11} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddInventoryItemSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={(values) => {
          addItem({
            name: values.name,
            category: values.category,
            quantity: values.quantity,
            unit: values.unit,
            threshold: values.threshold,
            propertyId: property.id,
          });
          setAddOpen(false);
        }}
      />

      <AddInventoryItemSheet
        open={!!editItem}
        onOpenChange={(o) => { if (!o) setEditItem(null); }}
        initial={editItem || undefined}
        onSubmit={(values) => {
          if (!editItem) return;
          updateItem({ ...editItem, ...values });
          setEditItem(null);
        }}
      />
    </div>
  );
};
