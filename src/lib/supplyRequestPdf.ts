import jsPDF from 'jspdf';
import type { SupplyRequest } from '@/hooks/useSupplyRequests';

type RGB = [number, number, number];

const C = {
  emerald: [16, 122, 87] as RGB,
  emeraldLight: [220, 240, 230] as RGB,
  stone900: [28, 25, 23] as RGB,
  stone700: [68, 64, 60] as RGB,
  stone500: [120, 113, 108] as RGB,
  stone300: [214, 211, 209] as RGB,
  stone100: [245, 245, 244] as RGB,
  amber: [217, 119, 6] as RGB,
  white: [255, 255, 255] as RGB,
};

const withTimeout = <T>(p: Promise<T>, ms: number): Promise<T | null> =>
  new Promise((resolve) => {
    const t = setTimeout(() => resolve(null), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }).catch(() => { clearTimeout(t); resolve(null); });
  });

const loadLogo = (): Promise<string | null> =>
  withTimeout(new Promise<string | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        resolve(c.toDataURL('image/png'));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = `${window.location.origin}/logo-512.png`;
  }), 5000);

const loadImage = (url: string): Promise<string | null> =>
  withTimeout(new Promise<string | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const max = 400;
        const ratio = Math.min(max / img.width, max / img.height, 1);
        const c = document.createElement('canvas');
        c.width = img.width * ratio;
        c.height = img.height * ratio;
        const ctx = c.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.7));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  }), 5000);

