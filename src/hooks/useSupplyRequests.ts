import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SupplyRequestItem {
  inventory_id?: string | null;
  name: string;
  category?: string;
  qty_needed: number;
  unit?: string;
  photo_url?: string | null;
  note?: string;
}

export interface SupplyRequest {
  id: string;
  user_id: string;
  property_id: string | null;
  property_name: string;
  property_address: string;
  public_token: string;
  status: 'draft' | 'sent' | 'fulfilled';
  notes: string;
  items: SupplyRequestItem[];
  created_at: string;
  updated_at: string;
}

const map = (d: any): SupplyRequest => ({
  ...d,
  items: (d.items as SupplyRequestItem[]) || [],
});

export function useSupplyRequests(userId?: string, propertyId?: string) {
  const qc = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['supply_requests', userId, propertyId],
    queryFn: async () => {
      let q = supabase
        .from('supply_requests')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });
      if (propertyId) q = q.eq('property_id', propertyId);
      const { data, error } = await q;
      if (error) throw error;
      return (data as any[]).map(map);
    },
    enabled: !!userId,
  });

  const createRequest = useMutation({
    mutationFn: async (payload: Omit<SupplyRequest, 'id' | 'user_id' | 'public_token' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('supply_requests')
        .insert({
          user_id: userId!,
          property_id: payload.property_id,
          property_name: payload.property_name,
          property_address: payload.property_address,
          status: payload.status,
          notes: payload.notes,
          items: payload.items as any,
        })
        .select()
        .single();
      if (error) throw error;
      return map(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supply_requests'] });
      toast.success('Supply request created');
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to create request'),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: SupplyRequest['status'] }) => {
      const { error } = await supabase.from('supply_requests').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['supply_requests'] }),
  });

  const deleteRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('supply_requests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supply_requests'] });
      toast.success('Request deleted');
    },
  });

  return { requests, isLoading, createRequest, updateStatus, deleteRequest };
}

export function usePublicSupplyRequest(token?: string) {
  return useQuery({
    queryKey: ['public-supply-request', token],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_supply_request_by_token', { p_token: token! });
      if (error) throw error;
      const d = (data as any[])?.[0];
      if (!d) throw new Error('Not found');
      return map(d);
    },
    enabled: !!token,
  });
}
