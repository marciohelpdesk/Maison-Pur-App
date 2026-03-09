import { useParams } from 'react-router-dom';
import { usePublicReport, ReportRoom, ReportPhoto, CleaningReport } from '@/hooks/useReports';
import jsPDF from 'jspdf';
import { useState, useCallback, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { enUS, ptBR, ko, th, es } from 'date-fns/locale';
import { BrandLogo } from '@/components/BrandLogo';
import { BRAND_OG_IMAGE } from '@/lib/brand';

// ─── Translations ───
const translations: Record<string, Record<string, string>> = {
  en: {
    subtitle: 'YOUR TIME MATTERS, WE HANDLE CLEANING',
    rooms: 'Rooms', date: 'Date', visitReport: 'Visit Report',
    messenger: 'iMessage', website: 'Website', bookNext: 'Book Next',
    checklist: 'Checklist', damages: 'Damages Reported', lostFound: 'Lost & Found',
    footerQuote: 'Your time matters, we handle cleaning',
    notFound: 'Report not found',
    notFoundDesc: 'This link may be invalid or the report has not been published yet.',
    severity: 'Severity', location: 'Location',
    completion: 'Completion', photos: 'Photos', duration: 'Duration',
    incidents: 'Incidents', tasks: 'Tasks', beforeAfter: 'Before & After',
    before: 'Before', after: 'After', noIncidents: 'No incidents',
    contact: 'Contact', poweredBy: 'Powered by',
    minutes: 'min', overview: 'Overview',
    downloadPdf: 'Download PDF', generating: 'Generating...',
  },
  pt: {
    subtitle: 'SEU TEMPO IMPORTA, NÓS CUIDAMOS DA LIMPEZA',
    rooms: 'Cômodos', date: 'Data', visitReport: 'Relatório de Visita',
    messenger: 'iMessage', website: 'Website', bookNext: 'Agendar Próxima',
    checklist: 'Checklist', damages: 'Danos Reportados', lostFound: 'Achados e Perdidos',
    footerQuote: 'Seu tempo importa, nós cuidamos da limpeza',
    notFound: 'Relatório não encontrado',
    notFoundDesc: 'Este link pode ser inválido ou o relatório ainda não foi publicado.',
    severity: 'Severidade', location: 'Localização',
    completion: 'Conclusão', photos: 'Fotos', duration: 'Duração',
    incidents: 'Incidentes', tasks: 'Tarefas', beforeAfter: 'Antes & Depois',
    before: 'Antes', after: 'Depois', noIncidents: 'Sem incidentes',
    contact: 'Contato', poweredBy: 'Desenvolvido por',
    minutes: 'min', overview: 'Resumo',
    downloadPdf: 'Baixar PDF', generating: 'Gerando...',
  },
  ko: {
    subtitle: '당신의 시간은 소중합니다',
    rooms: '방', date: '날짜', visitReport: '방문 보고서',
    messenger: 'iMessage', website: '웹사이트', bookNext: '다음 예약',
    checklist: '체크리스트', damages: '보고된 손상', lostFound: '분실물',
    footerQuote: '당신의 시간은 소중합니다',
    notFound: '보고서를 찾을 수 없습니다',
    notFoundDesc: '이 링크가 유효하지 않거나 보고서가 아직 게시되지 않았습니다.',
    severity: '심각도', location: '위치',
    completion: '완료율', photos: '사진', duration: '소요시간',
    incidents: '사건', tasks: '작업', beforeAfter: '전후 비교',
    before: '전', after: '후', noIncidents: '사건 없음',
    contact: '연락처', poweredBy: '제공',
    minutes: '분', overview: '개요',
    downloadPdf: 'PDF 다운로드', generating: '생성 중...',
  },
  th: {
    subtitle: 'เวลาของคุณมีค่า',
    rooms: 'ห้อง', date: 'วันที่', visitReport: 'รายงานการเยี่ยมชม',
    messenger: 'iMessage', website: 'เว็บไซต์', bookNext: 'จองครั้งต่อไป',
    checklist: 'รายการ', damages: 'ความเสียหายที่รายงาน', lostFound: 'ของหายและพบ',
    footerQuote: 'เวลาของคุณมีค่า',
    notFound: 'ไม่พบรายงาน',
    notFoundDesc: 'ลิงก์นี้อาจไม่ถูกต้องหรือรายงานยังไม่ได้เผยแพร่',
    severity: 'ความรุนแรง', location: 'สถานที่',
    completion: 'สำเร็จ', photos: 'รูปภาพ', duration: 'ระยะเวลา',
    incidents: 'เหตุการณ์', tasks: 'งาน', beforeAfter: 'ก่อนและหลัง',
    before: 'ก่อน', after: 'หลัง', noIncidents: 'ไม่มีเหตุการณ์',
    contact: 'ติดต่อ', poweredBy: 'ขับเคลื่อนโดย',
    minutes: 'นาที', overview: 'ภาพรวม',
    downloadPdf: 'ดาวน์โหลด PDF', generating: 'กำลังสร้าง...',
  },
  es: {
    subtitle: 'SU TIEMPO IMPORTA, NOSOTROS LIMPIAMOS',
    rooms: 'Habitaciones', date: 'Fecha', visitReport: 'Reporte de Visita',
    messenger: 'iMessage', website: 'Sitio Web', bookNext: 'Reservar Siguiente',
    checklist: 'Checklist', damages: 'Daños Reportados', lostFound: 'Objetos Perdidos',
    footerQuote: 'Su tiempo importa, nosotros nos encargamos de la limpieza',
    notFound: 'Reporte no encontrado',
    notFoundDesc: 'Este enlace puede ser inválido o el reporte aún no se ha publicado.',
    severity: 'Severidad', location: 'Ubicación',
    completion: 'Finalización', photos: 'Fotos', duration: 'Duración',
    incidents: 'Incidentes', tasks: 'Tareas', beforeAfter: 'Antes y Después',
    before: 'Antes', after: 'Después', noIncidents: 'Sin incidentes',
    contact: 'Contacto', poweredBy: 'Desarrollado por',
    minutes: 'min', overview: 'Resumen',
    downloadPdf: 'Descargar PDF', generating: 'Generando...',
  },
};

const dateLocales: Record<string, any> = { en: enUS, pt: ptBR, ko, th, es };

// ─── PDF Generator for Public Report ───
function generatePublicReportPdf(
  report: CleaningReport,
  rooms: ReportRoom[],
  photos: ReportPhoto[],
  t: (key: string) => string,
  durationStr: string,
  completionPct: number,
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const margin = 18;
  let y = 20;

  const addPage = () => { doc.addPage(); y = 20; };
  const checkPage = (needed: number) => { if (y + needed > 275) addPage(); };

  // Header bar
  doc.setFillColor(40, 40, 40);
  doc.rect(0, 0, W, 38, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('MAISON PUR', margin, 18);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(t('visitReport').toUpperCase(), margin, 28);
  doc.setTextColor(180, 180, 180);
  doc.text(`ID: ${report.public_token.slice(0, 8)}`, W - margin, 28, { align: 'right' });

  y = 50;

  // Property info
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(report.property_name, margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(report.property_address, margin, y);
  y += 6;
  doc.text(`${t('date')}: ${report.cleaning_date}  •  ${report.cleaner_name}`, margin, y);
  y += 12;

  // Summary box
  doc.setFillColor(245, 245, 240);
  doc.roundedRect(margin, y, W - margin * 2, 22, 3, 3, 'F');
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const colW = (W - margin * 2) / 4;
  const statsY = y + 9;
  const statsLabelY = y + 16;
  doc.setFontSize(16);
  doc.text(`${completionPct}%`, margin + colW * 0.5, statsY, { align: 'center' });
  doc.text(`${photos.length}`, margin + colW * 1.5, statsY, { align: 'center' });
  doc.text(durationStr, margin + colW * 2.5, statsY, { align: 'center' });
  doc.text(`${rooms.length}`, margin + colW * 3.5, statsY, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130, 130, 130);
  doc.text(t('completion').toUpperCase(), margin + colW * 0.5, statsLabelY, { align: 'center' });
  doc.text(t('photos').toUpperCase(), margin + colW * 1.5, statsLabelY, { align: 'center' });
  doc.text(t('duration').toUpperCase(), margin + colW * 2.5, statsLabelY, { align: 'center' });
  doc.text(t('rooms').toUpperCase(), margin + colW * 3.5, statsLabelY, { align: 'center' });

  y += 30;

  // Rooms
  rooms.forEach((room) => {
    checkPage(30);
    // Room header
    doc.setFillColor(113, 125, 98);
    doc.roundedRect(margin, y, W - margin * 2, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(room.name, margin + 5, y + 7);
    const pct = room.tasks_total > 0 ? Math.round((room.tasks_completed / room.tasks_total) * 100) : 0;
    doc.setFontSize(9);
    doc.text(`${pct}%`, W - margin - 5, y + 7, { align: 'right' });
    y += 14;

    // Checklist items
    const items = (room.checklist as any[]) || [];
    items.forEach((item: any) => {
      checkPage(6);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const check = item.completed ? '✓' : '○';
      doc.setTextColor(item.completed ? 80 : 180, item.completed ? 120 : 180, item.completed ? 80 : 180);
      doc.text(check, margin + 3, y);
      doc.setTextColor(60, 60, 60);
      doc.text(item.label || item.name || '', margin + 10, y);
      y += 5.5;
    });

    // Damages
    const damages = (room.damages as any[]) || [];
    if (damages.length > 0) {
      checkPage(10);
      y += 2;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(200, 80, 60);
      doc.text(`⚠ ${t('damages')} (${damages.length})`, margin + 3, y);
      y += 5;
      damages.forEach((d: any) => {
        checkPage(6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text(`• ${d.description || d.type || ''}`, margin + 6, y);
        y += 4.5;
      });
    }

    y += 6;
  });

  // Notes
  if (report.notes) {
    checkPage(20);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text('Notes', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const lines = doc.splitTextToSize(report.notes, W - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 4.5 + 4;
  }

  // Footer on last page
  const footerY = 285;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footerY - 4, W - margin, footerY - 4);
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text(`© ${new Date().getFullYear()} Maison Pur • maisonpurusa.com`, W / 2, footerY, { align: 'center' });

  // Download
  const filename = `Maison-Pur_${report.property_name.replace(/[^a-zA-Z0-9]/g, '-')}_${report.cleaning_date}.pdf`;
  const blobUrl = doc.output('bloburl') as unknown as string;
  window.open(blobUrl, '_blank');
}

export default function PublicReport() {
  const { token } = useParams<{ token: string }>();
  const { report, rooms, photos, isLoading } = usePublicReport(token);
  const [lang, setLang] = useState('en');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const roomRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const t = useCallback((key: string) => {
    return translations[lang]?.[key] || translations.en?.[key] || key;
  }, [lang]);

  useEffect(() => {
    if (report?.language && translations[report.language]) setLang(report.language);
  }, [report]);

  // OG meta
  useEffect(() => {
    if (!report) return;
    const ogUrl = BRAND_OG_IMAGE;
    document.title = `Maison Pur | ${report.property_name}`;
    const setMeta = (attr: string, val: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr.split('=')[0], val); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('property', 'og:title', `Maison Pur | ${report.property_name}`);
    setMeta('property', 'og:description', `${t('visitReport')} — ${report.cleaner_name}`);
    setMeta('property', 'og:image', ogUrl);
    setMeta('name', 'twitter:image', ogUrl);
    return () => { document.title = 'Maison Pur — Cleaning Management'; };
  }, [report, t]);

  // Close lang menu on outside click
  useEffect(() => {
    const handler = () => setLangMenuOpen(false);
    if (langMenuOpen) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [langMenuOpen]);

  // Scroll spy for room navigation
  useEffect(() => {
    if (rooms.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          setActiveRoom(visible[0].target.getAttribute('data-room-id'));
        }
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0.1 }
    );
    Object.values(roomRefs.current).forEach(el => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [rooms]);

  const formatDate = useCallback((dateStr: string) => {
    try {
      return format(new Date(dateStr), 'PPPP', { locale: dateLocales[lang] || enUS });
    } catch { return dateStr; }
  }, [lang]);

  const scrollToRoom = (roomId: string) => {
    roomRefs.current[roomId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
          </div>
          <h1 className="text-xl font-serif text-stone-800 mb-2">{t('notFound')}</h1>
          <p className="text-sm text-stone-500">{t('notFoundDesc')}</p>
        </div>
      </div>
    );
  }

  const allDamages = rooms.flatMap(r => (r.damages || []) as any[]);
  const allLostFound = rooms.flatMap(r => (r.lost_and_found || []) as any[]);
  const totalTasks = rooms.reduce((s, r) => s + r.tasks_total, 0);
  const completedTasks = rooms.reduce((s, r) => s + r.tasks_completed, 0);
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalIncidents = allDamages.length + allLostFound.length;

  // Duration
  let durationStr = '—';
  if (report.start_time && report.end_time) {
    const mins = Math.round((report.end_time - report.start_time) / 60000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    durationStr = h > 0 ? `${h}h ${m}${t('minutes')}` : `${m} ${t('minutes')}`;
  }

  const getPhotosForRoom = (roomId: string) => photos.filter(p => p.room_id === roomId);
  const generalPhotos = photos.filter(p => !p.room_id);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 antialiased font-sans selection:bg-stone-200" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* 1. Header */}
      <div className="relative w-full h-[350px] md:h-[500px] overflow-hidden bg-stone-100">
        <img
          src={report.property_photo_url || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1920&auto=format&fit=crop"}
          className="w-full h-full object-cover object-center"
          alt={report.property_name}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stone-50/90 md:to-stone-50/50" />

        {/* Logo */}
        <div className="absolute top-6 left-6 z-20">
          <BrandLogo className="h-12 w-auto drop-shadow-md" />
        </div>

        {/* Language Switcher */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={(e) => { e.stopPropagation(); setLangMenuOpen(!langMenuOpen); }}
            className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm hover:bg-white transition-all text-xs font-bold text-stone-800 uppercase tracking-wider"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            {lang.toUpperCase()}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          {langMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-2xl border border-stone-100 py-2 overflow-hidden origin-top-right animate-scale-in z-50">
              {Object.keys(translations).map(l => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setLangMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-xs font-medium uppercase hover:bg-stone-50 transition-colors"
                >
                  {{ en: 'English', pt: 'Português', es: 'Español', th: 'Thai', ko: 'Korean' }[l] || l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Profile & Info Card */}
      <div className="relative z-10 -mt-24 md:-mt-32 text-center px-4 animate-fade-in">
        <div className="inline-block relative mb-6">
          <div className="w-40 h-40 md:w-52 md:h-52 rounded-full border-[6px] border-white shadow-2xl overflow-hidden bg-stone-200 mx-auto flex items-center justify-center">
            <img src="https://i.ibb.co/bg9ZNvSk/Captura-de-Tela-2026-01-01-s-01-33-28.png" className="w-full h-full object-cover object-top" alt="Profile" />
          </div>
        </div>

        <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-6 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          {report.cleaner_name}
        </h1>

        {/* Info Card */}
        <div className="max-w-3xl mx-auto bg-white border border-stone-100 shadow-xl shadow-stone-200/50 rounded-2xl overflow-hidden mb-8">
          <div className="py-6 px-4 border-b border-stone-100 bg-stone-50/30">
            <p className="text-xs font-bold text-[#717D62] uppercase tracking-[0.2em]">{t('subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-100">
            <div className="p-6 flex flex-col items-center justify-center hover:bg-stone-50 transition-colors">
              <span className="text-3xl font-serif text-stone-800 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{rooms.length}</span>
              <span className="text-[10px] uppercase tracking-widest text-stone-400">{t('rooms')}</span>
            </div>
            <div className="p-6 flex flex-col items-center justify-center hover:bg-stone-50 transition-colors">
              <span className="text-lg font-serif text-stone-800 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{formatDate(report.cleaning_date)}</span>
              <span className="text-[10px] uppercase tracking-widest text-stone-400">{t('date')}</span>
            </div>
            <div className="p-6 flex flex-col items-center justify-center hover:bg-stone-50 transition-colors text-center">
              <div className="flex items-center gap-1 mb-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-300"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <span className="text-sm font-serif text-stone-600 line-clamp-1" style={{ fontFamily: "'Playfair Display', serif" }}>{report.property_name}</span>
              <span className="text-[10px] uppercase tracking-widest text-stone-400 mt-1">{t('visitReport')}</span>
            </div>
          </div>
          <div className="p-4 bg-stone-50 border-t border-stone-100 flex flex-col md:flex-row justify-center gap-3">
            <a href="sms:" className="flex-1 flex justify-center items-center gap-2 bg-white hover:bg-stone-100 border border-stone-200 text-stone-600 px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
              {t('messenger')}
            </a>
            <a href="https://maisonpurusa.com" target="_blank" rel="noopener" className="flex-1 flex justify-center items-center gap-2 bg-white hover:bg-stone-100 border border-stone-200 text-stone-600 px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              {t('website')}
            </a>
            <a href="mailto:contact@maisonpurusa.com" className="flex-1 flex justify-center items-center gap-2 bg-stone-800 hover:bg-stone-700 text-white px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {t('bookNext')}
            </a>
          </div>
        </div>
      </div>

      {/* 3. Executive Summary */}
      <div className="max-w-3xl mx-auto px-4 mb-8">
        <div className="bg-white border border-stone-100 shadow-lg shadow-stone-200/30 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em]">{t('overview')}</h3>
          </div>

          {/* Completion bar */}
          <div className="px-6 pt-5 pb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">{t('completion')}</span>
              <span className="text-sm font-serif font-bold text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>{completionPct}%</span>
            </div>
            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${completionPct}%`,
                  background: completionPct === 100
                    ? 'linear-gradient(90deg, #8A9679, #717D62)'
                    : completionPct >= 80
                    ? 'linear-gradient(90deg, #8A9679, #A3B18A)'
                    : 'linear-gradient(90deg, #D4A574, #C9956B)',
                }}
              />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-stone-100 border-t border-stone-100">
            <div className="p-5 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#717D62]"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <span className="text-2xl font-serif font-bold text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>{completedTasks}/{totalTasks}</span>
              <span className="text-[10px] uppercase tracking-widest text-stone-400 mt-1">{t('tasks')}</span>
            </div>
            <div className="p-5 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-500"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <span className="text-2xl font-serif font-bold text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>{photos.length}</span>
              <span className="text-[10px] uppercase tracking-widest text-stone-400 mt-1">{t('photos')}</span>
            </div>
            <div className="p-5 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <span className="text-2xl font-serif font-bold text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>{durationStr}</span>
              <span className="text-[10px] uppercase tracking-widest text-stone-400 mt-1">{t('duration')}</span>
            </div>
            <div className="p-5 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center mb-2">
                {totalIncidents > 0 ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#717D62]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                )}
              </div>
              <span className="text-2xl font-serif font-bold text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                {totalIncidents > 0 ? totalIncidents : '✓'}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-stone-400 mt-1">
                {totalIncidents > 0 ? t('incidents') : t('noIncidents')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sticky Room Navigation */}
      {rooms.length > 1 && (
        <div className="sticky top-0 z-30 bg-stone-50/95 backdrop-blur-md border-b border-stone-200/60 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
              {rooms.map((room, idx) => (
                <button
                  key={room.id}
                  onClick={() => scrollToRoom(room.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    activeRoom === room.id
                      ? 'bg-stone-900 text-white shadow-md'
                      : 'bg-white text-stone-500 border border-stone-200 hover:bg-stone-100 hover:text-stone-700'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    activeRoom === room.id ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {idx + 1}
                  </span>
                  {room.name}
                </button>
              ))}
              {generalPhotos.length > 0 && (
                <button
                  onClick={() => document.getElementById('before-after-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all bg-white text-stone-500 border border-stone-200 hover:bg-stone-100 hover:text-stone-700`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  {t('beforeAfter')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Room-by-Room Content */}
      <div className="max-w-7xl mx-auto px-6 pb-20 pt-8">
        {rooms.map((room, roomIdx) => {
          const roomPhotos = getPhotosForRoom(room.id);
          const hasPhotos = roomPhotos.length > 0;
          const roomDamages = (room.damages || []) as any[];
          const roomLostFound = (room.lost_and_found || []) as any[];
          const checklistItems = (room.checklist || []) as any[];

          return (
            <div
              key={room.id}
              ref={el => { roomRefs.current[room.id] = el; }}
              data-room-id={room.id}
              className="mb-24 border-b border-stone-200 pb-16 last:border-0 scroll-mt-20"
            >
              {/* Room Header */}
              <div className="flex items-center gap-4 mb-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 font-serif text-lg font-bold text-white shadow-lg shadow-stone-200 flex-shrink-0" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {roomIdx + 1}
                </span>
                <h2 className="font-serif text-3xl md:text-4xl text-stone-800 break-words" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {room.name}
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Checklist Column — full width if no photos */}
                <div className={`${hasPhotos ? 'lg:col-span-4' : 'lg:col-span-12'} order-1 lg:order-1 space-y-6`}>
                  {/* Checklist Card */}
                  {checklistItems.length > 0 && (
                    <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
                      <div className="bg-stone-50 px-4 py-3 border-b border-stone-100 flex justify-between items-center">
                        <h4 className="font-bold text-stone-400 uppercase tracking-widest text-xs flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                          {t('checklist')}
                        </h4>
                        <span className="text-[10px] font-mono bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded">
                          {room.tasks_completed}/{room.tasks_total}
                        </span>
                      </div>
                      {/* Room progress bar */}
                      <div className="px-4 pt-3 pb-1">
                        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${room.tasks_total > 0 ? Math.round((room.tasks_completed / room.tasks_total) * 100) : 0}%`,
                              background: 'linear-gradient(90deg, #8A9679, #717D62)',
                            }}
                          />
                        </div>
                      </div>
                      <div className={`p-4 space-y-3 ${!hasPhotos ? 'columns-1 md:columns-2 lg:columns-3 gap-6' : ''}`}>
                        {checklistItems.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 text-sm group break-inside-avoid">
                            <div className={`mt-0.5 flex-shrink-0 ${item.completed ? 'text-[#8A9679]' : 'text-stone-300'}`}>
                              {item.completed ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={item.completed ? 'text-stone-700' : 'text-stone-400'}>{item.label}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Damages Card */}
                  {roomDamages.length > 0 && (
                    <div className="bg-white rounded-xl border-2 border-amber-200 shadow-sm overflow-hidden">
                      <div className="bg-amber-50 px-4 py-3 border-b border-amber-100 flex justify-between items-center">
                        <h4 className="font-bold text-amber-600 uppercase tracking-widest text-xs flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                          {t('damages')}
                        </h4>
                        <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                          {roomDamages.length}
                        </span>
                      </div>
                      <div className="p-4 space-y-4">
                        {roomDamages.map((d: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-4">
                            {d.photoUrl && (
                              <button onClick={() => setLightboxUrl(d.photoUrl)} className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity border-2 border-amber-100 shadow-sm">
                                <img src={d.photoUrl} alt="" className="w-full h-full object-cover" />
                              </button>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-stone-800 font-medium">{d.description}</p>
                              {d.severity && (
                                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                                  d.severity === 'high' ? 'bg-red-500 text-white' :
                                  d.severity === 'medium' ? 'bg-amber-500 text-white' :
                                  'bg-green-500 text-white'
                                }`}>
                                  {t('severity')}: {d.severity}
                                </span>
                              )}
                              {d.location && (
                                <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                  {d.location}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lost & Found Card */}
                  {roomLostFound.length > 0 && (
                    <div className="bg-white rounded-xl border-2 border-blue-200 shadow-sm overflow-hidden">
                      <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
                        <h4 className="font-bold text-blue-600 uppercase tracking-widest text-xs flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                          {t('lostFound')}
                        </h4>
                        <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full">
                          {roomLostFound.length}
                        </span>
                      </div>
                      <div className="p-4 space-y-4">
                        {roomLostFound.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-4">
                            {item.photoUrl && (
                              <button onClick={() => setLightboxUrl(item.photoUrl)} className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity border-2 border-blue-100 shadow-sm">
                                <img src={item.photoUrl} alt="" className="w-full h-full object-cover" />
                              </button>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-stone-800 font-medium">{item.description}</p>
                              {item.location && (
                                <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                  {item.location}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Photos Column — only if there are photos */}
                {hasPhotos && (
                  <div className="lg:col-span-8 order-2 lg:order-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {roomPhotos.map((photo) => (
                        <div
                          key={photo.id}
                          className="group relative cursor-pointer overflow-hidden rounded-xl bg-stone-100 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl aspect-square"
                          onClick={() => setLightboxUrl(photo.photo_url)}
                        >
                          <img
                            src={photo.photo_url}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            alt={photo.caption || room.name}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white/90 p-2 rounded-full shadow-sm text-stone-800">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                            </div>
                          </div>
                          {photo.photo_type !== 'after' && photo.photo_type !== 'before' && (
                            <div className="absolute top-3 left-3">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full backdrop-blur-md ${
                                photo.photo_type === 'damage' ? 'bg-amber-500/80 text-white' :
                                photo.photo_type === 'lost_found' ? 'bg-blue-500/80 text-white' :
                                'bg-stone-800/60 text-white'
                              }`}>
                                {photo.photo_type === 'damage' ? '⚠' : photo.photo_type === 'lost_found' ? '🔍' : '📷'}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Before & After Photos */}
        {generalPhotos.length > 0 && (
          <div id="before-after-section" className="mb-24 border-b border-stone-200 pb-16 last:border-0 scroll-mt-20">
            <div className="flex items-center gap-4 mb-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 shadow-lg shadow-stone-200 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-stone-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                {t('beforeAfter')}
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {generalPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative cursor-pointer overflow-hidden rounded-xl bg-stone-100 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl aspect-square"
                  onClick={() => setLightboxUrl(photo.photo_url)}
                >
                  <img src={photo.photo_url} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" alt={photo.caption || 'Photo'} loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-md ${
                      photo.photo_type === 'before' ? 'bg-blue-500/80 text-white' : 'bg-green-500/80 text-white'
                    }`}>
                      {photo.photo_type === 'before' ? t('before') : t('after')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Standalone damages/lostfound */}
        {rooms.length === 0 && (allDamages.length > 0 || allLostFound.length > 0) && (
          <div className="space-y-6">
            {allDamages.length > 0 && (
              <div className="bg-white rounded-xl border border-amber-200/60 shadow-sm overflow-hidden p-4">
                <h3 className="font-bold text-amber-600 uppercase tracking-widest text-xs mb-3">{t('damages')}</h3>
                {allDamages.map((d: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 mb-2">
                    <p className="text-sm text-stone-800">{d.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-stone-900 text-white">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <p className="font-serif italic text-stone-300 text-lg mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            "{t('footerQuote')}"
          </p>
          <div className="flex justify-center mb-6">
            <BrandLogo className="h-12 w-auto brightness-0 invert opacity-70" />
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-xs text-stone-400 mb-6">
            <a href="mailto:contact@maisonpurusa.com" className="flex items-center gap-2 hover:text-white transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              contact@maisonpurusa.com
            </a>
            <a href="https://maisonpurusa.com" target="_blank" rel="noopener" className="flex items-center gap-2 hover:text-white transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              maisonpurusa.com
            </a>
          </div>
          <div className="border-t border-stone-800 pt-6">
            <p className="text-[10px] text-stone-500">
              © {new Date().getFullYear()} Maison Pur • Report ID: {report.public_token.slice(0, 8)}
            </p>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="fixed top-6 right-6 z-[100000] bg-stone-900/50 text-white hover:bg-stone-800 p-2 rounded-full backdrop-blur-md transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
          <div className="max-w-5xl max-h-[90vh] relative w-full flex justify-center items-center">
            <img
              src={lightboxUrl}
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
              alt=""
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
