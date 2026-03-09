import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Loader2, FileText, Clock, ClipboardCheck, Camera, AlertTriangle, Search, Package, MessageSquare, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Job, InventoryItem } from '@/types';
import { generateCleaningReport } from '@/lib/pdfGenerator';
import { toast } from 'sonner';
import { BRAND_LOGO_PRIMARY } from '@/lib/brand';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  inventory: InventoryItem[];
  responsibleName: string;
  note: string;
}

export const PdfPreviewModal = ({ 
  isOpen, 
  onClose, 
  job,
  inventory,
  responsibleName,
  note,
}: PdfPreviewModalProps) => {
  const { t } = useLanguage();
  const [isDownloading, setIsDownloading] = useState(false);

  const totalTasks = job.checklist.reduce((acc, s) => acc + s.items.length, 0);
  const completedTasks = job.checklist.reduce((acc, s) => acc + s.items.filter(i => i.completed).length, 0);
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const duration = job.startTime ? Math.floor((Date.now() - job.startTime) / 60000) : 0;
  const hrs = Math.floor(duration / 60);
  const mins = duration % 60;
  const durationStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins} min`;

  const totalPhotos = job.photosBefore.length + job.photosAfter.length;
  const damagesCount = job.damages?.length || 0;
  const lostFoundCount = job.lostAndFound?.length || 0;

  const handleShareWhatsApp = () => {
    const lines = [
      `✨ *Maison Pur — ${t('exec.summary.cleaningReport')}*`,
      ``,
      `🏠 *${job.clientName}*`,
      `📍 ${job.address}`,
      `📅 ${new Date(job.date).toLocaleDateString('pt-BR')}`,
      ``,
      `⏱ ${t('exec.summary.duration')}: ${durationStr}`,
      `✅ ${t('exec.summary.tasks')}: ${completedTasks}/${totalTasks} (${completionPct}%)`,
      `📷 ${t('exec.summary.photos')}: ${totalPhotos}`,
      damagesCount > 0 ? `⚠️ ${t('exec.summary.damagesRecorded')}: ${damagesCount}` : '',
      lostFoundCount > 0 ? `🔍 ${t('exec.summary.lostFoundRecorded')}: ${lostFoundCount}` : '',
      note ? `\n💬 ${note}` : '',
      ``,
      `👤 ${responsibleName}`,
    ].filter(Boolean).join('\n');

    const url = `https://wa.me/?text=${encodeURIComponent(lines)}`;
    window.open(url, '_blank');
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await generateCleaningReport({
        job: { ...job, reportNote: note, endTime: Date.now() },
        inventory,
        responsibleName,
        lostAndFound: job.lostAndFound || [],
      });
      const filename = `relatorio-${job.clientName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast.success('PDF gerado com sucesso!');
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error('Erro ao gerar PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25 }}
          className="absolute inset-2 sm:inset-4 bg-background rounded-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground text-sm">{t('exec.summary.pdfPreview')}</h2>
                <p className="text-xs text-muted-foreground">{t('exec.summary.previewNote')}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* HTML Report Preview */}
          <div className="flex-1 overflow-auto bg-muted/20 p-3 sm:p-4">
            <div className="max-w-lg mx-auto space-y-4">
              
              {/* Report Cover */}
              <div className="bg-card rounded-2xl p-5 text-center border border-border/50 shadow-sm">
                <img src={BRAND_LOGO_PRIMARY} alt="Logo" className="w-12 h-12 mx-auto mb-3 rounded-xl" />
                <h3 className="text-lg font-bold text-foreground">{t('exec.summary.cleaningReport')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{job.clientName}</p>
                <p className="text-xs text-muted-foreground">{job.address}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <Clock className="w-3 h-3" />
                  {new Date(job.date).toLocaleDateString('pt-BR')}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <MiniStat icon={Clock} label={t('exec.summary.duration')} value={durationStr} className="bg-primary/10 text-primary" />
                <MiniStat icon={ClipboardCheck} label={t('exec.summary.tasks')} value={`${completedTasks}/${totalTasks}`} className="bg-success/10 text-success" />
                <MiniStat icon={Camera} label={t('exec.summary.photos')} value={`${totalPhotos}`} className="bg-warning/10 text-warning" />
                <MiniStat 
                  icon={CheckCircle2} 
                  label={t('exec.summary.completion')} 
                  value={`${completionPct}%`} 
                  className={completionPct === 100 ? "bg-success/10 text-success" : "bg-warning/10 text-warning"} 
                />
              </div>

              {/* Checklist Summary */}
              <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-primary" />
                  Checklist
                </h4>
                <div className="space-y-2.5">
                  {job.checklist.map((section, idx) => {
                    const done = section.items.filter(i => i.completed).length;
                    const total = section.items.length;
                    const pct = total > 0 ? (done / total) * 100 : 0;
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground">{section.title}</span>
                          <span className="text-[10px] text-muted-foreground">{done}/{total}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-success' : 'bg-primary'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Damages */}
              {damagesCount > 0 && (
                <div className="bg-card rounded-2xl p-4 border border-destructive/30 shadow-sm">
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    {t('exec.summary.damagesRecorded')} ({damagesCount})
                  </h4>
                  <div className="space-y-1.5">
                    {job.damages!.map(d => (
                      <div key={d.id} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Circle className="w-2 h-2 mt-1 fill-destructive text-destructive shrink-0" />
                        <span>{d.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lost & Found */}
              {lostFoundCount > 0 && (
                <div className="bg-card rounded-2xl p-4 border border-accent/30 shadow-sm">
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Search className="w-4 h-4 text-accent" />
                    {t('exec.summary.lostFoundRecorded')} ({lostFoundCount})
                  </h4>
                  <div className="space-y-1.5">
                    {job.lostAndFound!.map(l => (
                      <div key={l.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                        {l.photoUrl && (
                          <img src={l.photoUrl} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                        )}
                        <span>{l.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos Preview */}
              {totalPhotos > 0 && (
                <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-primary" />
                    {t('exec.summary.photoDocumentation')}
                  </h4>
                  {job.photosBefore.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">{t('exec.summary.before')} ({job.photosBefore.length})</p>
                      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
                        {job.photosBefore.slice(0, 5).map((p, i) => (
                          <img key={i} src={p} alt="" className="w-14 h-10 rounded-lg object-cover shrink-0" />
                        ))}
                        {job.photosBefore.length > 5 && (
                          <div className="w-14 h-10 rounded-lg bg-muted flex items-center justify-center text-[10px] text-muted-foreground shrink-0">
                            +{job.photosBefore.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {job.photosAfter.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">{t('exec.summary.after')} ({job.photosAfter.length})</p>
                      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
                        {job.photosAfter.slice(0, 5).map((p, i) => (
                          <img key={i} src={p} alt="" className="w-14 h-10 rounded-lg object-cover shrink-0" />
                        ))}
                        {job.photosAfter.length > 5 && (
                          <div className="w-14 h-10 rounded-lg bg-muted flex items-center justify-center text-[10px] text-muted-foreground shrink-0">
                            +{job.photosAfter.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Note */}
              {note && (
                <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm">
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    {t('exec.summary.addNote')}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{note}</p>
                </div>
              )}

              {/* Responsible */}
              <div className="text-center py-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{t('exec.summary.responsible')}</p>
                <p className="text-sm font-semibold text-foreground">{responsibleName}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={onClose} className="flex-1 h-10 rounded-xl">
                {t('common.cancel')}
              </Button>
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 h-10 rounded-xl gap-2 bg-primary"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {t('exec.summary.downloadPdf')}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const MiniStat = ({ icon: Icon, label, value, className }: { icon: React.ElementType; label: string; value: string; className: string }) => (
  <div className="bg-card rounded-xl p-3 border border-border/50 shadow-sm flex items-center gap-3">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${className}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-sm font-bold text-foreground">{value}</p>
    </div>
  </div>
);
