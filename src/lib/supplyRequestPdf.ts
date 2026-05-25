import jsPDF from 'jspdf';
import type { SupplyRequest } from '@/hooks/useSupplyRequests';

type RGB = [number, number, number];

const C = {
  emerald: [45, 80, 22] as RGB,
  emeraldMid: [74, 124, 46] as RGB,
  emeraldSoft: [232, 240, 224] as RGB,
  cream: [248, 246, 241] as RGB,
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

interface LoadedLogo { dataUrl: string; width: number; height: number; }

const loadLogo = (): Promise<LoadedLogo | null> =>
  withTimeout(new Promise<LoadedLogo | null>((resolve) => {
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
        resolve({ dataUrl: c.toDataURL('image/png'), width: img.width, height: img.height });
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
  const M = 18;
  let y = M;

  const setText = (c: RGB) => pdf.setTextColor(c[0], c[1], c[2]);
  const setFill = (c: RGB) => pdf.setFillColor(c[0], c[1], c[2]);
  const setDraw = (c: RGB) => pdf.setDrawColor(c[0], c[1], c[2]);

  const drawFooter = () => {
    setDraw(C.stone300);
    pdf.setLineWidth(0.2);
    pdf.line(M, H - 14, W - M, H - 14);
    setText(C.stone500);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Maison Pur · maisonpurusa.com · +1 (941) 330-4713', W / 2, H - 9, { align: 'center' });
  };

  const ensure = (need: number) => {
    if (y + need > H - 22) {
      pdf.addPage();
      y = M;
      drawFooter();
    }
  };

  // ===== HEADER =====
  const logo = await loadLogo();
  setFill(C.emerald);
  pdf.rect(0, 0, W, 3, 'F');

  const logoBoxMax = 24; // mm
  let headerLeftX = M;
  if (logo) {
    const scale = Math.min(logoBoxMax / logo.width, logoBoxMax / logo.height);
    const w = logo.width * scale;
    const h = logo.height * scale;
    const offsetY = (logoBoxMax - h) / 2;
    try {
      pdf.addImage(logo.dataUrl, 'PNG', M, y + offsetY, w, h);
    } catch {}
    headerLeftX = M + logoBoxMax + 6;
  }

  setText(C.stone900);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('MAISON PUR', headerLeftX, y + 11);

  setText(C.emeraldMid);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.text('Luxury Eco-Friendly Cleaning', headerLeftX, y + 16);

  setText(C.emerald);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.text('SUPPLY REQUEST', W - M, y + 11, { align: 'right' });

  setText(C.stone500);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  const shortId = req.id.slice(0, 8).toUpperCase();
  pdf.text(`#${shortId}  ·  ${new Date(req.created_at).toLocaleDateString()}`, W - M, y + 16, { align: 'right' });

  y += 30;

  setDraw(C.emerald);
  pdf.setLineWidth(0.5);
  pdf.line(M, y, W - M, y);
  y += 8;

  // ===== PROPERTY BLOCK =====
  setFill(C.cream);
  pdf.roundedRect(M, y, W - M * 2, 22, 3, 3, 'F');

  setText(C.emeraldMid);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.text('PROPERTY', M + 5, y + 6);

  setText(C.stone900);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text(req.property_name || 'Property', M + 5, y + 13);

  setText(C.stone700);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text(req.property_address || '', M + 5, y + 18.5);

  // Right-aligned: Requested by + date (replaces status badge)
  const rightX = W - M - 5;
  setText(C.emeraldMid);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.text('REQUESTED BY', rightX, y + 6, { align: 'right' });

  setText(C.stone900);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('Maison Pur', rightX, y + 12, { align: 'right' });

  setText(C.stone500);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  const dateLong = new Date(req.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  pdf.text(dateLong, rightX, y + 18.5, { align: 'right' });


  y += 30;

  // ===== ITEMS =====
  setText(C.stone900);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text(`Items Needed`, M, y);
  setText(C.stone500);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`${req.items.length} total`, W - M, y, { align: 'right' });
  y += 6;

  const groups: Record<string, typeof req.items> = {};
  req.items.forEach((it) => {
    const k = it.category || 'General';
    (groups[k] ||= []).push(it);
  });

  const categories = Object.keys(groups).sort();

  for (const cat of categories) {
    ensure(16);
    setFill(C.emerald);
    pdf.roundedRect(M, y, W - M * 2, 8, 2, 2, 'F');
    setText(C.white);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text(cat.toUpperCase(), M + 4, y + 5.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(`${groups[cat].length} item${groups[cat].length > 1 ? 's' : ''}`, W - M - 4, y + 5.5, { align: 'right' });
    y += 12;

    for (const it of groups[cat]) {
      const rowH = it.photo_url ? 24 : 14;
      ensure(rowH);

      const rowTop = y;
      let textX = M + 3;

      if (it.photo_url) {
        const img = await loadImage(it.photo_url);
        if (img) {
          try { pdf.addImage(img, 'JPEG', M + 3, y + 1, 18, 18); } catch {}
          textX = M + 24;
        }
      }

      setText(C.stone900);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10.5);
      pdf.text(it.name, textX, y + 6);

      if (it.note) {
        setText(C.stone500);
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(8);
        const noteLines = pdf.splitTextToSize(it.note, W - M * 2 - 40 - (it.photo_url ? 22 : 0));
        pdf.text(noteLines, textX, y + 11);
      }

      setText(C.emerald);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.text(`${it.qty_needed}`, W - M - 3, y + 7, { align: 'right' });
      setText(C.stone500);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.text((it.unit || 'units').toUpperCase(), W - M - 3, y + 11.5, { align: 'right' });

      y = rowTop + rowH;
      setDraw(C.stone100);
      pdf.setLineWidth(0.2);
      pdf.line(M, y, W - M, y);
      y += 2;
    }

    y += 5;
  }

  // ===== NOTES =====
  if (req.notes && req.notes.trim()) {
    ensure(28);
    setFill(C.cream);
    pdf.roundedRect(M, y, W - M * 2, 24, 3, 3, 'F');
    setFill(C.emeraldMid);
    pdf.rect(M, y, 1.5, 24, 'F');
    setText(C.emeraldMid);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text('NOTES', M + 5, y + 6);
    setText(C.stone700);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    const lines = pdf.splitTextToSize(req.notes, W - M * 2 - 10);
    pdf.text(lines, M + 5, y + 12);
    y += 28;
  }

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
