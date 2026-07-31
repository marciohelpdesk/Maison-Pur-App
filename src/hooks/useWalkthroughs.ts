import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { WalkthroughArea, WalkthroughConfig, WalkthroughPricing } from '@/lib/walkthroughPricing';

export interface Walkthrough {
  id: string;
  user_id: string;
  property_id: string | null;
  property_name: string;
  property_address: string;
  client_name: string;
  client_email: string;
  status: 'draft' | 'sent' | 'converted';
  config: WalkthroughConfig;
  areas: WalkthroughArea[];
  condition: Record<string, unknown>;
  pricing: WalkthroughPricing;
  notes: string;
  public_token: string;
  created_at: string;
  updated_at: string;
}

const TABLE = 'walkthroughs' as any;

const map = (d: any): Walkthrough => ({
  ...d,
  config: d.config || {},
  areas: d.areas || [],
  condition: d.condition || {},
  pricing: d.pricing || {},
});

export type WalkthroughInput = Pick<
  Walkthrough,
  'property_id' | 'property_name' | 'property_address' | 'client_name' | 'client_email' | 'status' | 'config' | 'areas' | 'pricing' | 'notes'
>;

export function useWalkthroughs(userId?: string) {
  const qc = useQueryClient();

  const { data: walkthroughs = [], isLoading } = useQuery({
    queryKey: ['walkthroughs', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as any[]).map(map);
    },
    enabled: !!userId,
  });

  const createWalkthrough = useMutation({
    mutationFn: async (payload: WalkthroughInput) => {
      const { data, error } = await supabase
        .from(TABLE)
        .insert({ ...payload, user_id: userId! } as any)
        .select()
        .single();
      if (error) throw error;
      return map(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['walkthroughs'] });
      toast.success('Walkthrough saved');
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to save walkthrough'),
  });

  const updateWalkthrough = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Walkthrough> & { id: string }) => {
      const { error } = await supabase.from(TABLE).update(patch as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['walkthroughs'] }),
    onError: (e: any) => toast.error(e?.message || 'Failed to update walkthrough'),
  });

  const deleteWalkthrough = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(TABLE).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['walkthroughs'] });
      toast.success('Walkthrough deleted');
    },
  });

  return { walkthroughs, isLoading, createWalkthrough, updateWalkthrough, deleteWalkthrough };
}

export function usePublicWalkthrough(token?: string) {
  return useQuery({
    queryKey: ['public-walkthrough', token],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_walkthrough_by_token' as any, { p_token: token! });
      if (error) throw error;
      const d = (data as any[])?.[0];
      if (!d) throw new Error('Not found');
      return map(d);
    },
    enabled: !!token,
  });
}