export async function buildSupplyRequestPdfBlob(req: SupplyRequest): Promise<{ blob: Blob; filename: string }> {


  const pdf = new jsPDF('p', 'mm', 'a4');
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const M = 16;
  let y = M;

  const setText = (c: RGB) => pdf.setTextColor(c[0], c[1], c[2]);
  const setFill = (c: RGB) => pdf.setFillColor(c[0], c[1], c[2]);
  const setDraw = (c: RGB) => pdf.setDrawColor(c[0], c[1], c[2]);

  const drawFooter = () => {
    setText(C.stone500);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Maison Pur · maisonpur.lovable.app · +1 (941) 330-4713', W / 2, H - 8, { align: 'center' });
  };

  const ensure = (need: number) => {
    if (y + need > H - 20) {
      pdf.addPage();
      y = M;
      drawFooter();
    }
  };

  // ===== HEADER =====
  const logo = await loadLogo();
  setFill(C.emerald);
  pdf.rect(0, 0, W, 4, 'F');

  if (logo) {
    try { pdf.addImage(logo, 'PNG', M, y, 18, 18); } catch {}
  }

  setText(C.stone900);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text('MAISON PUR', M + 22, y + 9);

  setText(C.stone500);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.text('Luxury Eco-Friendly Cleaning', M + 22, y + 14);
  pdf.text('maisonpur.lovable.app · +1 (941) 330-4713', M + 22, y + 18);

  setText(C.emerald);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.text('SUPPLY REQUEST', W - M, y + 9, { align: 'right' });

  setText(C.stone500);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  const shortId = req.id.slice(0, 8).toUpperCase();
  pdf.text(`#${shortId}`, W - M, y + 14, { align: 'right' });
  pdf.text(new Date(req.created_at).toLocaleDateString(), W - M, y + 18, { align: 'right' });

  y += 26;

  setDraw(C.emerald);
  pdf.setLineWidth(0.6);
  pdf.line(M, y, W - M, y);
  y += 6;

  // ===== PROPERTY BLOCK =====
  setFill(C.stone100);
  pdf.roundedRect(M, y, W - M * 2, 18, 2, 2, 'F');

  setText(C.stone500);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.text('PROPERTY', M + 4, y + 5);

  setText(C.stone900);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text(req.property_name || 'Property', M + 4, y + 11);

  setText(C.stone700);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text(req.property_address || '', M + 4, y + 15.5);

  const statusLabel = req.status.toUpperCase();
  const badgeW = 30;
  setFill(req.status === 'fulfilled' ? C.emerald : C.amber);
  pdf.roundedRect(W - M - badgeW - 4, y + 5, badgeW, 6, 1.5, 1.5, 'F');
  setText(C.white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.text(statusLabel, W - M - 4 - badgeW / 2, y + 9, { align: 'center' });

  y += 24;

  // ===== ITEMS =====
  setText(C.stone900);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text(`Items Needed (${req.items.length})`, M, y);
  y += 5;

  const groups: Record<string, typeof req.items> = {};
  req.items.forEach((it) => {
    const k = it.category || 'General';
    (groups[k] ||= []).push(it);
  });

  const categories = Object.keys(groups).sort();

  for (const cat of categories) {
    ensure(14);
    setFill(C.emeraldLight);
    pdf.roundedRect(M, y, W - M * 2, 7, 1.5, 1.5, 'F');
    setText(C.emerald);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text(cat.toUpperCase(), M + 3, y + 4.8);
    setText(C.stone500);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${groups[cat].length} item${groups[cat].length > 1 ? 's' : ''}`, W - M - 3, y + 4.8, { align: 'right' });
    y += 10;

    setText(C.stone500);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.text('ITEM', M + 2, y);
    pdf.text('QTY NEEDED', W - M - 2, y, { align: 'right' });
    y += 2;
    setDraw(C.stone300);
    pdf.setLineWidth(0.2);
    pdf.line(M, y, W - M, y);
    y += 3;

    for (const it of groups[cat]) {
      ensure(it.photo_url ? 26 : 12);

      const rowTop = y;
      let textX = M + 2;

      if (it.photo_url) {
        const img = await loadImage(it.photo_url);
        if (img) {
          try { pdf.addImage(img, 'JPEG', M + 2, y, 18, 18); } catch {}
          textX = M + 22;
        }
      }

      setText(C.stone900);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text(it.name, textX, y + 4);

      if (it.note) {
        setText(C.stone500);
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(8);
        const noteLines = pdf.splitTextToSize(it.note, W - M * 2 - 30 - (it.photo_url ? 20 : 0));
        pdf.text(noteLines, textX, y + 9);
      }

      setText(C.emerald);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text(`${it.qty_needed} ${it.unit || ''}`.trim(), W - M - 2, y + 5, { align: 'right' });

      y = rowTop + (it.photo_url ? 22 : 9);
      setDraw(C.stone100);
      pdf.setLineWidth(0.2);
      pdf.line(M, y, W - M, y);
      y += 2;
    }

    y += 4;
  }

  // ===== NOTES =====
  if (req.notes && req.notes.trim()) {
    ensure(24);
    setFill(C.stone100);
    pdf.roundedRect(M, y, W - M * 2, 20, 2, 2, 'F');
    setText(C.stone500);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text('NOTES', M + 4, y + 5);
    setText(C.stone700);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const lines = pdf.splitTextToSize(req.notes, W - M * 2 - 8);
    pdf.text(lines, M + 4, y + 10);
    y += 24;
  }

  // ===== PUBLIC LINK =====
  ensure(16);
  const url = `https://maisonpur.lovable.app/supplies/${req.public_token}`;
  setText(C.stone500);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text('View live online:', M, y);
  y += 4;
  setText(C.emerald);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.textWithLink(url, M, y, { url });

  drawFooter();

  const slug = (req.property_name || 'maison-pur').replace(/\s+/g, '-').toLowerCase();
  const filename = `supply-request-${slug}-${shortId}.pdf`;
  const blob = pdf.output('blob') as Blob;
  return { blob, filename };
}

export async function generateSupplyRequestPdf(
  req: SupplyRequest,
  _opts: { mode?: 'save' | 'open' } = {},
): Promise<void> {
  const { blob, filename } = await buildSupplyRequestPdfBlob(req);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}


