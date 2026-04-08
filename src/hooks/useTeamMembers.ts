import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TeamMemberInfo {
  id: string;
  member_user_id: string;
  created_at: string;
  admin_id: string;
}

export const useTeamMembers = (userId?: string) => {
  const { data: members = [], isLoading, refetch } = useQuery({
    queryKey: ['team-members', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('admin_id', userId);

      if (error) throw error;
      return data as TeamMemberInfo[];
    },
    enabled: !!userId,
  });

  return { members, isLoading, refetch };
};
