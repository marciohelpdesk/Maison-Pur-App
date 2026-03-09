import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LineItem } from '@/hooks/useInvoices';

export interface Estimate {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  client_address: string;
  client_phone: string;
  description: string;
  amount: number;
  status: string;
  public_token: string;
  estimate_number: string;
  property_ids: string[];
  service_date: string;
  due_date: string;
  valid_until: string;
  line_items: LineItem[];
  notes: string;
  discount: number;
  tax: number;
  created_at: string;
  updated_at: string;
}

export function useEstimates(userId?: string) {
  const queryClient = useQueryClient();

  const { data: estimates = [], isLoading } = useQuery({
    queryKey: ['estimates', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as any[]).map((d) => ({
        ...d,
        property_ids: d.property_ids || [],
        line_items: d.line_items || [],
        discount: Number(d.discount) || 0,
        tax: Number(d.tax) || 0,
      })) as Estimate[];
    },
    enabled: !!userId,
  });

  const createEstimate = useMutation({
    mutationFn: async (estimate: {
      client_name: string;
      client_email: string;
      client_address: string;
      client_phone: string;
      description: string;
      amount: number;
      property_ids: string[];
      service_date: string;
      due_date: string;
      valid_until: string;
      estimate_number: string;
      line_items: LineItem[];
      notes: string;
      discount: number;
      tax: number;
    }) => {
      const { data, error } = await supabase
        .from('estimates')
        .insert({
          ...estimate,
          user_id: userId!,
          line_items: estimate.line_items as any,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates', userId] });
      toast.success('Estimate created successfully!');
    },
    onError: () => toast.error('Failed to create estimate'),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('estimates')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates', userId] });
      toast.success('Status updated!');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const deleteEstimate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('estimates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimates', userId] });
      toast.success('Estimate deleted!');
    },
    onError: () => toast.error('Failed to delete estimate'),
  });

  return { estimates, isLoading, createEstimate, updateStatus, deleteEstimate };
}

export function usePublicEstimate(token?: string) {
  return useQuery({
    queryKey: ['public-estimate', token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .eq('public_token', token!)
        .single();
      if (error) throw error;
      const d = data as any;
      return {
        ...d,
        property_ids: d.property_ids || [],
        line_items: d.line_items || [],
        discount: Number(d.discount) || 0,
        tax: Number(d.tax) || 0,
      } as Estimate;
    },
    enabled: !!token,
  });
}
