import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  member_user_id: string;
  email: string;
  name: string;
  created_at: string;
}

interface TeamInvite {
  id: string;
  email: string;
  status: string;
  created_at: string;
}

export const useTeamInvites = (userId?: string) => {
  const [isInviting, setIsInviting] = useState(false);

  const inviteMember = async (email: string): Promise<{ success: boolean; tempPassword?: string }> => {
    if (!userId) return { success: false };
    
    setIsInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke('invite-team-member', {
        body: { email },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.tempPassword) {
        toast.success(`Membro convidado! Senha temporária: ${data.tempPassword}`, {
          duration: 15000,
        });
      } else {
        toast.success('Membro adicionado à equipe!');
      }

      return { success: true, tempPassword: data?.tempPassword };
    } catch (err: any) {
      toast.error(err.message || 'Erro ao convidar membro');
      return { success: false };
    } finally {
      setIsInviting(false);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('invite-team-member', {
        body: { action: 'remove', memberId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('Membro removido da equipe');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover membro');
      return false;
    }
  };

  return { inviteMember, removeMember, isInviting };
};
