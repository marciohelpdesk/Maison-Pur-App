import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Bell, Calendar, Clock, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NotificationsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationPrefs {
  pushEnabled: boolean;
  jobReminders: boolean;
  newBookings: boolean;
  teamUpdates: boolean;
}

const STORAGE_KEY = 'notification-preferences';

const getPrefs = (): NotificationPrefs => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { pushEnabled: true, jobReminders: true, newBookings: true, teamUpdates: false };
  } catch {
    return { pushEnabled: true, jobReminders: true, newBookings: true, teamUpdates: false };
  }
};

export const NotificationsSheet = ({ isOpen, onClose }: NotificationsSheetProps) => {
  const { t } = useLanguage();
  const [prefs, setPrefs] = useState<NotificationPrefs>(getPrefs);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const togglePref = (key: keyof NotificationPrefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const items = [
    { key: 'pushEnabled' as const, icon: Bell, label: t('notif.push'), desc: t('notif.pushDesc') },
    { key: 'jobReminders' as const, icon: Clock, label: t('notif.reminders'), desc: t('notif.remindersDesc') },
    { key: 'newBookings' as const, icon: Calendar, label: t('notif.bookings'), desc: t('notif.bookingsDesc') },
    { key: 'teamUpdates' as const, icon: MessageSquare, label: t('notif.team'), desc: t('notif.teamDesc') },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh]">
        <SheetHeader className="pb-4">
          <SheetTitle>{t('settings.notifications')}</SheetTitle>
          <SheetDescription>{t('notif.subtitle')}</SheetDescription>
        </SheetHeader>
        <div className="space-y-1">
          {items.map(item => (
            <div key={item.key} className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <Switch checked={prefs[item.key]} onCheckedChange={() => togglePref(item.key)} />
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
