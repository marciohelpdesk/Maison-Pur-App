import jsPDF from 'jspdf';
import type { Walkthrough } from '@/hooks/useWalkthroughs';
import { STATUS_META } from '@/data/walkthroughCatalog';

type RGB = [number, number, number];

const C = {
  emerald: [45, 80, 22] as RGB,
  emeraldMid: [74, 124, 46] as RGB,
  cream: [248, 246, 241] as RGB,
  stone900: [28, 25, 23] as RGB,
  stone700: [68, 64, 60] as RGB,
  stone500: [120, 113, 108] as RGB,
  stone300: [214, 211, 209] as RGB,
  stone100: [245, 245, 244] as RGB,
  amber: [217, 119, 6] as RGB,
  red: [190, 60, 50] as RGB,
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
        c.width = img.width; c.height = img.height;
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
        c.width = img.width * ratio; c.height = img.height * ratio;
        const ctx = c.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.7));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  }), 5000);

export async function buildWalkthroughPdfBlob(wt: Walkthrough): Promise<{ blob: Blob; filename: string }> {
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
    if (y + need > H - 22) { pdf.addPage(); y = M; drawFooter(); }
  };

  // HEADER
  const logo = await loadLogo();
  setFill(C.emerald);
  pdf.rect(0, 0, W, 3, 'F');

  const box = 24;
  let leftX = M;
  if (logo) {
    const scale = Math.min(box / logo.width, box / logo.height);
    const w = logo.width * scale, h = logo.height * scale;
    try { pdf.addImage(logo.dataUrl, 'PNG', M, y + (box - h) / 2, w, h); } catch {}
    leftX = M + box + 6;
  }

  setText(C.stone900);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('MAISON PUR', leftX, y + 11);
  setText(C.emeraldMid);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.text('Luxury Eco-Friendly Cleaning', leftX, y + 16);

  setText(C.emerald);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.text('PROPERTY WALKTHROUGH', W - M, y + 11, { align: 'right' });
  const shortId = wt.id.slice(0, 8).toUpperCase();
  setText(C.stone500);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.text(`#${shortId}  ·  ${new Date(wt.created_at).toLocaleDateString()}`, W - M, y + 16, { align: 'right' });

  y += 30;
  setDraw(C.emerald);
  pdf.setLineWidth(0.5);
  pdf.line(M, y, W - M, y);
  y += 8;

  // PROPERTY BLOCK
  setFill(C.cream);
  pdf.roundedRect(M, y, W - M * 2, 22, 3, 3, 'F');
  setText(C.emeraldMid);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.text('PROPERTY', M + 5, y + 6);
  setText(C.stone900);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.text(wt.property_name || 'Property', M + 5, y + 13);
  setText(C.stone700);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text(wt.property_address || '', M + 5, y + 18.5);

  const rightX = W - M - 5;
  setText(C.emeraldMid);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.text('INSPECTED BY', rightX, y + 6, { align: 'right' });
  setText(C.stone900);
  pdf.setFontSize(10);
  pdf.text('Kamila Petters', rightX, y + 12, { align: 'right' });
  setText(C.stone500);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.text(new Date(wt.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), rightX, y + 18.5, { align: 'right' });
  y += 30;

  // SUMMARY
  const all = wt.areas.flatMap((a) => a.items);
  const present = all.filter((i) => i.status === 'present').length;
  const missing = all.filter((i) => i.status === 'missing').length;
  const damaged = all.filter((i) => i.status === 'damaged').length;

  const cards: { label: string; value: string; color: RGB }[] = [
    { label: 'PRESENT', value: String(present), color: C.emeraldMid },
    { label: 'MISSING', value: String(missing), color: C.red },
    { label: 'DAMAGED', value: String(damaged), color: C.amber },
    { label: 'AREAS', value: String(wt.areas.length), color: C.stone700 },
  ];
  const cw = (W - M * 2 - 9) / 4;
  cards.forEach((c, i) => {
    const x = M + i * (cw + 3);
    setFill(C.stone100);
    pdf.roundedRect(x, y, cw, 18, 2.5, 2.5, 'F');
    setText(c.color);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.text(c.value, x + cw / 2, y + 9, { align: 'center' });
    setText(C.stone500);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.text(c.label, x + cw / 2, y + 14.5, { align: 'center' });
  });
  y += 26;

  // AREAS
  for (const area of wt.areas) {
    ensure(18);
    setFill(C.emerald);
    pdf.roundedRect(M, y, W - M * 2, 8, 2, 2, 'F');
    setText(C.white);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.text(area.label.toUpperCase(), M + 4, y + 5.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(`condition: ${area.condition}`, W - M - 4, y + 5.5, { align: 'right' });
    y += 11;

    for (const it of area.items) {
      if (it.status === 'na') continue;
      const rowH = it.photo_url ? 22 : 11;
      ensure(rowH + 3);
      const top = y;
      let textX = M + 3;

      if (it.photo_url) {
        const img = await loadImage(it.photo_url);
        if (img) {
          try { pdf.addImage(img, 'JPEG', M + 3, y + 1, 17, 17); } catch {}
          textX = M + 23;
        }
      }

      setText(C.stone900);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text(it.name, textX, y + 6);

      if (it.note) {
        setText(C.stone500);
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(8);
        pdf.text(pdf.splitTextToSize(it.note, W - M * 2 - 60), textX, y + 10.5);
      }

      const statusColor = it.status === 'present' ? C.emeraldMid : it.status === 'damaged' ? C.amber : C.red;
      setText(statusColor);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.text(STATUS_META[it.status].label.toUpperCase(), W - M - 3, y + 5, { align: 'right' });
      setText(C.stone500);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.text(`${it.found}/${it.ideal} ${(it.unit || '').toUpperCase()}`, W - M - 3, y + 9.5, { align: 'right' });

      y = top + rowH;
      setDraw(C.stone100);
      pdf.setLineWidth(0.2);
      pdf.line(M, y, W - M, y);
      y += 2;
    }
    y += 5;
  }

  // PRICING
  const p = wt.pricing || ({} as any);
  if (p.suggestedTotal != null) {
    ensure(40);
    setFill(C.cream);
    pdf.roundedRect(M, y, W - M * 2, 36, 3, 3, 'F');
    setFill(C.emeraldMid);
    pdf.rect(M, y, 1.5, 36, 'F');
    setText(C.emeraldMid);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text('SUGGESTED PRICING', M + 5, y + 7);

    setText(C.stone700);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    pdf.text(`Estimated labor: ${p.adjustedHours ?? 0} h`, M + 5, y + 15);
    pdf.text(`Service: $${(p.laborTotal ?? 0).toFixed(0)}`, M + 5, y + 21);
    pdf.text(`Supplies to restock: $${(p.suppliesTotal ?? 0).toFixed(0)}`, M + 5, y + 27);

    setText(C.emerald);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text(`$${(p.suggestedTotal ?? 0).toFixed(0)}`, W - M - 5, y + 22, { align: 'right' });
    setText(C.stone500);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.text('TOTAL ESTIMATE', W - M - 5, y + 27, { align: 'right' });
    y += 42;
  }

  // NOTES
  if (wt.notes && wt.notes.trim()) {
    ensure(28);
    setFill(C.cream);
    pdf.roundedRect(M, y, W - M * 2, 24, 3, 3, 'F');
    setText(C.emeraldMid);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text('NOTES', M + 5, y + 6);
    setText(C.stone700);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    pdf.text(pdf.splitTextToSize(wt.notes, W - M * 2 - 10), M + 5, y + 12);
    y += 28;
  }

  drawFooter();

  const slug = (wt.property_name || 'maison-pur').replace(/\s+/g, '-').toLowerCase();
  return { blob: pdf.output('blob') as Blob, filename: `walkthrough-${slug}-${shortId}.pdf` };
}

export async function generateWalkthroughPdf(wt: Walkthrough): Promise<void> {
  const { blob, filename } = await buildWalkthroughPdfBlob(wt);
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
