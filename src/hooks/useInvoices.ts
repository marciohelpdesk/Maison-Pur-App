import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Invoice {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  description: string;
  amount: number;
  status: string;
  public_token: string;
  created_at: string;
  updated_at: string;
}

export function useInvoices(userId?: string) {
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!userId,
  });

  const createInvoice = useMutation({
    mutationFn: async (invoice: { client_name: string; client_email: string; description: string; amount: number }) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert({ ...invoice, user_id: userId! })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', userId] });
      toast.success('Invoice criada com sucesso!');
    },
    onError: () => toast.error('Erro ao criar invoice'),
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: string }) => {
      const newStatus = currentStatus === 'pending' ? 'paid' : 'pending';
      const { error } = await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', userId] });
      toast.success('Status atualizado!');
    },
    onError: () => toast.error('Erro ao atualizar status'),
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', userId] });
      toast.success('Invoice eliminada!');
    },
    onError: () => toast.error('Erro ao eliminar invoice'),
  });

  return { invoices, isLoading, createInvoice, toggleStatus, deleteInvoice };
}

export function usePublicInvoice(token?: string) {
  return useQuery({
    queryKey: ['public-invoice', token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('public_token', token!)
        .single();
      if (error) throw error;
      return data as Invoice;
    },
    enabled: !!token,
  });
}
