import { useParams } from 'react-router-dom';
import { usePublicInvoice } from '@/hooks/useInvoices';
import { format } from 'date-fns';
import { CheckCircle, Clock, Loader2, Leaf, Mail, Phone, MapPin, Globe, CreditCard } from 'lucide-react';
import purLogo from '@/assets/pur-logo.png';

export default function PublicInvoice() {
  const { token } = useParams<{ token: string }>();
  const { data: invoice, isLoading, isError } = usePublicInvoice(token);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #f8f6f1 0%, #f0ede6 100%)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#2D5016' }} />
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(180deg, #f8f6f1 0%, #f0ede6 100%)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#2D5016', fontFamily: "'Playfair Display', Georgia, serif" }}>Invoice Not Found</h1>
          <p className="text-gray-500">The link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === 'paid';
  const hasLineItems = invoice.line_items && invoice.line_items.length > 0;
  const subtotal = hasLineItems ? invoice.line_items.reduce((s, li) => s + (li.total || li.rate * li.quantity), 0) : Number(invoice.amount);
  const taxAmount = Number(invoice.tax) || 0;
  const discountAmount = Number(invoice.discount) || 0;
  const total = Number(invoice.amount);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(180deg, #f8f6f1 0%, #f0ede6 100%)', fontFamily: "'Inter', sans-serif" }}>
        <div className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden" style={{ background: '#ffffff', boxShadow: '0 25px 60px -15px rgba(45, 80, 22, 0.12), 0 4px 20px -5px rgba(0,0,0,0.06)' }}>

          {/* Green accent top bar */}
          <div style={{ height: 4, background: 'linear-gradient(90deg, #2D5016, #4A7C2E, #6B9B4E)' }} />

          {/* Header */}
          <div className="px-8 pt-8 pb-6">
            <div className="flex items-start justify-between">
              {/* Company Info */}
              <div>
                <img src={purLogo} alt="Maison Purusa" className="h-12 mb-4 object-contain" />
                <p className="text-xs italic mb-3" style={{ color: '#4A7C2E' }}>Cleaning with Integrity and Respect</p>
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

              {/* Invoice Title + Meta */}
              <div className="text-right">
                <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#2D5016' }}>
                  INVOICE
                </h1>
                {invoice.invoice_number && (
                  <p className="text-sm font-mono font-semibold mb-3" style={{ color: '#2D5016' }}>#{invoice.invoice_number}</p>
                )}
                <div className="space-y-1 text-xs" style={{ color: '#6b7280' }}>
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-medium">Issued:</span>
                    <span>{format(new Date(invoice.created_at), 'MMMM dd, yyyy')}</span>
                  </div>
                  {invoice.due_date && (
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-medium">Due:</span>
                      <span>{invoice.due_date}</span>
                    </div>
                  )}
                  {invoice.service_date && (
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-medium">Service:</span>
                      <span>{invoice.service_date}</span>
                    </div>
                  )}
                </div>

                {/* Status badge */}
                <div className="mt-3">
                  <span
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                    style={{
                      background: isPaid ? 'rgba(45, 80, 22, 0.1)' : 'rgba(217, 119, 6, 0.1)',
                      color: isPaid ? '#2D5016' : '#b45309',
                    }}
                  >
                    {isPaid ? <CheckCircle size={12} /> : <Clock size={12} />}
                    {isPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-8" style={{ height: 1, background: 'linear-gradient(90deg, transparent, #d1d5db, transparent)' }} />

          {/* Billed To */}
          <div className="px-8 py-5">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2D5016' }}>Billed To</p>
            <p className="text-lg font-semibold" style={{ color: '#1f2937' }}>{invoice.client_name}</p>
            {invoice.client_address && (
              <div className="flex items-start gap-1.5 mt-1 text-sm" style={{ color: '#6b7280' }}>
                <MapPin size={12} className="mt-0.5 shrink-0" />
                <span>{invoice.client_address}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-4 mt-1.5">
              {invoice.client_email && (
                <div className="flex items-center gap-1.5 text-sm" style={{ color: '#6b7280' }}>
                  <Mail size={12} />
                  <span>{invoice.client_email}</span>
                </div>
              )}
              {invoice.client_phone && (
                <div className="flex items-center gap-1.5 text-sm" style={{ color: '#6b7280' }}>
                  <Phone size={12} />
                  <span>{invoice.client_phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Services Table */}
          <div className="px-8 pb-6">
            {hasLineItems ? (
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: '#e5e7eb' }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: '#2D5016' }}>
                      <th className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-white">Description</th>
                      <th className="text-center px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-white w-16">Qty</th>
                      <th className="text-right px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-white w-24">Rate</th>
                      <th className="text-right px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-white w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.line_items.map((li, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fafaf7' : '#ffffff' }}>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium" style={{ color: '#1f2937' }}>{li.description || li.service_type}</p>
                          <p className="text-[11px]" style={{ color: '#9ca3af' }}>{li.property_name}{li.address ? ` · ${li.address}` : ''}</p>
                        </td>
                        <td className="text-center px-3 py-3 text-sm" style={{ color: '#4b5563' }}>{li.quantity || 1}</td>
                        <td className="text-right px-3 py-3 text-sm" style={{ color: '#4b5563' }}>${Number(li.rate || li.total).toFixed(2)}</td>
                        <td className="text-right px-4 py-3 text-sm font-semibold" style={{ color: '#1f2937' }}>${(li.total || (li.rate * li.quantity)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : invoice.description ? (
              <div className="p-4 rounded-xl" style={{ background: '#fafaf7', border: '1px solid #e5e7eb' }}>
                <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: '#2D5016' }}>Description</p>
                <p className="text-sm" style={{ color: '#4b5563' }}>{invoice.description}</p>
              </div>
            ) : null}

            {/* Financial Summary */}
            <div className="mt-4 flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm" style={{ color: '#6b7280' }}>
                  <span>Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between text-sm" style={{ color: '#6b7280' }}>
                    <span className="flex items-center gap-1"><Leaf size={12} style={{ color: '#4A7C2E' }} /> Eco Fee</span>
                    <span className="font-medium">+${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm" style={{ color: '#4A7C2E' }}>
                    <span>Discount</span>
                    <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-2" style={{ borderTop: '2px solid #2D5016' }}>
                  <span className="text-sm font-bold uppercase tracking-wider" style={{ color: '#2D5016' }}>Total (USD)</span>
                  <span className="text-2xl font-bold" style={{ color: '#2D5016', fontFamily: "'Playfair Display', Georgia, serif" }}>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Thank you note */}
          {invoice.notes && (
            <div className="mx-8 mb-6 p-4 rounded-xl" style={{ background: 'rgba(45, 80, 22, 0.04)', border: '1px solid rgba(45, 80, 22, 0.1)' }}>
              <p className="text-sm italic text-center leading-relaxed" style={{ color: '#4A7C2E' }}>
                "{invoice.notes}"
              </p>
            </div>
          )}

          {/* Pay Now / Paid */}
          <div className="px-8 pb-6">
            {isPaid ? (
              <div className="w-full py-3.5 rounded-xl text-center font-bold text-sm" style={{ background: 'rgba(45, 80, 22, 0.08)', color: '#2D5016' }}>
                ✓ This invoice has been paid
              </div>
            ) : (
              <div className="space-y-4">
                {/* Zelle CTA */}
                <div className="rounded-xl p-5 text-center" style={{ background: 'linear-gradient(135deg, rgba(45, 80, 22, 0.06), rgba(74, 124, 46, 0.1))', border: '1px solid rgba(45, 80, 22, 0.15)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#2D5016' }}>Pay via Zelle</p>
                  <p className="text-sm mb-3" style={{ color: '#4b5563' }}>Send <strong style={{ color: '#2D5016' }}>${total.toFixed(2)}</strong> to:</p>
                  <div
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: '#2D5016', color: '#ffffff' }}
                    onClick={() => {
                      navigator.clipboard.writeText('payments@maisonpurusa.com');
                      const el = document.getElementById('zelle-copied');
                      if (el) { el.textContent = 'Copied!'; setTimeout(() => { el.textContent = 'Tap to copy'; }, 2000); }
                    }}
                  >
                    <Mail size={16} />
                    <span className="font-semibold text-sm">payments@maisonpurusa.com</span>
                  </div>
                  <p id="zelle-copied" className="text-[10px] mt-2" style={{ color: '#6b7280' }}>Tap to copy</p>
                  <p className="text-[11px] mt-3" style={{ color: '#6b7280' }}>
                    Please include invoice <strong>{invoice.invoice_number || 'number'}</strong> in the memo.
                  </p>
                </div>

                {/* Alternative methods */}
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>Other Payment Methods</p>
                  <div className="space-y-1 text-xs" style={{ color: '#6b7280' }}>
                    <div className="flex items-center justify-center gap-2">
                      <CreditCard size={11} />
                      <span>Credit Card — available at maisonpurusa.com</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm">🏦</span>
                      <span>Check payable to: <strong>Maison Purusa LLC</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-5" style={{ background: '#2D5016' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Leaf size={14} className="text-white/70" />
                <span className="text-[10px] text-white/70 uppercase tracking-wider font-medium">Eco-Innovation & Empowerment Ethos</span>
              </div>
              <span className="text-[10px] text-white/50">
                Maison Purusa LLC · maisonpurusa.com
              </span>
            </div>
            <p className="text-[9px] text-white/40 mt-2 text-center">
              Satisfaction Guaranteed: If you're not satisfied, we'll make it right.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
