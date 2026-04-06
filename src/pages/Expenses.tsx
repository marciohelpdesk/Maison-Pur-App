import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useExpenses, EXPENSE_CATEGORIES } from '@/hooks/useExpenses';
import { useProperties } from '@/hooks/useProperties';
import { PageLoader } from '@/lib/routes';
import { ExpensesView } from '@/views/ExpensesView';

export default function Expenses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { expenses, isLoading, createExpense, deleteExpense } = useExpenses(user?.id);
  const { properties } = useProperties(user?.id);

  if (isLoading) return <PageLoader />;

  return (
    <ExpensesView
      expenses={expenses}
      properties={properties}
      onAddExpense={(data) => createExpense.mutate(data)}
      onDeleteExpense={(id) => deleteExpense.mutate(id)}
      onBack={() => navigate('/settings')}
      isAdding={createExpense.isPending}
    />
  );
}
