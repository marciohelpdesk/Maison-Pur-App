import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Eye, Lock, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PrivacySheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacySheet = ({ isOpen, onClose }: PrivacySheetProps) => {
  const { t } = useLanguage();
  const [profileVisible, setProfileVisible] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error(t('privacy.passwordMin'));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('privacy.passwordChanged'));
      setNewPassword('');
      setShowPasswordForm(false);
    }
  };

  const handleDeleteAccount = async () => {
    toast.info(t('privacy.deleteRequested'));
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh]">
        <SheetHeader className="pb-4">
          <SheetTitle>{t('settings.privacy')}</SheetTitle>
          <SheetDescription>{t('privacy.subtitle')}</SheetDescription>
        </SheetHeader>
        <div className="space-y-1 mb-6">
          <div className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Eye size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t('privacy.profileVisibility')}</p>
                <p className="text-xs text-muted-foreground">{t('privacy.profileVisibilityDesc')}</p>
              </div>
            </div>
            <Switch checked={profileVisible} onCheckedChange={setProfileVisible} />
          </div>
        </div>

        {/* Change Password */}
        <div className="px-4 mb-6">
          {!showPasswordForm ? (
            <Button variant="outline" className="w-full gap-2" onClick={() => setShowPasswordForm(true)}>
              <Lock size={16} /> {t('privacy.changePassword')}
            </Button>
          ) : (
            <div className="space-y-3">
              <Input
                type="password"
                placeholder={t('privacy.newPasswordPlaceholder')}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowPasswordForm(false)}>
                  {t('common.cancel')}
                </Button>
                <Button className="flex-1" onClick={handleChangePassword} disabled={loading}>
                  {loading ? '...' : t('common.save')}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Account */}
        <div className="px-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full text-destructive gap-2 hover:text-destructive hover:bg-destructive/10">
                <Trash2 size={16} /> {t('privacy.deleteAccount')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('privacy.deleteConfirmTitle')}</AlertDialogTitle>
                <AlertDialogDescription>{t('privacy.deleteConfirmDesc')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t('common.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  );
};
