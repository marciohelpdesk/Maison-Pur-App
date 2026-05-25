import { useState, useMemo, useRef, useCallback } from 'react';
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<SupplyCategory>('General');
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<string | null>(null);

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
    if (!name) return;
    const itemId = `custom-${Date.now()}`;
    const next: SupplyAuditEntry = {
      itemId,
      name,
      category: customCategory,
      status: 'out',
    };
    onEntriesChange([...entries, next]);
    setCustomName('');
    setShowAddForm(false);
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
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Package className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">
              {t('exec.supplies.title')}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t('exec.supplies.subtitle')}
            </p>
          </div>
        </div>

        {issuesCount > 0 && (
          <div className="glass-panel p-2.5 border-l-4 border-l-amber-500 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-300">
              {issuesCount} {t('exec.supplies.needRestock')}
            </span>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 px-4 overflow-y-auto hide-scrollbar pb-2">
        {SUPPLY_CATEGORY_ORDER.map(cat => {
          const list = grouped.get(cat);
          if (!list || list.length === 0) return null;
          return (
            <div key={cat} className="mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {t(`exec.supplies.cat.${cat.toLowerCase()}`)}
              </h3>
              <div className="glass-panel divide-y divide-white/10">
                {list.map(item => {
                  const entry = entryFor(item.itemId);
                  const status = entry?.status;
                  const expanded = expandedId === item.itemId;
                  return (
                    <div key={item.itemId} className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.name}
                          </p>
                          {entry?.remainingQty !== undefined && (
                            <p className="text-[10px] text-muted-foreground">
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
                          className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                          title={t('exec.supplies.remove')}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
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
                            <div className="pt-3 space-y-2">
                              {/* Remaining qty */}
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
                                  className="h-9 bg-card/50 border-muted text-sm"
                                />
                                <span className="text-xs text-muted-foreground w-16">
                                  {item.unit || 'units'}
                                </span>
                              </div>

                              {/* Note */}
                              <Textarea
                                placeholder={t('exec.supplies.notePlaceholder')}
                                value={entry.note || ''}
                                onChange={e => updateEntry(item.itemId, { note: e.target.value })}
                                className="min-h-[60px] bg-card/50 border-muted text-sm resize-none"
                              />

                              {/* Photo */}
                              {uploadingFor === item.itemId || (isUploading && uploadTargetRef.current === item.itemId) ? (
                                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-muted flex items-center justify-center">
                                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                </div>
                              ) : entry.photoUrl ? (
                                <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                                  <img src={entry.photoUrl} alt="" className="w-full h-full object-cover" />
                                  <button
                                    onClick={() => updateEntry(item.itemId, { photoUrl: undefined })}
                                    className="absolute top-1 right-1 p-1 rounded-full bg-black/50"
                                  >
                                    <X className="w-3 h-3 text-white" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => triggerUpload(item.itemId, 'camera')}
                                    className="w-20 h-20 rounded-lg border-2 border-dashed border-muted flex flex-col items-center justify-center gap-1 hover:border-accent transition-colors"
                                  >
                                    <Camera className="w-5 h-5 text-muted-foreground" />
                                    <span className="text-[10px] text-muted-foreground">Camera</span>
                                  </button>
                                  <button
                                    onClick={() => triggerUpload(item.itemId, 'gallery')}
                                    className="w-20 h-20 rounded-lg border-2 border-dashed border-muted flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors"
                                  >
                                    <Upload className="w-5 h-5 text-muted-foreground" />
                                    <span className="text-[10px] text-muted-foreground">Gallery</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Add custom item */}
        <AnimatePresence>
          {showAddForm ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel p-3 mb-4"
            >
              <p className="text-xs text-muted-foreground mb-2">
                {t('exec.supplies.newItem')}
              </p>
              <Input
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder={t('exec.supplies.itemNamePlaceholder')}
                className="mb-2 bg-card/50 border-muted"
              />
              <select
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value as SupplyCategory)}
                className="w-full mb-3 bg-card/50 border border-muted rounded-md px-3 py-2 text-sm"
              >
                {SUPPLY_CATEGORY_ORDER.map(c => (
                  <option key={c} value={c}>
                    {t(`exec.supplies.cat.${c.toLowerCase()}`)}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                  {t('common.cancel')}
                </Button>
                <Button onClick={addCustom} disabled={!customName.trim()} className="flex-1">
                  {t('common.add')}
                </Button>
              </div>
            </motion.div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full mb-4 p-3 rounded-xl border-2 border-dashed border-muted flex items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">{t('exec.supplies.addItem')}</span>
            </button>
          )}
        </AnimatePresence>
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
      className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${palette}`}
    >
      {active && <Check className="w-3 h-3 inline mr-0.5" />}
      {label}
    </button>
  );
};
