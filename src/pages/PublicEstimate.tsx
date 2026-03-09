import { useParams } from 'react-router-dom';
import { usePublicEstimate } from '@/hooks/useEstimates';
import { format } from 'date-fns';
import { Loader2, Leaf, Mail, Phone, MapPin, Globe, Droplets, FileEdit, Send, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

const STATUS_DISPLAY: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  draft: { label: 'Draft', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', icon: FileEdit },
  sent: { label: 'Sent', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)', icon: Send },
  accepted: { label: 'Accepted', color: '#2D5016', bg: 'rgba(45, 80, 22, 0.1)', icon: CheckCircle },
  declined: { label: 'Declined', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.1)', icon: XCircle },
};

export default function PublicEstimate() {
  const { token } = useParams<{ token: string }>();
  const { data: estimate, isLoading, isError } = usePublicEstimate(token);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #f8f6f1 0%, #f0ede6 100%)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#2D5016' }} />
      </div>
    );
  }

  if (isError || !estimate) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(180deg, #f8f6f1 0%, #f0ede6 100%)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#2D5016', fontFamily: "'Playfair Display', Georgia, serif" }}>Estimate Not Found</h1>
          <p className="text-gray-500">The link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_DISPLAY[estimate.status] || STATUS_DISPLAY.draft;
  const StatusIcon = statusCfg.icon;
  const hasLineItems = estimate.line_items && estimate.line_items.length > 0;
  const subtotal = hasLineItems ? estimate.line_items.reduce((s: number, li: any) => s + (li.total || li.rate * li.quantity), 0) : Number(estimate.amount);
  const taxAmount = Number(estimate.tax) || 0;
  const discountAmount = Number(estimate.discount) || 0;
  const total = Number(estimate.amount);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <div className="min-h-screen py-4 sm:py-8 px-2 sm:px-4" style={{ background: 'linear-gradient(180deg, #f8f6f1 0%, #f0ede6 100%)', fontFamily: "'Inter', sans-serif" }}>
        <div className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden" style={{ background: '#ffffff', boxShadow: '0 25px 60px -15px rgba(45, 80, 22, 0.12), 0 4px 20px -5px rgba(0,0,0,0.06)' }}>

          {/* Blue accent top bar (different from invoice green) */}
          <div style={{ height: 4, background: 'linear-gradient(90deg, #1e40af, #3b82f6, #60a5fa)' }} />

          {/* Estimate Notice */}
          <div className="mx-4 sm:mx-8 mt-4 p-3 rounded-xl flex items-center gap-2" style={{ background: 'rgba(37, 99, 235, 0.06)', border: '1px solid rgba(37, 99, 235, 0.15)' }}>
            <AlertTriangle size={14} style={{ color: '#2563eb' }} />
            <p className="text-xs font-medium" style={{ color: '#2563eb' }}>This is an estimate, not an invoice. Prices may vary.</p>
          </div>

          {/* Centered Logo */}
          <div className="flex justify-center px-4 sm:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4">
            <BrandLogo className="h-14 sm:h-16 object-contain" />
          </div>

          {/* Header */}
          <div className="px-4 sm:px-8 pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0">
              <div>
                <p className="text-xs italic mb-2 sm:mb-3" style={{ color: '#4A7C2E' }}>Cleaning with Integrity and Respect</p>
                <div className="space-y-1 text-xs" style={{ color: '#6b7280' }}>
                  <p>3451 Queens St, Suite 925</p>
                  <p>Sarasota, FL 34231</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Phone size={10} />
                    <span>+1 (941) 330-4713</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe size={10} />
                    <a href="https://maisonpurusa.com" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">maisonpurusa.com</a>
                  </div>
                </div>
              </div>

              <div className="sm:text-right">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#1e40af' }}>
                  ESTIMATE
                </h1>
                {estimate.estimate_number && (
                  <p className="text-sm font-mono font-semibold mb-2 sm:mb-3" style={{ color: '#1e40af' }}>#{estimate.estimate_number}</p>
                )}
                <div className="space-y-1 text-xs" style={{ color: '#6b7280' }}>
                  <div className="flex items-center sm:justify-end gap-2">
                    <span className="font-medium">Issued:</span>
                    <span>{format(new Date(estimate.created_at), 'MMMM dd, yyyy')}</span>
                  </div>
                  {estimate.valid_until && (
                    <div className="flex items-center sm:justify-end gap-2">
                      <span className="font-medium">Valid Until:</span>
                      <span>{estimate.valid_until}</span>
                    </div>
                  )}
                  {estimate.service_date && (
                    <div className="flex items-center sm:justify-end gap-2">
                      <span className="font-medium">Service:</span>
                      <span>{estimate.service_date}</span>
                    </div>
                  )}
                </div>

                {/* Status badge */}
                <div className="mt-3">
                  <span
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                    style={{ background: statusCfg.bg, color: statusCfg.color }}
                  >
                    <StatusIcon size={12} />
                    {statusCfg.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-4 sm:mx-8" style={{ height: 1, background: 'linear-gradient(90deg, transparent, #d1d5db, transparent)' }} />

          {/* Prepared For */}
          <div className="mx-4 sm:mx-8 my-4 sm:my-5 pl-4 py-3 rounded-r-xl" style={{ borderLeft: '3px solid #1e40af', background: 'rgba(37, 99, 235, 0.02)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#1e40af' }}>Prepared For</p>
            <p className="text-base sm:text-lg font-semibold" style={{ color: '#1f2937' }}>{estimate.client_name}</p>
            {estimate.client_address && (
              <div className="flex items-start gap-1.5 mt-1 text-sm" style={{ color: '#6b7280' }}>
                <MapPin size={12} className="mt-0.5 shrink-0" />
                <span>{estimate.client_address}</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-4 mt-1.5">
              {estimate.client_email && (
                <div className="flex items-center gap-1.5 text-sm" style={{ color: '#6b7280' }}>
                  <Mail size={12} />
                  <span className="break-all">{estimate.client_email}</span>
                </div>
              )}
              {estimate.client_phone && (
                <div className="flex items-center gap-1.5 text-sm" style={{ color: '#6b7280' }}>
                  <Phone size={12} />
                  <span>{estimate.client_phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          <div className="px-4 sm:px-8 pb-4 sm:pb-6">
            {hasLineItems ? (
              <>
                {/* Desktop Table */}
                <div className="hidden sm:block rounded-xl overflow-hidden border" style={{ borderColor: '#e5e7eb' }}>
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: '#1e40af' }}>
                        <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-white">Description</th>
                        <th className="text-center px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-white w-20">Date</th>
                        <th className="text-center px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-white w-12">Qty</th>
                        <th className="text-right px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-white w-20">Rate</th>
                        <th className="text-right px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-white w-20">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...estimate.line_items].sort((a: any, b: any) => (a.service_date || '').localeCompare(b.service_date || '')).map((li: any, i: number) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fafaf7' : '#ffffff' }}>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium" style={{ color: '#1f2937' }}>{li.property_name || li.description || li.service_type}</p>
                            {li.property_name && <p className="text-[11px]" style={{ color: '#9ca3af' }}>{li.description}{li.address ? ` · ${li.address}` : ''}</p>}
                          </td>
                          <td className="text-center px-3 py-3 text-[11px] font-medium" style={{ color: '#4b5563' }}>
                            {li.service_date ? format(new Date(li.service_date + 'T12:00:00'), 'MMM dd') : '—'}
                          </td>
                          <td className="text-center px-3 py-3 text-sm" style={{ color: '#4b5563' }}>{li.quantity || 1}</td>
                          <td className="text-right px-3 py-3 text-sm" style={{ color: '#4b5563' }}>${Number(li.rate || li.total).toFixed(2)}</td>
                          <td className="text-right px-4 py-3 text-sm font-semibold" style={{ color: '#1f2937' }}>${(li.total || (li.rate * li.quantity)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card Layout */}
                <div className="block sm:hidden space-y-2">
                  {[...estimate.line_items].sort((a: any, b: any) => (a.service_date || '').localeCompare(b.service_date || '')).map((li: any, i: number) => (
                    <div key={i} className="rounded-xl p-3.5" style={{ background: i % 2 === 0 ? '#fafaf7' : '#ffffff', border: '1px solid #e5e7eb' }}>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold leading-tight" style={{ color: '#1f2937' }}>{li.property_name || li.description || li.service_type}</p>
                          {li.property_name && (
                            <p className="text-[11px] mt-0.5 leading-tight" style={{ color: '#9ca3af' }}>{li.description}{li.address ? ` · ${li.address}` : ''}</p>
                          )}
                        </div>
                        <p className="text-base font-bold shrink-0" style={{ color: '#1e40af' }}>${(li.total || (li.rate * li.quantity)).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-3 text-[11px]" style={{ color: '#6b7280' }}>
                        {li.service_date && <span>{format(new Date(li.service_date + 'T12:00:00'), 'MMM dd, yyyy')}</span>}
                        <span>Qty: {li.quantity || 1}</span>
                        <span>${Number(li.rate || li.total).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : estimate.description ? (
              <div className="p-4 rounded-xl" style={{ background: '#fafaf7', border: '1px solid #e5e7eb' }}>
                <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: '#1e40af' }}>Description</p>
                <p className="text-sm" style={{ color: '#4b5563' }}>{estimate.description}</p>
              </div>
            ) : null}

            <div className="my-4" style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(30, 64, 175, 0.15), transparent)' }} />

            {/* Financial Summary */}
            <div className="flex justify-end">
              <div className="w-full sm:w-64 space-y-2">
                <div className="flex justify-between text-sm" style={{ color: '#6b7280' }}>
                  <span>Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between text-sm" style={{ color: '#6b7280' }}>
                    <span className="flex items-center gap-1"><Leaf size={12} style={{ color: '#4A7C2E' }} /> Tax</span>
                    <span className="font-medium">+${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm" style={{ color: '#4A7C2E' }}>
                    <span>Discount</span>
                    <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-2" style={{ borderTop: '2px solid #1e40af' }}>
                  <span className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1e40af' }}>Estimated Total (USD)</span>
                  <span className="text-xl sm:text-2xl font-bold" style={{ color: '#1e40af', fontFamily: "'Playfair Display', Georgia, serif" }}>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {estimate.notes && (
            <div className="mx-4 sm:mx-8 mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl" style={{ background: 'rgba(37, 99, 235, 0.04)', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
              <p className="text-sm italic text-center leading-relaxed" style={{ color: '#2563eb' }}>
                "{estimate.notes}"
              </p>
            </div>
          )}

          {/* Contact CTA */}
          <div className="px-4 sm:px-8 pb-4 sm:pb-6">
            <div className="rounded-xl p-4 sm:p-5 text-center" style={{ background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.06), rgba(59, 130, 246, 0.1))', border: '1px solid rgba(30, 64, 175, 0.15)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#1e40af' }}>Questions about this estimate?</p>
              <p className="text-sm mb-3" style={{ color: '#4b5563' }}>Contact us to discuss or approve this estimate.</p>
              <div
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: '#1e40af', color: '#ffffff' }}
                onClick={() => {
                  navigator.clipboard.writeText('9413304713');
                  const el = document.getElementById('phone-copied');
                  if (el) { el.textContent = 'Copied!'; setTimeout(() => { el.textContent = 'Tap to copy'; }, 2000); }
                }}
              >
                <Phone size={16} />
                <span className="font-semibold text-sm">(941) 330-4713</span>
              </div>
              <p id="phone-copied" className="text-[10px] mt-2" style={{ color: '#6b7280' }}>Tap to copy</p>
            </div>
          </div>

          {/* Thank You */}
          <div className="px-4 sm:px-8 pb-4 sm:pb-5 text-center">
            <p className="text-sm italic" style={{ color: '#4A7C2E' }}>Thank you for considering Maison Pur.</p>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-8 py-4 sm:py-5" style={{ background: '#1e40af' }}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <Droplets size={14} className="text-white/70" />
                <span className="text-[10px] text-white/70 uppercase tracking-wider font-medium">Cleaning with Integrity and Respect</span>
              </div>
              <span className="text-[10px] text-white/50">Maison Pur LLC · maisonpurusa.com</span>
            </div>
            <p className="text-[9px] text-white/40 mt-2 text-center">
              This estimate is subject to change based on final assessment. Prices valid for the period indicated above.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
