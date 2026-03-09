import { useState } from 'react';
import { motion } from 'framer-motion';

import { ChevronRight, LogOut, Wallet, Bell, Shield, HelpCircle, Globe, Pencil, Receipt, ClipboardList } from 'lucide-react';
import { UserProfile, Employee } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { TeamManagement } from '@/components/TeamManagement';
import { EditProfileModal } from '@/components/EditProfileModal';
import { CalendarSyncSection } from '@/components/CalendarSyncSection';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { NotificationsSheet } from '@/components/settings/NotificationsSheet';
import { PrivacySheet } from '@/components/settings/PrivacySheet';
import { HelpSheet } from '@/components/settings/HelpSheet';

interface SettingsViewProps {
  userId?: string;
  userProfile: UserProfile;
  employees: Employee[];
  onLogout: () => void;
  onViewFinance: () => void;
  onAddEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const SettingsView = ({ userId, userProfile, employees, onLogout, onViewFinance, onAddEmployee, onDeleteEmployee, onUpdateProfile }: SettingsViewProps) => {
  const { t, language, setLanguage } = useLanguage();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<'notifications' | 'privacy' | 'help' | null>(null);
  const navigate = useNavigate();

  const settingsItems = [
  { id: 'notifications' as const, icon: Bell, label: t('settings.notifications'), description: t('settings.notificationsDesc') },
  { id: 'privacy' as const, icon: Shield, label: t('settings.privacy'), description: t('settings.privacyDesc') },
  { id: 'help' as const, icon: HelpCircle, label: t('settings.help'), description: t('settings.helpDesc') }];


  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'pt' : 'en');
  };

  return (
    <div className="flex flex-col h-full relative z-10 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 px-6 py-4" style={{ background: 'transparent' }}>
        <div>
          
          <h1 className="font-bold text-foreground text-2xl">{t('settings.title')}</h1>
        </div>
      </div>
      
      <div className="px-6 pt-2 relative z-10">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 flex flex-col items-center justify-center mb-6 relative">
          
          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            aria-label={t('profile.edit')}>
            
            <Pencil size={14} className="text-muted-foreground" />
          </button>
          <div className="w-28 h-28 rounded-full mb-4 border-4 border-white shadow-lg overflow-hidden">
            <img
              src={userProfile.avatar}
              className="w-full h-full object-cover object-top"
              alt="Profile" />
            
          </div>
          <h2 className="text-2xl font-light text-foreground mb-1">{userProfile.name}</h2>
          <p className="text-sm text-muted-foreground">{userProfile.email}</p>
          <span className="mt-3 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            {userProfile.role}
          </span>
        </motion.div>

        {/* Earnings Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={onViewFinance}
          className="glass-panel w-full p-5 flex items-center justify-between text-foreground active:scale-95 transition-transform mb-4">
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Wallet size={20} className="text-success" />
            </div>
            <div className="text-left">
              <p className="font-medium">{t('settings.earnings')}</p>
              <p className="text-xs text-muted-foreground">{t('settings.earningsDesc')}</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-muted-foreground" />
        </motion.button>
        
        {/* Team Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-panel p-4 mb-4">
          
          <TeamManagement
            employees={employees}
            onAddEmployee={onAddEmployee}
            onDeleteEmployee={onDeleteEmployee} />
          
        </motion.div>

        {/* Invoice Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          onClick={() => navigate('/invoices')}
          className="glass-panel w-full p-5 flex items-center justify-between text-foreground active:scale-95 transition-transform mb-4">
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Receipt size={20} className="text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">Invoices</p>
              <p className="text-xs text-muted-foreground">Create & manage invoices</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-muted-foreground" />
        </motion.button>

        {/* Estimates Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.17 }}
          onClick={() => navigate('/estimates')}
          className="glass-panel w-full p-5 flex items-center justify-between text-foreground active:scale-95 transition-transform mb-4">
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <ClipboardList size={20} className="text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium">Estimates</p>
              <p className="text-xs text-muted-foreground">Create & send quotes</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-muted-foreground" />
        </motion.button>

        {/* Calendar Sync Section */}
        <CalendarSyncSection userId={userId} />

        {/* Language Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="glass-panel w-full p-4 flex items-center justify-between text-foreground mb-4">
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe size={20} className="text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">{t('settings.language')}</p>
              <p className="text-xs text-muted-foreground">{t('settings.languageDesc')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${language === 'en' ? 'text-primary' : 'text-muted-foreground'}`}>EN</span>
            <Switch
              checked={language === 'pt'}
              onCheckedChange={toggleLanguage} />
            
            <span className={`text-xs font-medium ${language === 'pt' ? 'text-primary' : 'text-muted-foreground'}`}>PT</span>
          </div>
        </motion.div>
        
        {/* Settings Items */}
        <div className="space-y-2 mb-6">
          {settingsItems.map((item, i) =>
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            onClick={() => setActiveSheet(item.id)}
            className="glass-panel w-full p-4 flex items-center justify-between text-foreground active:scale-95 transition-transform">
            
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <item.icon size={20} className="text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-muted-foreground" />
            </motion.button>
          )}
        </div>
        
        {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={onLogout}
          className="w-full py-4 text-destructive font-bold text-xs uppercase tracking-widest hover:text-destructive/80 transition-colors flex items-center justify-center gap-2">
          
          {t('settings.logout')} <LogOut size={16} />
        </motion.button>
      </div>

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={onUpdateProfile} />

      <NotificationsSheet isOpen={activeSheet === 'notifications'} onClose={() => setActiveSheet(null)} />
      <PrivacySheet isOpen={activeSheet === 'privacy'} onClose={() => setActiveSheet(null)} />
      <HelpSheet isOpen={activeSheet === 'help'} onClose={() => setActiveSheet(null)} />
      
    </div>);

};