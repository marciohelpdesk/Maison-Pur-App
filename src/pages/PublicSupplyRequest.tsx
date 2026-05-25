import { useParams } from 'react-router-dom';
import { Loader2, Phone, Globe, Package, Download } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { BrandLogo } from '@/components/BrandLogo';
import { usePublicSupplyRequest } from '@/hooks/useSupplyRequests';
import { Button } from '@/components/ui/button';
import { generateSupplyRequestPdf } from '@/lib/supplyRequestPdf';
import { toast } from 'sonner';

export default function PublicSupplyRequest() {
  const { token } = useParams<{ token: string }>();
  const { data: req, isLoading, isError } = usePublicSupplyRequest(token);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #f8f6f1 0%, #f0ede6 100%)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#2D5016' }} />
      </div>
    );
  }

  if (isError || !req) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(180deg, #f8f6f1 0%, #f0ede6 100%)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#2D5016', fontFamily: "'Playfair Display', Georgia, serif" }}>
            Request Not Found
          </h1>
          <p className="text-gray-500">The link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const shareWhatsApp = () => {
    const lines = req.items.map(i => `• ${i.name} — ${i.qty_needed} ${i.unit || ''}`).join('\n');
    const text = `Maison Pur – Supply request for ${req.property_name}\n\n${lines}\n\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <div className="min-h-screen py-4 sm:py-8 px-2 sm:px-4" style={{ background: 'linear-gradient(180deg, #f8f6f1 0%, #f0ede6 100%)', fontFamily: "'Inter', sans-serif" }}>
        <div className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden" style={{ background: '#ffffff', boxShadow: '0 25px 60px -15px rgba(45, 80, 22, 0.12)' }}>
          <div style={{ height: 4, background: 'linear-gradient(90deg, #2D5016, #4A7C2E, #6B9B4E)' }} />

          <div className="flex justify-center px-4 sm:px-8 pt-6 sm:pt-8 pb-3">
            <BrandLogo className="h-14 sm:h-16 object-contain" />
          </div>

          <div className="px-4 sm:px-8 pb-4">
            <div className="text-center">
              <p className="text-xs italic mb-2" style={{ color: '#4A7C2E' }}>Cleaning with Integrity and Respect</p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#2D5016' }}>
                Supply Request
              </h1>
              <p className="text-sm text-gray-500">{format(parseISO(req.created_at), 'MMMM dd, yyyy')}</p>
            </div>
          </div>

          <div className="px-4 sm:px-8 pb-4">
            <div className="rounded-xl p-4" style={{ background: '#f8f6f1' }}>
              <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: '#4A7C2E' }}>Property</p>
              <p className="text-base font-bold" style={{ color: '#2D5016' }}>{req.property_name}</p>
              <p className="text-sm text-gray-600">{req.property_address}</p>
            </div>
          </div>

          <div className="px-4 sm:px-8 pb-4">
            <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: '#4A7C2E' }}>
              Items needed ({req.items.length})
            </p>
            <div className="rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-200">
              {req.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white">
                  {item.photo_url ? (
                    <img src={item.photo_url} alt={item.name} className="w-12 h-12 rounded-md object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                      <Package size={16} className="text-gray-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                    {item.category && <p className="text-[11px] text-gray-500">{item.category}</p>}
                    {item.note && <p className="text-[11px] text-gray-600 mt-0.5">{item.note}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold" style={{ color: '#2D5016' }}>{item.qty_needed}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{item.unit || 'units'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {req.notes && (
            <div className="px-4 sm:px-8 pb-4">
              <div className="rounded-xl p-3 border-l-4 text-sm text-gray-700" style={{ background: '#f8f6f1', borderColor: '#4A7C2E' }}>
                {req.notes}
              </div>
            </div>
          )}

          <div className="px-4 sm:px-8 pb-6">
            <Button onClick={shareWhatsApp} className="w-full h-11 rounded-lg gap-2" style={{ background: '#2D5016' }}>
              <Share2 size={16} /> Share via WhatsApp
            </Button>
          </div>

          <div className="px-4 sm:px-8 py-4 border-t border-gray-100 text-center text-xs text-gray-500 space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              <Phone size={11} />
              <span>+1 (941) 330-4713</span>
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Globe size={11} />
              <a href="https://maisonpurusa.com" target="_blank" rel="noreferrer" className="underline">maisonpurusa.com</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
