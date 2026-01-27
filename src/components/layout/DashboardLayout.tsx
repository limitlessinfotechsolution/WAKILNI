import { ReactNode } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { Header } from './Header';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { role } = useAuth();

  const getThemeClass = () => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return 'theme-admin';
      case 'provider':
        return 'theme-provider';
      case 'vendor':
        return 'theme-vendor';
      default:
        return 'theme-traveler';
    }
  };

  return (
    <div className={cn('flex min-h-screen w-full bg-background', getThemeClass())}>
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header showNav={false} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
