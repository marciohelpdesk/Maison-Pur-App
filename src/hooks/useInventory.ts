import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem } from '@/types';

interface DbInventory {
  id: string;
  user_id: string;
  property_id: string | null;
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
  category: string;
  reorder_photo: string | null;
  created_at: string;
  updated_at: string;
}

const mapDbToInventory = (db: DbInventory): InventoryItem => ({
  id: db.id,
  name: db.name,
  quantity: db.quantity,
  unit: db.unit,
  threshold: db.threshold,
  category: db.category,
  reorderPhoto: db.reorder_photo || undefined,
  propertyId: db.property_id || undefined,
});

export const useInventory = (userId: string | undefined, propertyId?: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['inventory', userId, propertyId],
    queryFn: async (): Promise<InventoryItem[]> => {
      if (!userId) return [];
      
      let q = supabase
        .from('inventory')
        .select('*')
        .eq('user_id', userId)
        .order('category', { ascending: true });
      
      if (propertyId) {
        q = q.eq('property_id', propertyId);
      }
      
      const { data, error } = await q;
      if (error) throw error;
      return (data as DbInventory[]).map(mapDbToInventory);
    },
    enabled: !!userId,
  });

  const addItem = useMutation({
    mutationFn: async (item: Omit<InventoryItem, 'id'>) => {
      if (!userId) throw new Error('No user ID');
      
      const { data, error } = await supabase
        .from('inventory')
        .insert({
          user_id: userId,
          property_id: item.propertyId || propertyId || null,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          threshold: item.threshold,
          category: item.category,
          reorder_photo: item.reorderPhoto || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToInventory(data as DbInventory);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', userId] });
    },
  });

  const updateItem = useMutation({
    mutationFn: async (item: InventoryItem) => {
      if (!userId) throw new Error('No user ID');
      
      const { error } = await supabase
        .from('inventory')
        .update({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          threshold: item.threshold,
          category: item.category,
          reorder_photo: item.reorderPhoto || null,
        })
        .eq('id', item.id)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', userId] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (itemId: string) => {
      if (!userId) throw new Error('No user ID');
      
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', userId] });
    },
  });

  const copyFromProperty = useMutation({
    mutationFn: async (sourcePropertyId: string) => {
      if (!userId || !propertyId) throw new Error('No user/property ID');
      
      const { data: sourceItems, error: fetchError } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', userId)
        .eq('property_id', sourcePropertyId);
      
      if (fetchError) throw fetchError;
      if (!sourceItems || sourceItems.length === 0) throw new Error('No items to copy');
      
      const newItems = (sourceItems as DbInventory[]).map(item => ({
        user_id: userId,
        property_id: propertyId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        threshold: item.threshold,
        category: item.category,
        reorder_photo: item.reorder_photo,
      }));
      
      const { error: insertError } = await supabase
        .from('inventory')
        .insert(newItems);
      
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory', userId] });
    },
  });

  return {
    inventory: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addItem: addItem.mutate,
    updateItem: updateItem.mutate,
    deleteItem: deleteItem.mutate,
    copyFromProperty: copyFromProperty.mutate,
    isAdding: addItem.isPending,
    isUpdating: updateItem.isPending,
    isDeleting: deleteItem.isPending,
    isCopying: copyFromProperty.isPending,
  };
};
