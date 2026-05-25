import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Trash2,
  Camera,
  Upload,
  Loader2,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SupplyAuditEntry, SupplyStatus } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { useToast } from '@/hooks/use-toast';
import { compressForThumbnail } from '@/lib/imageUtils';
import {
  DEFAULT_SUPPLY_ITEMS,
  SUPPLY_CATEGORY_ORDER,
  SupplyCategory,
} from '@/data/supplies';

interface SuppliesAuditStepProps {
  propertyId?: string;
  entries: SupplyAuditEntry[];
  onEntriesChange: (entries: SupplyAuditEntry[]) => void;
  onNext: () => void;
  onBack: () => void;
  userId: string;
  jobId: string;
}

interface MergedItem {
  itemId: string;
  name: string;
  category: string;
  unit?: string;
}

export const SuppliesAuditStep = ({
  entries,
  onEntriesChange,
  onNext,
  onBack,
  userId,
  jobId,
}: SuppliesAuditStepProps) => {
  const { t } = useLanguage();
  const { uploadPhoto, isUploading } = usePhotoUpload();
  const { toast } = useToast();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [addingInCategory, setAddingInCategory] = useState<SupplyCategory | null>(null);
  const [customName, setCustomName] = useState('');
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<string | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addingInCategory) {
      setTimeout(() => addInputRef.current?.focus(), 60);
    }
  }, [addingInCategory]);

  // Merge defaults + any custom items already in entries
  const items: MergedItem[] = useMemo(() => {
    const defaults: MergedItem[] = DEFAULT_SUPPLY_ITEMS.map(d => ({
      itemId: d.id,
      name: d.name,
      category: d.category,
      unit: d.unit,
    }));
    const defaultIds = new Set(defaults.map(d => d.itemId));
    const customs: MergedItem[] = entries
      .filter(e => !defaultIds.has(e.itemId))
      .map(e => ({
        itemId: e.itemId,
        name: e.name,
        category: e.category,
        unit: e.unit,
      }));
    return [...defaults, ...customs].filter(i => !removedIds.has(i.itemId));
  }, [entries, removedIds]);

  const entryFor = (itemId: string) =>
    entries.find(e => e.itemId === itemId);

  const setStatus = (item: MergedItem, status: SupplyStatus) => {
    const existing = entryFor(item.itemId);
    const next: SupplyAuditEntry = existing
      ? { ...existing, status }
      : {
          itemId: item.itemId,
          name: item.name,
          category: item.category,
          unit: item.unit,
          status,
        };
    const others = entries.filter(e => e.itemId !== item.itemId);
    onEntriesChange([...others, next]);
    if (status !== 'ok') {
      setExpandedId(item.itemId);
    } else {
      setExpandedId(prev => (prev === item.itemId ? null : prev));
    }
  };

  const updateEntry = (itemId: string, patch: Partial<SupplyAuditEntry>) => {
    onEntriesChange(
      entries.map(e => (e.itemId === itemId ? { ...e, ...patch } : e)),
    );
  };

  const removeItem = (itemId: string) => {
    setRemovedIds(prev => new Set(prev).add(itemId));
    onEntriesChange(entries.filter(e => e.itemId !== itemId));
  };

  const addCustom = () => {
    const name = customName.trim();
    if (!name || !addingInCategory) return;
    const itemId = `custom-${Date.now()}`;
    const next: SupplyAuditEntry = {
      itemId,
      name,
      category: addingInCategory,
      status: 'out',
    };
    onEntriesChange([...entries, next]);
    setCustomName('');
    setAddingInCategory(null);
    setExpandedId(itemId);
  };

  const triggerUpload = (itemId: string, source: 'camera' | 'gallery') => {
    uploadTargetRef.current = itemId;
    if (source === 'camera') cameraInputRef.current?.click();
    else fileInputRef.current?.click();
  };

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const itemId = uploadTargetRef.current;
      if (e.target) e.target.value = '';
      if (!file || !itemId) return;

      if (!file.type.startsWith('image/')) {
        toast({ title: t('common.error'), description: t('exec.photo.invalidFile'), variant: 'destructive' });
        return;
      }

      setUploadingFor(itemId);
      let fileToUpload: File | Blob = file;
      try {
        const c = await compressForThumbnail(file);
        if (c.size < file.size) fileToUpload = c;
      } catch {}

      const url = await uploadPhoto(fileToUpload, {
        userId,
        category: 'jobs-supplies',
        entityId: jobId,
      });
      setUploadingFor(null);

      if (url) {
        updateEntry(itemId, { photoUrl: url });
      } else {
        toast({ title: t('common.error'), description: t('exec.photo.uploadFailed'), variant: 'destructive' });
      }
    },
    [userId, jobId, uploadPhoto, toast, t, entries],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, MergedItem[]>();
    items.forEach(it => {
      if (!map.has(it.category)) map.set(it.category, []);
      map.get(it.category)!.push(it);
    });
    return map;
  }, [items]);

  const issuesCount = entries.filter(e => e.status === 'low' || e.status === 'out').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full"
    >
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header */}
      <div className="px-4 pt-2 pb-2">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-foreground leading-tight">
              {t('exec.supplies.title')}
            </h2>
            <p className="text-[11px] text-muted-foreground leading-tight">
              {t('exec.supplies.subtitle')}
            </p>
          </div>
        </div>

        {issuesCount > 0 && (
          <div className="glass-panel py-1.5 px-2.5 border-l-4 border-l-amber-500 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] text-amber-300">
              {issuesCount} {t('exec.supplies.needRestock')}
            </span>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 px-4 overflow-y-auto hide-scrollbar pb-2">
        {SUPPLY_CATEGORY_ORDER.map(cat => {
          const list = grouped.get(cat);
          const isAdding = addingInCategory === cat;
          if ((!list || list.length === 0) && !isAdding) {
            // Still render the category header with + so user can add to empty category
            return (
              <div key={cat} className="mb-3">
                <CategoryHeader
                  label={t(`exec.supplies.cat.${cat.toLowerCase()}`)}
                  onAdd={() => {
                    setCustomName('');
                    setAddingInCategory(cat);
                  }}
                />
              </div>
            );
          }
          return (
            <div key={cat} className="mb-3">
              <CategoryHeader
                label={t(`exec.supplies.cat.${cat.toLowerCase()}`)}
                count={list?.length}
                onAdd={() => {
                  setCustomName('');
                  setAddingInCategory(cat);
                }}
              />
              <div className="glass-panel overflow-hidden">
                {list?.map((item, idx) => {
                  const entry = entryFor(item.itemId);
                  const status = entry?.status;
                  const expanded = expandedId === item.itemId;
                  const isLast = idx === list.length - 1;
                  const accent =
                    status === 'low'
                      ? 'border-l-2 border-l-amber-500/70'
                      : status === 'out'
                      ? 'border-l-2 border-l-rose-500/70'
                      : status === 'ok'
                      ? 'border-l-2 border-l-emerald-500/40'
                      : 'border-l-2 border-l-transparent';
                  return (
                    <motion.div
                      key={item.itemId}
                      layout
                      className={`px-2.5 py-1.5 ${accent} ${
                        !isLast ? 'border-b border-white/5' : ''
                      } ${idx % 2 === 1 ? 'bg-white/[0.02]' : ''}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-foreground truncate leading-tight">
                            {item.name}
                          </p>
                          {entry?.remainingQty !== undefined && (
                            <p className="text-[10px] text-muted-foreground leading-tight">
                              {t('exec.supplies.remaining')}: {entry.remainingQty} {entry.unit || item.unit || ''}
                            </p>
                          )}
                        </div>

                        <StatusButton
                          active={status === 'ok'}
                          color="emerald"
                          label={t('exec.supplies.status.ok')}
                          onClick={() => setStatus(item, 'ok')}
                        />
                        <StatusButton
                          active={status === 'low'}
                          color="amber"
                          label={t('exec.supplies.status.low')}
                          onClick={() => setStatus(item, 'low')}
                        />
                        <StatusButton
                          active={status === 'out'}
                          color="rose"
                          label={t('exec.supplies.status.out')}
                          onClick={() => setStatus(item, 'out')}
                        />

                        <button
                          onClick={() => removeItem(item.itemId)}
                          className="p-1 rounded-md hover:bg-destructive/10 transition-colors"
                          title={t('exec.supplies.remove')}
                        >
                          <Trash2 className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>

                      <AnimatePresence>
                        {expanded && entry && entry.status !== 'ok' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-2 space-y-1.5">
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min={0}
                                  placeholder={t('exec.supplies.remainingPlaceholder')}
                                  value={entry.remainingQty ?? ''}
                                  onChange={e =>
                                    updateEntry(item.itemId, {
                                      remainingQty:
                                        e.target.value === '' ? undefined : Number(e.target.value),
                                      unit: entry.unit || item.unit,
                                    })
                                  }
                                  className="h-8 bg-card/50 border-muted text-[12px]"
                                />
                                <span className="text-[11px] text-muted-foreground w-14 shrink-0">
                                  {item.unit || 'units'}
                                </span>
                              </div>

                              <Textarea
                                placeholder={t('exec.supplies.notePlaceholder')}
                                value={entry.note || ''}
                                onChange={e => updateEntry(item.itemId, { note: e.target.value })}
                                className="min-h-[44px] bg-card/50 border-muted text-[12px] resize-none py-1.5"
                              />

                              {uploadingFor === item.itemId || (isUploading && uploadTargetRef.current === item.itemId) ? (
                                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-muted flex items-center justify-center">
                                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                </div>
                              ) : entry.photoUrl ? (
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                  <img src={entry.photoUrl} alt="" className="w-full h-full object-cover" />
                                  <button
                                    onClick={() => updateEntry(item.itemId, { photoUrl: undefined })}
                                    className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/60"
                                  >
                                    <X className="w-2.5 h-2.5 text-white" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => triggerUpload(item.itemId, 'camera')}
                                    className="w-14 h-14 rounded-lg border-2 border-dashed border-muted flex flex-col items-center justify-center gap-0.5 hover:border-accent transition-colors"
                                  >
                                    <Camera className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-[9px] text-muted-foreground">Camera</span>
                                  </button>
                                  <button
                                    onClick={() => triggerUpload(item.itemId, 'gallery')}
                                    className="w-14 h-14 rounded-lg border-2 border-dashed border-muted flex flex-col items-center justify-center gap-0.5 hover:border-primary transition-colors"
                                  >
                                    <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-[9px] text-muted-foreground">Gallery</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* Inline add form for this category */}
              <AnimatePresence>
                {isAdding && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1.5 glass-panel p-2 flex items-center gap-1.5">
                      <Input
                        ref={addInputRef}
                        value={customName}
                        onChange={e => setCustomName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustom();
                          } else if (e.key === 'Escape') {
                            setAddingInCategory(null);
                            setCustomName('');
                          }
                        }}
                        placeholder={t('exec.supplies.itemNamePlaceholder')}
                        className="h-8 bg-card/50 border-muted text-[12px] flex-1"
                      />
                      <button
                        onClick={addCustom}
                        disabled={!customName.trim()}
                        className="h-8 px-2.5 rounded-md bg-primary text-primary-foreground text-[11px] font-semibold disabled:opacity-40"
                      >
                        {t('common.add')}
                      </button>
                      <button
                        onClick={() => {
                          setAddingInCategory(null);
                          setCustomName('');
                        }}
                        className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-white/5"
                      >
                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="p-4 flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1 h-12 rounded-xl gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </Button>
        <Button onClick={onNext} className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground gap-2">
          {t('common.continue')}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

interface CategoryHeaderProps {
  label: string;
  count?: number;
  onAdd: () => void;
}

const CategoryHeader = ({ label, count, onAdd }: CategoryHeaderProps) => (
  <div className="flex items-center justify-between mb-1 px-0.5">
    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
      {label}
      {typeof count === 'number' && (
        <span className="ml-1.5 text-muted-foreground/60 normal-case tracking-normal">({count})</span>
      )}
    </h3>
    <button
      onClick={onAdd}
      className="flex items-center gap-1 text-[10px] font-semibold text-primary/80 hover:text-primary transition-colors px-1.5 py-0.5 rounded-md hover:bg-primary/10"
    >
      <Plus className="w-3 h-3" />
      Add
    </button>
  </div>
);

interface StatusButtonProps {
  active: boolean;
  color: 'emerald' | 'amber' | 'rose';
  label: string;
  onClick: () => void;
}

const StatusButton = ({ active, color, label, onClick }: StatusButtonProps) => {
  const palette = {
    emerald: active ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-400',
    amber: active ? 'bg-amber-500 text-white' : 'bg-amber-500/10 text-amber-400',
    rose: active ? 'bg-rose-500 text-white' : 'bg-rose-500/10 text-rose-400',
  }[color];
  return (
    <button
      onClick={onClick}
      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${palette}`}
    >
      {active && <Check className="w-2.5 h-2.5 inline mr-0.5" />}
      {label}
    </button>
  );
};
