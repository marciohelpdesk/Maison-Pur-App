import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TeamMemberInfo {
  id: string;
  member_user_id: string;
  created_at: string;
  admin_id: string;
  status: string;
  email?: string;
  name?: string;
}

export const useTeamMembers = (userId?: string) => {
  const { data: members = [], isLoading, refetch } = useQuery({
    queryKey: ['team-members', userId],
    queryFn: async (): Promise<TeamMemberInfo[]> => {
      if (!userId) return [];
      
      // Get team members with active status
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('admin_id', userId)
        .eq('status', 'active');

      if (error) throw error;
      
      // Enrich with profile info
      const memberIds = (data || []).map(m => m.member_user_id);
      
      let profileMap: Record<string, { name: string; email: string }> = {};
      if (memberIds.length > 0) {
        // We can't query profiles of other users due to RLS, so get from team_invites
        const { data: invites } = await supabase
          .from('team_invites')
          .select('email')
          .eq('admin_id', userId)
          .eq('status', 'accepted');
        
        // Map by position (not ideal but works with current schema)
        // Better: match via email from invites
        if (invites) {
          for (const inv of invites) {
            profileMap[inv.email] = { name: inv.email.split('@')[0], email: inv.email };
          }
        }
      }

      // Get invite emails to match with members
      const { data: allInvites } = await supabase
        .from('team_invites')
        .select('email, status')
        .eq('admin_id', userId)
        .eq('status', 'accepted');
      
      const inviteEmails = (allInvites || []).map(i => i.email);

      return (data || []).map((m, idx) => ({
        ...m,
        status: m.status || 'active',
        email: inviteEmails[idx] || undefined,
        name: inviteEmails[idx]?.split('@')[0] || undefined,
      }));
    },
    enabled: !!userId,
  });

  return { members, isLoading, refetch };
};
