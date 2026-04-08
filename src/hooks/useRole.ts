import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'moderator' | 'user' | 'cleaner';

interface UseRoleReturn {
  role: AppRole | null;
  isAdmin: boolean;
  isCleaner: boolean;
  isLoading: boolean;
  adminId: string | null;
}

export const useRole = (userId?: string): UseRoleReturn => {
  const [role, setRole] = useState<AppRole | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        // Get user role
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);

        const userRole = roles?.[0]?.role as AppRole || 'user';
        setRole(userRole);

        // If cleaner, get admin_id from team_members
        if (userRole === 'cleaner') {
          const { data: membership } = await supabase
            .from('team_members')
            .select('admin_id')
            .eq('member_user_id', userId)
            .limit(1)
            .maybeSingle();

          setAdminId(membership?.admin_id || null);
        }
      } catch (err) {
        console.error('Error fetching role:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [userId]);

  return {
    role,
    isAdmin: role !== 'cleaner',
    isCleaner: role === 'cleaner',
    isLoading,
    adminId,
  };
};
