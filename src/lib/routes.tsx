import { lazy, Suspense, ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';

// Lazy loading for performance
const Login = lazy(() => import('@/pages/auth/Login'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Agenda = lazy(() => import('@/pages/Agenda'));
const Properties = lazy(() => import('@/pages/Properties'));
const PropertyDetails = lazy(() => import('@/pages/PropertyDetails'));
const JobDetails = lazy(() => import('@/pages/JobDetails'));
const Execution = lazy(() => import('@/pages/Execution'));
const Settings = lazy(() => import('@/pages/Settings'));
const Finance = lazy(() => import('@/pages/Finance'));
const KpiDashboard = lazy(() => import('@/pages/KpiDashboard'));
const Expenses = lazy(() => import('@/pages/Expenses'));
const Reports = lazy(() => import('@/pages/Reports'));
const Invoices = lazy(() => import('@/pages/Invoices'));
const Estimates = lazy(() => import('@/pages/Estimates'));
const CashFlow = lazy(() => import('@/pages/CashFlow'));
const PublicReport = lazy(() => import('@/pages/PublicReport'));
const PublicInvoice = lazy(() => import('@/pages/PublicInvoice'));
const PublicEstimate = lazy(() => import('@/pages/PublicEstimate'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Animated Loading component
export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-10 h-10 text-primary" />
      </motion.div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-muted-foreground font-medium"
      >
        Carregando...
      </motion.span>
    </motion.div>
  </div>
);

// Auth Guard - protects private routes
export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Revocation guard — signs out revoked cleaners
export const RevokedGuard = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const { isRevoked, isLoading } = useRole(user?.id);

  if (isLoading) return <PageLoader />;
  
  if (isRevoked) {
    signOut();
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public only - redirects authenticated users
export const PublicOnly = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }
  
  if (user) {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

// Admin-only route guard - redirects cleaners to dashboard
export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { isCleaner, isLoading } = useRole(user?.id);

  if (isLoading) return <PageLoader />;
  if (isCleaner) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

// Protected layout shell
export const ProtectedLayout = () => (
  <RequireAuth>
    <RevokedGuard>
      <ResponsiveLayout>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </ResponsiveLayout>
    </RevokedGuard>
  </RequireAuth>
);

// Suspense wrapper for lazy components
const SuspenseWrapper = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<PageLoader />}>
    {children}
  </Suspense>
);

// Route definitions
export const routes = [
  // Public routes
  {
    path: '/login',
    element: (
      <PublicOnly>
        <SuspenseWrapper><Login /></SuspenseWrapper>
      </PublicOnly>
    ),
  },
  {
    path: '/reset-password',
    element: <SuspenseWrapper><ResetPassword /></SuspenseWrapper>,
  },

  // Protected routes
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'agenda', element: <RequireAdmin><Agenda /></RequireAdmin> },
      { path: 'properties', element: <RequireAdmin><Properties /></RequireAdmin> },
      { path: 'properties/:id', element: <RequireAdmin><PropertyDetails /></RequireAdmin> },
      { path: 'jobs/:id', element: <JobDetails /> },
      { path: 'settings', element: <Settings /> },
      { path: 'finance', element: <RequireAdmin><Finance /></RequireAdmin> },
      { path: 'kpi', element: <RequireAdmin><KpiDashboard /></RequireAdmin> },
      { path: 'expenses', element: <RequireAdmin><Expenses /></RequireAdmin> },
      { path: 'reports', element: <RequireAdmin><Reports /></RequireAdmin> },
      { path: 'invoices', element: <RequireAdmin><Invoices /></RequireAdmin> },
      { path: 'estimates', element: <RequireAdmin><Estimates /></RequireAdmin> },
      { path: 'cashflow', element: <RequireAdmin><CashFlow /></RequireAdmin> },
    ],
  },

  // Execution flow
  {
    path: '/execution/:jobId',
    element: (
      <RequireAuth>
        <RevokedGuard>
          <SuspenseWrapper><Execution /></SuspenseWrapper>
        </RevokedGuard>
      </RequireAuth>
    ),
  },

  // Public viewers
  { path: '/r/:token', element: <SuspenseWrapper><PublicReport /></SuspenseWrapper> },
  { path: '/invoice/:token', element: <SuspenseWrapper><PublicInvoice /></SuspenseWrapper> },
  { path: '/estimate/:token', element: <SuspenseWrapper><PublicEstimate /></SuspenseWrapper> },
  { path: '*', element: <SuspenseWrapper><NotFound /></SuspenseWrapper> },
];
