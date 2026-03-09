import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, Clock, MessageSquare, BellRing, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';

interface NotificationsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationPrefs {
  jobReminders: boolean;
  newBookings: boolean;
  teamUpdates: boolean;
}

const STORAGE_KEY = 'notification-preferences';

const getPrefs = (): NotificationPrefs => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { jobReminders: true, newBookings: true, teamUpdates: false };
  } catch {
    return { jobReminders: true, newBookings: true, teamUpdates: false };
  }
};

export const NotificationsSheet = ({ isOpen, onClose }: NotificationsSheetProps) => {
  const { t } = useLanguage();
  const [prefs, setPrefs] = useState<NotificationPrefs>(getPrefs);
  const { isSupported, isSubscribed, isLoading, permission, subscribe, unsubscribe, sendTestNotification } = usePushNotifications();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const togglePref = (key: keyof NotificationPrefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTogglePush = async () => {
    if (isSubscribed) {
      const ok = await unsubscribe();
      if (ok) toast.success(t('notif.disabled'));
    } else {
      const ok = await subscribe();
      if (ok) {
        toast.success(t('notif.enabled'));
      } else if (permission === 'denied') {
        toast.error(t('notif.blocked'));
      }
    }
  };

  const handleTestPush = async () => {
    toast.info(t('notif.testSending'));
    await sendTestNotification();
  };

  const prefItems = [
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
          {/* Main Push Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BellRing size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t('notif.push')}</p>
                <p className="text-xs text-muted-foreground">
                  {!isSupported
                    ? t('notif.notSupported')
                    : permission === 'denied'
                    ? t('notif.blocked')
                    : t('notif.pushDesc')}
                </p>
              </div>
            </div>
            <Switch
              checked={isSubscribed}
              onCheckedChange={handleTogglePush}
              disabled={!isSupported || isLoading || permission === 'denied'}
            />
          </div>

          {/* Test notification button */}
          {isSubscribed && (
            <div className="px-4 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 text-xs"
                onClick={handleTestPush}
                disabled={isLoading}
              >
                <Send size={14} /> {t('notif.testSend')}
              </Button>
            </div>
          )}

          {/* Preference toggles */}
          <div className="pt-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 pb-2">
              {t('notif.preferences')}
            </p>
            {prefItems.map(item => (
              <div key={item.key} className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <item.icon size={18} className="text-muted-foreground" />
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
        </div>
      </SheetContent>
    </Sheet>
  );
};
