import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LineItem {
  description: string;
  property_name: string;
  address: string;
  service_type: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface Invoice {
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
  property_ids: string[];
  service_date: string;
  due_date: string;
  invoice_number: string;
  line_items: LineItem[];
  notes: string;
  discount: number;
  tax: number;
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
      return (data as any[]).map((d) => ({
        ...d,
        property_ids: d.property_ids || [],
        line_items: d.line_items || [],
        discount: Number(d.discount) || 0,
        tax: Number(d.tax) || 0,
      })) as Invoice[];
    },
    enabled: !!userId,
  });

  const createInvoice = useMutation({
    mutationFn: async (invoice: {
      client_name: string;
      client_email: string;
      client_address: string;
      client_phone: string;
      description: string;
      amount: number;
      property_ids: string[];
      service_date: string;
      due_date: string;
      invoice_number: string;
      line_items: LineItem[];
      notes: string;
      discount: number;
      tax: number;
    }) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          ...invoice,
          user_id: userId!,
          line_items: invoice.line_items as any,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', userId] });
      toast.success('Invoice created successfully!');
    },
    onError: () => toast.error('Failed to create invoice'),
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
      toast.success('Status updated!');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', userId] });
      toast.success('Invoice deleted!');
    },
    onError: () => toast.error('Failed to delete invoice'),
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
      const d = data as any;
      return {
        ...d,
        property_ids: d.property_ids || [],
        line_items: d.line_items || [],
        discount: Number(d.discount) || 0,
        tax: Number(d.tax) || 0,
      } as Invoice;
    },
    enabled: !!token,
  });
}
