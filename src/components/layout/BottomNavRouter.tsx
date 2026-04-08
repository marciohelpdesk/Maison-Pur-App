import { Home, Calendar, Building2, Settings, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';

interface NavItem {
  path: string;
  icon: typeof Home;
  adminOnly: boolean;
}

const allNavItems: NavItem[] = [
  { path: '/dashboard', icon: Home, adminOnly: false },
  { path: '/agenda', icon: Calendar, adminOnly: true },
  { path: '/reports', icon: FileText, adminOnly: true },
  { path: '/properties', icon: Building2, adminOnly: true },
  { path: '/settings', icon: Settings, adminOnly: false },
];

export const BottomNavRouter = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useRole(user?.id);

  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <nav className="relative z-50 px-6 pb-6 pb-safe shrink-0">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
        className="glass-panel-elevated flex justify-around items-center py-3 px-2.5 relative"
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center"
            >
              <motion.div 
                animate={{
                  y: isActive ? -10 : 0,
                  scale: isActive ? 1 : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`w-[50px] h-[50px] rounded-full flex items-center justify-center transition-colors duration-300 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground'
                }`}
                style={isActive ? {
                  boxShadow: '0 10px 20px hsl(252 70% 72% / 0.3)',
                } : undefined}
              >
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.5} />
              </motion.div>
            </NavLink>
          );
        })}
      </motion.div>
    </nav>
  );
};
