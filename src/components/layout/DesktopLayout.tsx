import { ReactNode } from 'react';
import { DesktopSidebar } from './DesktopSidebar';
import { BackgroundEffects } from '@/components/BackgroundEffects';

interface DesktopLayoutProps {
  children: ReactNode;
}

export const DesktopLayout = ({ children }: DesktopLayoutProps) => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 z-0" style={{
        background: 'radial-gradient(circle at 0% 0%, hsl(330 100% 97%) 0%, transparent 40%), radial-gradient(circle at 100% 100%, hsl(230 100% 97%) 0%, transparent 40%), hsl(var(--background))'
      }} />

      <DesktopSidebar />

      {/* Main Content */}
      <main className="ml-[260px] relative z-10 min-h-screen">
        <div className="max-w-5xl mx-auto px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};
