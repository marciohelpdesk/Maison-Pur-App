import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Download, Phone, Globe } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { usePublicWalkthrough } from '@/hooks/useWalkthroughs';
import { generateWalkthroughPdf } from '@/lib/walkthroughPdf';
import { STATUS_META } from '@/data/walkthroughCatalog';

export default function PublicWalkthrough() {
  const { token } = useParams<{ token: string }>();
  const { data: wt, isLoading, isError } = usePublicWalkthrough(token);
  const [downloading, setDownloading] = useState(false);

  const downloadPdf = async () => {
    if (downloading || !wt) return;
    setDownloading(true);
    try { await generateWalkthroughPdf(wt); }
    catch (e: any) { toast.error(e?.message || 'Could not generate PDF'); }
    finally { setDownloading(false); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #f8f6f1 0%, #f0ede6 100%)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#2D5016' }} />
      </div>
    );
  }

  if (isError || !wt) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(180deg, #f8f6f1 0%, #f0ede6 100%)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#2D5016', fontFamily: "'Playfair Display', Georgia, serif" }}>Walkthrough Not Found</h1>
          <p className="text-gray-500">The link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const all = wt.areas.flatMap((a) => a.items);
  const counts = {
    present: all.filter((i) => i.status === 'present').length,
    missing: all.filter((i) => i.status === 'missing').length,
    damaged: all.filter((i) => i.status === 'damaged').length,
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div className="min-h-screen py-4 sm:py-8 px-2 sm:px-4" style={{ background: 'linear-gradient(180deg, #f8f6f1 0%, #f0ede6 100%)', fontFamily: "'Inter', sans-serif" }}>
        <div className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 25px 60px -15px rgba(45, 80, 22, 0.12)' }}>
          <div style={{ height: 4, background: 'linear-gradient(90deg, #2D5016, #4A7C2E, #6B9B4E)' }} />

          <div className="flex justify-center px-4 sm:px-8 pt-6 pb-3">
            <BrandLogo className="h-14 sm:h-16 object-contain" />
          </div>

          <div className="px-5 sm:px-8 text-center pb-5">
            <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: '#4A7C2E' }}>Property Walkthrough</p>
            <h1 className="text-2xl sm:text-3xl mt-1" style={{ color: '#2D5016', fontFamily: "'Playfair Display', Georgia, serif" }}>{wt.property_name}</h1>
            <p className="text-sm text-gray-500 mt-1">{wt.property_address}</p>
            <p className="text-xs text-gray-400 mt-1">{format(parseISO(wt.created_at), 'MMMM dd, yyyy')} · Inspected by Kamila Petters</p>
          </div>

          <div className="grid grid-cols-3 gap-2 px-5 sm:px-8 pb-6">
            {[
              { label: 'Present', value: counts.present, color: '#2D5016' },
              { label: 'Missing', value: counts.missing, color: '#BE3C32' },
              { label: 'Damaged', value: counts.damaged, color: '#D97706' },
            ].map((c) => (
              <div key={c.label} className="rounded-xl py-3 text-center" style={{ background: '#f5f5f4' }}>
                <p className="text-xl font-bold" style={{ color: c.color }}>{c.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-gray-500">{c.label}</p>
              </div>
            ))}
          </div>

          <div className="px-5 sm:px-8 pb-6 space-y-4">
            {wt.areas.map((area) => (
              <div key={area.id}>
                <div className="rounded-lg px-3 py-2 mb-2 flex items-center justify-between" style={{ background: '#2D5016' }}>
                  <span className="text-white text-sm font-semibold">{area.emoji} {area.label}</span>
                  <span className="text-white/70 text-[11px] uppercase">{area.condition}</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {area.items.filter((i) => i.status !== 'na').map((it) => (
                    <div key={it.id} className="flex items-center gap-3 py-2">
                      {it.photo_url && <img src={it.photo_url} alt={it.name} className="w-11 h-11 rounded-md object-cover" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-gray-800 truncate">{it.name}</p>
                        {it.note && <p className="text-[11px] text-gray-400 italic truncate">{it.note}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[11px] font-semibold" style={{ color: it.status === 'present' ? '#2D5016' : it.status === 'damaged' ? '#D97706' : '#BE3C32' }}>
                          {STATUS_META[it.status].label}
                        </p>
                        <p className="text-[10px] text-gray-400">{it.found}/{it.ideal} {it.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {wt.pricing?.suggestedTotal != null && (
            <div className="mx-5 sm:mx-8 mb-6 rounded-xl p-4" style={{ background: '#f8f6f1', borderLeft: '3px solid #4A7C2E' }}>
              <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: '#4A7C2E' }}>Suggested pricing</p>
              <div className="flex items-end justify-between mt-2">
                <div className="text-[13px] text-gray-600 space-y-0.5">
                  <p>Estimated labor: {wt.pricing.adjustedHours}h</p>
                  <p>Service: ${wt.pricing.laborTotal}</p>
                  <p>Supplies to restock: ${wt.pricing.suppliesTotal}</p>
                </div>
                <p className="text-3xl font-bold" style={{ color: '#2D5016' }}>${wt.pricing.suggestedTotal}</p>
              </div>
            </div>
          )}

          {wt.notes && (
            <div className="mx-5 sm:mx-8 mb-6 rounded-xl p-4" style={{ background: '#f8f6f1' }}>
              <p className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: '#4A7C2E' }}>Notes</p>
              <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{wt.notes}</p>
            </div>
          )}

          <div className="px-5 sm:px-8 pb-6">
            <Button onClick={downloadPdf} disabled={downloading} className="w-full h-11 rounded-xl gap-2" style={{ background: '#2D5016' }}>
              {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Download PDF
            </Button>
          </div>

          <div className="px-5 sm:px-8 py-4 text-center border-t border-gray-100">
            <p className="text-[11px] text-gray-400 flex items-center justify-center gap-3">
              <span className="flex items-center gap-1"><Globe size={11} /> maisonpurusa.com</span>
              <span className="flex items-center gap-1"><Phone size={11} /> +1 (941) 330-4713</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
