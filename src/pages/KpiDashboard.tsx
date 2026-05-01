import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { useInvoices } from '@/hooks/useInvoices';
import { useExpenses } from '@/hooks/useExpenses';
import { useProperties } from '@/hooks/useProperties';
import { PageLoader } from '@/lib/routes';
import { KpiDashboardView } from '@/views/KpiDashboardView';

export default function KpiDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs, isLoading: jobsLoading } = useJobs(user?.id);
  const { invoices, isLoading: invoicesLoading } = useInvoices(user?.id);
  const { expenses, isLoading: expensesLoading, getMonthlyTotal, getCategoryBreakdown } = useExpenses(user?.id);
  const { properties, isLoading: propsLoading } = useProperties(user?.id);

  if (jobsLoading || invoicesLoading || expensesLoading || propsLoading) return <PageLoader />;

  return (
    <KpiDashboardView
      jobs={jobs}
      invoices={invoices}
      expenses={expenses}
      properties={properties}
      monthlyExpenses={getMonthlyTotal()}
      categoryBreakdown={getCategoryBreakdown()}
      onBack={() => navigate('/settings')}
    />
  );
}
