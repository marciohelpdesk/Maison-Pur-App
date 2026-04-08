import { useNavigate } from 'react-router-dom';
import { SettingsView as SettingsContent } from '@/views/SettingsView';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useRole } from '@/hooks/useRole';
import { UserProfile } from '@/types';

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, updateProfile, isLoading: profileLoading } = useProfile(user?.id);
  const { isAdmin, isLoading: roleLoading } = useRole(user?.id);

  const isLoading = profileLoading || roleLoading;

  const userProfile: UserProfile = profile || {
    name: user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    phone: '',
    avatar: '',
    role: 'Cleaner',
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleViewFinance = () => {
    navigate('/finance');
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    updateProfile(updatedProfile);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <SettingsContent
      userId={user?.id}
      userProfile={userProfile}
      onLogout={handleLogout}
      onViewFinance={handleViewFinance}
      onUpdateProfile={handleUpdateProfile}
      isAdmin={isAdmin}
    />
  );
}
