import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarSync, Copy, Check, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CalendarSyncSectionProps {
  userId: string | undefined;
}

export const CalendarSyncSection = ({ userId }: CalendarSyncSectionProps) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [icalToken, setIcalToken] = useState<string | null>(null);
  
  useEffect(() => {
    if (!userId) return;
    const fetchToken = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('ical_token')
        .eq('user_id', userId)
        .maybeSingle();
      if (data?.ical_token) {
        setIcalToken(data.ical_token);
      }
    };
    fetchToken();
  }, [userId]);

  const icalUrl = icalToken 
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ical-feed?token=${icalToken}`
    : '';

  const handleCopy = async () => {
    if (!icalUrl) return;
    
    try {
      await navigator.clipboard.writeText(icalUrl);
      setCopied(true);
      toast.success(t('settings.linkCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleOpenInstructions = () => {
    const instructions = `
Para adicionar ao Google Calendar:
1. Abra calendar.google.com
2. Clique no "+" ao lado de "Outros calendários"
3. Selecione "De URL"
4. Cole o link e clique em "Adicionar calendário"

Para adicionar ao Apple Calendar:
1. Abra o app Calendário
2. Arquivo → Nova Assinatura de Calendário
3. Cole o link e clique em "Assinar"

Para adicionar ao Outlook:
1. Abra outlook.com/calendar
2. Adicionar calendário → Assinar da web
3. Cole o link e dê um nome ao calendário
    `.trim();
    
    toast.info(instructions, { duration: 10000 });
  };

  if (!userId) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="glass-panel p-4 mb-4"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <CalendarSync size={20} className="text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground">{t('settings.calendar')}</p>
          <p className="text-xs text-muted-foreground">{t('settings.calendarDesc')}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            {t('settings.calendarLinkDesc')}
          </p>
          <div className="flex gap-2">
            <Input
              value={icalUrl}
              readOnly
              className="text-xs font-mono bg-muted/50"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenInstructions}
          className="w-full text-xs gap-1.5"
        >
          <ExternalLink size={14} />
          Como adicionar ao meu calendário?
        </Button>
      </div>
    </motion.div>
  );
};
