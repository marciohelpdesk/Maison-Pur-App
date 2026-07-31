import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Plus, Download, Copy, Trash2, Home, Loader2, Send, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useProperties } from '@/hooks/useProperties';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { useWalkthroughs, type Walkthrough } from '@/hooks/useWalkthroughs';
import { AreaAccordion } from '@/components/walkthrough/AreaAccordion';
import { OPTIONAL_FLAGS } from '@/data/walkthroughCatalog';
import {
  DEFAULT_CONFIG, buildAreas, computePricing,
  type WalkthroughArea, type WalkthroughConfig,
} from '@/lib/walkthroughPricing';
import { generateWalkthroughPdf } from '@/lib/walkthroughPdf';

export default function WalkthroughView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { properties } = useProperties(user?.id);
  const { walkthroughs, isLoading, createWalkthrough, deleteWalkthrough, updateWalkthrough } = useWalkthroughs(user?.id);
  const { uploadPhoto } = usePhotoUpload();

  const [mode, setMode] = useState<'list' | 'new'>('list');
  const [config, setConfig] = useState<WalkthroughConfig>(DEFAULT_CONFIG);
  const [areas, setAreas] = useState<WalkthroughArea[]>([]);
  const [propertyId, setPropertyId] = useState<string>('');
  const [propertyName, setPropertyName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const pricing = useMemo(() => computePricing(config, areas), [config, areas]);

  const selectProperty = (id: string) => {
    setPropertyId(id);
    const p = properties.find((x) => x.id === id);
    if (!p) return;
    setPropertyName(p.name);
    setPropertyAddress(p.address);
    setClientEmail(p.clientEmail || '');
    setConfig((c) => ({
      ...c,
      bedrooms: p.bedrooms ?? c.bedrooms,
      bathrooms: p.bathrooms ?? c.bathrooms,
      sqft: p.sqft ?? c.sqft,
      serviceType: p.serviceType || c.serviceType,
    }));
  };

  const generate = () => {
    setAreas(buildAreas(config));
    toast.success('Checklist generated');
  };

  const handleUpload = async (file: File) => {
    if (!user?.id) return null;
    return uploadPhoto(file, { userId: user.id, category: 'jobs-checklist' });
  };

  const save = (status: 'draft' | 'sent') => {
    if (!propertyName.trim()) return toast.error('Add a property name');
    if (areas.length === 0) return toast.error('Generate the checklist first');
    createWalkthrough.mutate(
      {
        property_id: propertyId || null,
        property_name: propertyName.trim(),
        property_address: propertyAddress.trim(),
        client_name: clientName.trim(),
        client_email: clientEmail.trim(),
        status,
        config,
        areas,
        pricing,
        notes: notes.trim(),
      },
      {
        onSuccess: () => {
          setMode('list');
          setAreas([]);
          setNotes('');
        },
      },
    );
  };

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`https://maisonpur.lovable.app/walkthrough/${token}`);
    toast.success('Public link copied!');
  };

  const download = async (wt: Walkthrough) => {
    setDownloadingId(wt.id);
    try { await generateWalkthroughPdf(wt); }
    catch (e: any) { toast.error(e?.message || 'Could not generate PDF'); }
    finally { setDownloadingId(null); }
  };

  const convertToEstimate = (wt: Walkthrough) => {
    const lineItems = [
      {
        description: `${wt.config?.serviceType || 'Cleaning'} — ${wt.property_name} (${wt.pricing?.adjustedHours ?? 0}h)`,
        property_name: wt.property_name,
        address: wt.property_address,
        service_type: wt.config?.serviceType || 'Cleaning',
        quantity: 1,
        rate: wt.pricing?.laborTotal ?? 0,
        total: wt.pricing?.laborTotal ?? 0,
        service_date: format(new Date(), 'yyyy-MM-dd'),
      },
    ];
    if ((wt.pricing?.suppliesTotal ?? 0) > 0) {
      lineItems.push({
        description: `Initial supplies & linens restock (${wt.pricing?.missingCount ?? 0} items)`,
        property_name: wt.property_name,
        address: wt.property_address,
        service_type: 'Supplies',
        quantity: 1,
        rate: wt.pricing!.suppliesTotal,
        total: wt.pricing!.suppliesTotal,
        service_date: format(new Date(), 'yyyy-MM-dd'),
      });
    }
    updateWalkthrough.mutate({ id: wt.id, status: 'converted' });
    navigate('/estimates', {
      state: {
        prefillEstimate: {
          client_name: wt.client_name || wt.property_name,
          client_email: wt.client_email,
          client_address: wt.property_address,
          line_items: lineItems,
        },
      },
    });
  };

  return (
    <div className="flex flex-col h-full relative z-10 pb-8">
      <div className="sticky top-0 z-20 px-6 py-4" style={{ background: 'transparent' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Pricing</p>
            <h1 className="font-bold text-foreground text-2xl">Walkthrough</h1>
          </div>
          <Button size="sm" className="rounded-xl gap-1.5" onClick={() => setMode(mode === 'new' ? 'list' : 'new')}>
            <Plus size={15} /> {mode === 'new' ? 'Close' : 'New visit'}
          </Button>
        </div>
      </div>

      <div className="px-6 pt-2 space-y-4">
        {mode === 'new' ? (
          <>
            {/* SETUP */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-4 space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2"><Home size={15} className="text-primary" /> Property</h3>

              {properties.length > 0 && (
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {properties.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectProperty(p.id)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-medium border whitespace-nowrap ${propertyId === p.id ? 'bg-primary/15 text-primary border-primary/40' : 'text-muted-foreground border-border'}`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-[11px]">Property name</Label><Input value={propertyName} onChange={(e) => setPropertyName(e.target.value)} className="h-9" /></div>
                <div><Label className="text-[11px]">Address</Label><Input value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} className="h-9" /></div>
                <div><Label className="text-[11px]">Client name</Label><Input value={clientName} onChange={(e) => setClientName(e.target.value)} className="h-9" /></div>
                <div><Label className="text-[11px]">Client email</Label><Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="h-9" /></div>
                <div><Label className="text-[11px]">Bedrooms</Label><Input type="number" value={config.bedrooms} onChange={(e) => setConfig({ ...config, bedrooms: Number(e.target.value) })} className="h-9" /></div>
                <div><Label className="text-[11px]">Bathrooms</Label><Input type="number" value={config.bathrooms} onChange={(e) => setConfig({ ...config, bathrooms: Number(e.target.value) })} className="h-9" /></div>
                <div><Label className="text-[11px]">Sqft</Label><Input type="number" value={config.sqft} onChange={(e) => setConfig({ ...config, sqft: Number(e.target.value) })} className="h-9" /></div>
                <div><Label className="text-[11px]">Hourly rate ($)</Label><Input type="number" value={config.hourlyRate} onChange={(e) => setConfig({ ...config, hourlyRate: Number(e.target.value) })} className="h-9" /></div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {OPTIONAL_FLAGS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setConfig({ ...config, flags: { ...config.flags, [f.key]: !config.flags[f.key] } })}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium border ${config.flags[f.key] ? 'bg-primary/15 text-primary border-primary/40' : 'text-muted-foreground border-border'}`}
                  >
                    {f.emoji} {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-[12px]">
                  <Switch checked={config.pets} onCheckedChange={(v) => setConfig({ ...config, pets: v })} /> Pets
                </label>
                <label className="flex items-center gap-2 text-[12px]">
                  <Switch checked={config.postConstruction} onCheckedChange={(v) => setConfig({ ...config, postConstruction: v })} /> Post-construction
                </label>
              </div>

              <Button type="button" onClick={generate} className="w-full rounded-xl h-10">
                {areas.length ? 'Regenerate checklist' : 'Generate checklist'}
              </Button>
            </motion.div>

            {/* AREAS */}
            {areas.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm mb-2">Areas ({areas.length})</h3>
                {areas.map((a) => (
                  <AreaAccordion
                    key={a.id}
                    area={a}
                    onChange={(next) => setAreas((prev) => prev.map((x) => (x.id === next.id ? next : x)))}
                    onRemove={() => setAreas((prev) => prev.filter((x) => x.id !== a.id))}
                    onUploadPhoto={handleUpload}
                  />
                ))}
              </div>
            )}

            {/* SUMMARY */}
            {areas.length > 0 && (
              <div className="glass-panel p-4 space-y-3">
                <h3 className="font-semibold text-sm">Pricing summary</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-muted/40 py-2">
                    <p className="text-lg font-bold text-foreground">{pricing.adjustedHours}h</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Labor</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 py-2">
                    <p className="text-lg font-bold text-destructive">{pricing.missingCount}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Missing</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 py-2">
                    <p className="text-lg font-bold text-amber-600">{pricing.damagedCount}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Damaged</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">Service (${config.hourlyRate}/h)</span>
                  <span className="font-semibold">${pricing.laborTotal}</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">Supplies restock</span>
                  <span className="font-semibold">${pricing.suppliesTotal}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="font-semibold">Suggested total</span>
                  <span className="text-xl font-bold text-primary">${pricing.suggestedTotal}</span>
                </div>

                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes for the client…" className="min-h-[70px]" />

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => save('draft')} disabled={createWalkthrough.isPending}>Save draft</Button>
                  <Button className="flex-1 rounded-xl gap-1.5" onClick={() => save('sent')} disabled={createWalkthrough.isPending}>
                    <Send size={14} /> Finish & share
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {isLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" /></div>
            ) : walkthroughs.length === 0 ? (
              <div className="glass-panel p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <ClipboardCheck className="text-emerald-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">No walkthroughs yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Run an on-site visit to inventory the property and get an accurate price.</p>
                <Button className="rounded-xl" onClick={() => setMode('new')}>Start first walkthrough</Button>
              </div>
            ) : (
              walkthroughs.map((wt) => (
                <div key={wt.id} className="glass-panel p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{wt.property_name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{wt.property_address}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {format(parseISO(wt.created_at), 'MMM dd, yyyy')} · {wt.areas.length} areas · {wt.pricing?.missingCount ?? 0} missing
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-primary">${wt.pricing?.suggestedTotal ?? 0}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{wt.status}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <Button size="sm" variant="outline" className="h-8 rounded-lg gap-1 text-[11px]" onClick={() => download(wt)} disabled={downloadingId === wt.id}>
                      {downloadingId === wt.id ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />} PDF
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 rounded-lg gap-1 text-[11px]" onClick={() => copyLink(wt.public_token)}>
                      <Copy size={12} /> Link
                    </Button>
                    <Button size="sm" className="h-8 rounded-lg gap-1 text-[11px]" onClick={() => convertToEstimate(wt)}>
                      <FileText size={12} /> To estimate
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 rounded-lg text-destructive ml-auto" onClick={() => deleteWalkthrough.mutate(wt.id)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
