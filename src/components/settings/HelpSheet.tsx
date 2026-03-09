import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Mail, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface HelpSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSheet = ({ isOpen, onClose }: HelpSheetProps) => {
  const { t } = useLanguage();

  const faqs = [
    { q: t('help.faq1q'), a: t('help.faq1a') },
    { q: t('help.faq2q'), a: t('help.faq2a') },
    { q: t('help.faq3q'), a: t('help.faq3a') },
    { q: t('help.faq4q'), a: t('help.faq4a') },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>{t('settings.help')}</SheetTitle>
          <SheetDescription>{t('help.subtitle')}</SheetDescription>
        </SheetHeader>

        {/* FAQ */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-2 px-1">{t('help.faqTitle')}</h3>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-sm text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact */}
        <div className="space-y-3 px-1">
          <h3 className="text-sm font-semibold text-foreground">{t('help.contact')}</h3>
          <a
            href="mailto:support@maisonpur.com"
            className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <Mail size={18} className="text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">support@maisonpur.com</p>
              <p className="text-xs text-muted-foreground">{t('help.emailDesc')}</p>
            </div>
            <ExternalLink size={14} className="text-muted-foreground ml-auto" />
          </a>
        </div>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground mt-8 pb-4">Maison Pur v1.0.0</p>
      </SheetContent>
    </Sheet>
  );
};
