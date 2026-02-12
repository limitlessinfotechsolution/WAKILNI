import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Calendar, Plus, User, Settings,
  LayoutDashboard, Briefcase, Users, Star, Package,
  ShieldCheck, Activity, LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useLanguage } from '@/lib/i18n';
import { useHaptics } from '@/hooks/useHaptics';

interface TabItem {
  icon: LucideIcon;
  label: string;
  labelAr: string;
  path: string;
  isCenter?: boolean;
}

const TRAVELER_TABS: TabItem[] = [
  { icon: Home, label: 'Home', labelAr: 'الرئيسية', path: '/dashboard' },
  { icon: Calendar, label: 'Bookings', labelAr: 'الحجوزات', path: '/bookings' },
  { icon: Plus, label: 'Book', labelAr: 'حجز', path: '/bookings/new', isCenter: true },
  { icon: Users, label: 'Family', labelAr: 'العائلة', path: '/beneficiaries' },
  { icon: User, label: 'Profile', labelAr: 'الملف', path: '/settings/profile' },
];

const PROVIDER_TABS: TabItem[] = [
  { icon: LayoutDashboard, label: 'Home', labelAr: 'الرئيسية', path: '/provider' },
  { icon: Calendar, label: 'Calendar', labelAr: 'التقويم', path: '/provider/calendar' },
  { icon: Plus, label: 'Service', labelAr: 'خدمة', path: '/provider/services', isCenter: true },
  { icon: Star, label: 'Reviews', labelAr: 'التقييمات', path: '/provider/reviews' },
  { icon: User, label: 'Profile', labelAr: 'الملف', path: '/settings/profile' },
];

const VENDOR_TABS: TabItem[] = [
  { icon: LayoutDashboard, label: 'Home', labelAr: 'الرئيسية', path: '/vendor' },
  { icon: Briefcase, label: 'Bookings', labelAr: 'الحجوزات', path: '/vendor/bookings' },
  { icon: Package, label: 'Services', labelAr: 'الخدمات', path: '/vendor/services' },
  { icon: Settings, label: 'Settings', labelAr: 'الإعدادات', path: '/settings/profile' },
];

const ADMIN_TABS: TabItem[] = [
  { icon: LayoutDashboard, label: 'Home', labelAr: 'الرئيسية', path: '/admin' },
  { icon: ShieldCheck, label: 'KYC', labelAr: 'التحقق', path: '/admin/kyc' },
  { icon: Users, label: 'Users', labelAr: 'المستخدمين', path: '/admin/users' },
  { icon: Activity, label: 'Analytics', labelAr: 'التحليلات', path: '/super-admin/analytics' },
  { icon: Settings, label: 'Settings', labelAr: 'الإعدادات', path: '/settings/profile' },
];

export function FloatingTabBar() {
  const { role } = useAuth();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const haptics = useHaptics();

  const tabs = React.useMemo(() => {
    switch (role) {
      case 'provider': return PROVIDER_TABS;
      case 'vendor': return VENDOR_TABS;
      case 'admin': case 'super_admin': return ADMIN_TABS;
      default: return TRAVELER_TABS;
    }
  }, [role]);

  const handleTabClick = (path: string) => {
    haptics.selection();
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === '/dashboard' || path === '/provider' || path === '/vendor' || path === '/admin') {
      return location.pathname === path || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="floating-tab-bar lg:hidden" role="navigation" aria-label="Main navigation">
      <div className="flex items-center justify-around px-1 py-1">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;

          if (tab.isCenter) {
            return (
              <button
                key={tab.path}
                onClick={() => handleTabClick(tab.path)}
                className={cn(
                  'relative -mt-5 flex items-center justify-center',
                  'w-12 h-12 rounded-xl',
                  'bg-primary text-primary-foreground',
                  'shadow-lg shadow-primary/25',
                  'transition-all duration-200',
                  'hover:scale-105 active:scale-95',
                  'touch-manipulation'
                )}
                aria-label={isRTL ? tab.labelAr : tab.label}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          }

          return (
            <button
              key={tab.path}
              onClick={() => handleTabClick(tab.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 min-w-[52px]',
                'transition-colors duration-200 touch-manipulation rounded-lg',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-label={isRTL ? tab.labelAr : tab.label}
              aria-current={active ? 'page' : undefined}
            >
              <div className={cn(
                'flex items-center justify-center w-8 h-8 rounded-lg transition-all',
                active && 'bg-primary/10'
              )}>
                <Icon className={cn('h-[18px] w-[18px]', active && 'scale-110')} />
              </div>
              <span className={cn(
                'text-[10px] font-medium leading-none',
                active && 'font-semibold'
              )}>
                {isRTL ? tab.labelAr : tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
