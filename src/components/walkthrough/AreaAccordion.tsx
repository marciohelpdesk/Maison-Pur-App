import { useRef, useState } from 'react';
import { ChevronDown, Camera, Trash2, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { STATUS_META, WalkthroughItemStatus } from '@/data/walkthroughCatalog';
import type { AreaCondition, WalkthroughArea, WalkthroughItem } from '@/lib/walkthroughPricing';
import { newBlankItem } from '@/lib/walkthroughPricing';

const STATUSES: WalkthroughItemStatus[] = ['present', 'missing', 'damaged', 'na'];

const CONDITIONS: { key: AreaCondition; label: string }[] = [
  { key: 'good', label: 'Good' },
  { key: 'regular', label: 'Regular' },
  { key: 'heavy', label: 'Heavy' },
];

interface Props {
  area: WalkthroughArea;
  onChange: (area: WalkthroughArea) => void;
  onRemove: () => void;
  onUploadPhoto: (file: File) => Promise<string | null>;
}

export function AreaAccordion({ area, onChange, onRemove, onUploadPhoto }: Props) {
  const [open, setOpen] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const targetItem = useRef<string | null>(null);

  const patchItem = (id: string, patch: Partial<WalkthroughItem>) =>
    onChange({ ...area, items: area.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });

  const removeItem = (id: string) =>
    onChange({ ...area, items: area.items.filter((it) => it.id !== id) });

  const addItem = () => {
    onChange({ ...area, items: [...area.items, newBlankItem('')] });
    setOpen(true);
  };

  const pickPhoto = (itemId: string) => {
    targetItem.current = itemId;
    fileRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const id = targetItem.current;
    e.target.value = '';
    if (!file || !id) return;
    setUploadingId(id);
    const url = await onUploadPhoto(file);
    setUploadingId(null);
    if (url) patchItem(id, { photo_url: url });
  };

  const missing = area.items.filter((i) => i.status === 'missing').length;
  const damaged = area.items.filter((i) => i.status === 'damaged').length;

  return (
    <div className="rounded-2xl border border-border bg-card/60 overflow-hidden mb-2">
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />

      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3 px-3 py-2.5 text-left">
        <span className="text-lg">{area.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{area.label}</p>
          <p className="text-[11px] text-muted-foreground">
            {area.items.length} items
            {missing > 0 && <span className="text-destructive"> · {missing} missing</span>}
            {damaged > 0 && <span className="text-amber-600"> · {damaged} damaged</span>}
          </p>
        </div>
        <ChevronDown size={16} className={cn('text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3">
              {/* condition */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Condition</span>
                <div className="flex gap-1">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => onChange({ ...area, condition: c.key })}
                      className={cn(
                        'px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors',
                        area.condition === c.key ? 'bg-primary/15 text-primary border-primary/40' : 'text-muted-foreground border-border'
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={onRemove} className="ml-auto text-muted-foreground hover:text-destructive" aria-label="Remove area">
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="space-y-1.5">
                {area.items.map((it) => (
                  <div
                    key={it.id}
                    className={cn(
                      'rounded-xl border-l-2 bg-muted/30 px-2.5 py-2',
                      it.status === 'missing' ? 'border-l-destructive' : it.status === 'damaged' ? 'border-l-amber-500' : it.status === 'na' ? 'border-l-border' : 'border-l-emerald-500'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        value={it.name}
                        placeholder="Item name"
                        onChange={(e) => patchItem(it.id, { name: e.target.value })}
                        className="h-7 text-[13px] border-0 bg-transparent px-0 font-medium focus-visible:ring-0"
                      />
                      <button type="button" onClick={() => removeItem(it.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                        <X size={13} />
                      </button>
                    </div>

                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => patchItem(it.id, { status: s, found: s === 'present' ? it.ideal : s === 'missing' ? 0 : it.found })}
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors',
                            it.status === s ? STATUS_META[s].className : 'text-muted-foreground border-border'
                          )}
                        >
                          {STATUS_META[s].short}
                        </button>
                      ))}

                      <div className="flex items-center gap-1 ml-auto">
                        <Input
                          type="number"
                          value={it.found}
                          onChange={(e) => patchItem(it.id, { found: Number(e.target.value) })}
                          className="h-6 w-12 text-[11px] text-center px-1"
                        />
                        <span className="text-[10px] text-muted-foreground">/ {it.ideal} {it.unit}</span>
                        <button
                          type="button"
                          onClick={() => pickPhoto(it.id)}
                          className={cn('w-6 h-6 rounded-md flex items-center justify-center border', it.photo_url ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600' : 'border-border text-muted-foreground')}
                          aria-label="Add photo"
                        >
                          <Camera size={12} />
                        </button>
                      </div>
                    </div>

                    {uploadingId === it.id && <p className="text-[10px] text-muted-foreground mt-1">Uploading photo…</p>}
                    {it.photo_url && (
                      <img src={it.photo_url} alt={it.name} className="mt-1.5 h-14 w-14 object-cover rounded-md" />
                    )}

                    <Input
                      value={it.note || ''}
                      placeholder="Note (optional)"
                      onChange={(e) => patchItem(it.id, { note: e.target.value })}
                      className="h-6 text-[11px] mt-1 border-0 bg-transparent px-0 text-muted-foreground focus-visible:ring-0"
                    />
                  </div>
                ))}
              </div>

              <Button type="button" variant="ghost" size="sm" onClick={addItem} className="mt-2 h-7 text-[11px] gap-1 text-primary">
                <Plus size={12} /> Add item
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
