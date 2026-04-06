import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Expense {
  id: string;
  user_id: string;
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  property_id: string | null;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ExpenseCategory = 'supplies' | 'transport' | 'equipment' | 'labor' | 'other';

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: 'supplies', label: 'Supplies', icon: '🧴' },
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'equipment', label: 'Equipment', icon: '🔧' },
  { value: 'labor', label: 'Labor', icon: '👷' },
  { value: 'other', label: 'Other', icon: '📦' },
];

export function useExpenses(userId?: string) {
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses' as any)
        .select('*')
        .eq('user_id', userId!)
        .order('expense_date', { ascending: false });
      if (error) throw error;
      return (data as any[]).map((d) => ({
        ...d,
        amount: Number(d.amount) || 0,
      })) as Expense[];
    },
    enabled: !!userId,
  });

  const createExpense = useMutation({
    mutationFn: async (expense: {
      category: string;
      description: string;
      amount: number;
      expense_date: string;
      property_id?: string | null;
      receipt_url?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('expenses' as any)
        .insert({ ...expense, user_id: userId! } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', userId] });
      toast.success('Expense recorded!');
    },
    onError: () => toast.error('Failed to record expense'),
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('expenses' as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', userId] });
      toast.success('Expense deleted!');
    },
    onError: () => toast.error('Failed to delete expense'),
  });

  // Monthly summary
  const getMonthlyTotal = (month?: string) => {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    return expenses
      .filter(e => e.expense_date.startsWith(targetMonth))
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getCategoryBreakdown = (month?: string) => {
    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const monthExpenses = expenses.filter(e => e.expense_date.startsWith(targetMonth));
    const breakdown: Record<string, number> = {};
    monthExpenses.forEach(e => {
      breakdown[e.category] = (breakdown[e.category] || 0) + e.amount;
    });
    return breakdown;
  };

  return {
    expenses,
    isLoading,
    createExpense,
    deleteExpense,
    getMonthlyTotal,
    getCategoryBreakdown,
  };
}
