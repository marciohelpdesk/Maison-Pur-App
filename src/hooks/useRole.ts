import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'moderator' | 'user' | 'cleaner';

interface UseRoleReturn {
  role: AppRole | null;
  isAdmin: boolean;
  isCleaner: boolean;
  isLoading: boolean;
  adminId: string | null;
  isRevoked: boolean;
}

export const useRole = (userId?: string): UseRoleReturn => {
  const [role, setRole] = useState<AppRole | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [isRevoked, setIsRevoked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        // Get all user roles
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);

        const roleList = (roles || []).map(r => r.role as AppRole);
        
        // Check if user has cleaner role
        const hasCleaner = roleList.includes('cleaner');
        
        // Check active team membership
        if (hasCleaner) {
          const { data: membership } = await supabase
            .from('team_members')
            .select('admin_id, status')
            .eq('member_user_id', userId)
            .limit(1)
            .maybeSingle();

          if (membership) {
            if (membership.status === 'revoked') {
              setIsRevoked(true);
              setRole('cleaner');
              setAdminId(null);
            } else {
              setRole('cleaner');
              setAdminId(membership.admin_id);
              setIsRevoked(false);
            }
          } else {
            // Has cleaner role but no membership — treat as regular user
            setRole('user');
            setIsRevoked(false);
          }
        } else {
          // Not a cleaner — they are the workspace owner
          setRole(roleList[0] || 'user');
          setIsRevoked(false);
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
    isRevoked,
  };
};
