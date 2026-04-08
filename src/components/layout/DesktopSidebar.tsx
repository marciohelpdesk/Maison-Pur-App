import { Home, Calendar, Building2, Settings, FileText, DollarSign, Receipt, ClipboardList, LogOut } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { BrandLogo } from '@/components/BrandLogo';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useRole } from '@/hooks/useRole';
import { cn } from '@/lib/utils';

const allNavItems = [
  { path: '/dashboard', icon: Home, label: 'Dashboard', adminOnly: false },
  { path: '/agenda', icon: Calendar, label: 'Agenda', adminOnly: true },
  { path: '/properties', icon: Building2, label: 'Propriedades', adminOnly: true },
  { path: '/reports', icon: FileText, label: 'Relatórios', adminOnly: true },
  { path: '/invoices', icon: Receipt, label: 'Faturas', adminOnly: true },
  { path: '/estimates', icon: ClipboardList, label: 'Orçamentos', adminOnly: true },
  { path: '/finance', icon: DollarSign, label: 'Financeiro', adminOnly: true },
  { path: '/settings', icon: Settings, label: 'Configurações', adminOnly: false },
];

export const DesktopSidebar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { profile } = useProfile(user?.id);
  const { isAdmin } = useRole(user?.id);

  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] z-40 flex flex-col border-r border-border bg-card/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BrandLogo className="w-7 h-7 object-contain" />
        </div>
        <span className="text-lg font-bold text-foreground tracking-tight">Maison Pur</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.5} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-border">
            <AvatarImage src={profile?.avatar} alt={profile?.name} />
            <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">
              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{profile?.name || 'Usuário'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
