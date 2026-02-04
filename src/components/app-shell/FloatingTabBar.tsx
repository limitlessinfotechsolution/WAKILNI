import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Plus, 
  User, 
  Settings,
  LayoutDashboard,
  Briefcase,
  Users,
  Star,
  Package,
  ShieldCheck,
  BarChart3,
  Activity,
  LucideIcon
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

const roleColors = {
  traveler: {
    gradient: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-500/30',
    activeBg: 'bg-emerald-500/10',
    activeText: 'text-emerald-600 dark:text-emerald-400',
  },
  provider: {
    gradient: 'from-amber-500 to-orange-500',
    shadow: 'shadow-amber-500/30',
    activeBg: 'bg-amber-500/10',
    activeText: 'text-amber-600 dark:text-amber-400',
  },
  vendor: {
    gradient: 'from-blue-500 to-indigo-500',
    shadow: 'shadow-blue-500/30',
    activeBg: 'bg-blue-500/10',
    activeText: 'text-blue-600 dark:text-blue-400',
  },
  admin: {
    gradient: 'from-purple-500 to-violet-500',
    shadow: 'shadow-purple-500/30',
    activeBg: 'bg-purple-500/10',
    activeText: 'text-purple-600 dark:text-purple-400',
  },
  super_admin: {
    gradient: 'from-red-500 to-rose-500',
    shadow: 'shadow-red-500/30',
    activeBg: 'bg-red-500/10',
    activeText: 'text-red-600 dark:text-red-400',
  },
};

export function FloatingTabBar() {
  const { role } = useAuth();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const haptics = useHaptics();

  const tabs = React.useMemo(() => {
    switch (role) {
      case 'provider':
        return PROVIDER_TABS;
      case 'vendor':
        return VENDOR_TABS;
      case 'admin':
      case 'super_admin':
        return ADMIN_TABS;
      default:
        return TRAVELER_TABS;
    }
  }, [role]);

  const colors = roleColors[role as keyof typeof roleColors] || roleColors.traveler;

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
    <nav className="floating-tab-bar lg:hidden">
      <div className="flex items-center justify-around px-1">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;

          if (tab.isCenter) {
            return (
              <button
                key={tab.path}
                onClick={() => handleTabClick(tab.path)}
                className={cn(
                  'relative -mt-6 flex items-center justify-center',
                  'w-14 h-14 rounded-2xl',
                  'bg-gradient-to-br',
                  colors.gradient,
                  'text-white shadow-lg',
                  colors.shadow,
                  'transition-all duration-200',
                  'hover:scale-105 active:scale-95',
                  'touch-manipulation'
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="sr-only">{isRTL ? tab.labelAr : tab.label}</span>
                {/* Glow effect */}
                <div className={cn(
                  'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity',
                  colors.gradient,
                  'blur-lg -z-10 group-hover:opacity-50'
                )} />
              </button>
            );
          }

          return (
            <button
              key={tab.path}
              onClick={() => handleTabClick(tab.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-2 px-2 min-w-[60px]',
                'transition-all duration-200 touch-manipulation rounded-xl',
                active 
                  ? colors.activeText
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-10 h-10 rounded-xl transition-all',
                active && colors.activeBg
              )}>
                <Icon className={cn('h-5 w-5', active && 'scale-110')} />
              </div>
              <span className={cn(
                'text-[10px] font-semibold transition-all',
                active && 'scale-105'
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
