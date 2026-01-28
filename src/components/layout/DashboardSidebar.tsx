import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Calendar, Users, FileText, Star, Settings, ChevronLeft, ChevronRight,
  CreditCard, Building2, Shield, UserCheck, BarChart3, DollarSign, Bell,
  BookOpen, Clock, Heart, Compass, Moon, Sun, CalendarClock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  title: string;
  titleAr: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const travelerNav: NavItem[] = [
  { title: 'Dashboard', titleAr: 'لوحة التحكم', href: '/dashboard', icon: Home },
  { title: 'Bookings', titleAr: 'الحجوزات', href: '/bookings', icon: Calendar },
  { title: 'Beneficiaries', titleAr: 'المستفيدون', href: '/beneficiaries', icon: Users },
  { title: 'Services', titleAr: 'الخدمات', href: '/services', icon: FileText },
  { title: 'Settings', titleAr: 'الإعدادات', href: '/settings/profile', icon: Settings },
];

const providerNav: NavItem[] = [
  { title: 'Dashboard', titleAr: 'لوحة التحكم', href: '/provider', icon: Home },
  { title: 'Calendar', titleAr: 'التقويم', href: '/provider/calendar', icon: Calendar },
  { title: 'Availability', titleAr: 'التوفر', href: '/provider/availability', icon: CalendarClock },
  { title: 'Services', titleAr: 'الخدمات', href: '/provider/services', icon: FileText },
  { title: 'Reviews', titleAr: 'المراجعات', href: '/provider/reviews', icon: Star },
  { title: 'Verification', titleAr: 'التحقق', href: '/provider/kyc', icon: Shield },
];

const vendorNav: NavItem[] = [
  { title: 'Dashboard', titleAr: 'لوحة التحكم', href: '/vendor', icon: Home },
  { title: 'Bookings', titleAr: 'الحجوزات', href: '/vendor/bookings', icon: Calendar },
  { title: 'Services', titleAr: 'الخدمات', href: '/vendor/services', icon: FileText },
  { title: 'Subscription', titleAr: 'الاشتراك', href: '/vendor/subscription', icon: CreditCard },
  { title: 'Verification', titleAr: 'التحقق', href: '/vendor/kyc', icon: Shield },
];

const adminNav: NavItem[] = [
  { title: 'Dashboard', titleAr: 'لوحة التحكم', href: '/admin', icon: Home },
  { title: 'Users', titleAr: 'المستخدمون', href: '/admin/users', icon: Users },
  { title: 'Providers', titleAr: 'مقدمو الخدمات', href: '/admin/providers', icon: UserCheck },
  { title: 'Vendors', titleAr: 'الشركات', href: '/admin/vendors', icon: Building2 },
  { title: 'KYC Queue', titleAr: 'طابور التحقق', href: '/admin/kyc', icon: Shield },
  { title: 'Subscriptions', titleAr: 'الاشتراكات', href: '/admin/subscriptions', icon: CreditCard },
  { title: 'Donations', titleAr: 'التبرعات', href: '/admin/donations', icon: Heart },
  { title: 'Allocations', titleAr: 'التخصيصات', href: '/admin/allocations', icon: BarChart3 },
];

const superAdminNav: NavItem[] = [
  { title: 'Analytics', titleAr: 'التحليلات', href: '/super-admin/analytics', icon: BarChart3 },
  { title: 'Subscriptions', titleAr: 'الاشتراكات', href: '/super-admin/subscriptions', icon: DollarSign },
  { title: 'System Settings', titleAr: 'إعدادات النظام', href: '/super-admin/settings', icon: Settings },
  { title: 'Audit Logs', titleAr: 'سجل التدقيق', href: '/super-admin/audit', icon: Clock },
  { title: 'Admin Management', titleAr: 'إدارة المشرفين', href: '/super-admin/admins', icon: Shield },
];

export function DashboardSidebar() {
  const { isRTL } = useLanguage();
  const { role } = useAuth();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  const getNavItems = (): { main: NavItem[]; extra?: NavItem[] } => {
    switch (role) {
      case 'super_admin':
        return { main: adminNav, extra: superAdminNav };
      case 'admin':
        return { main: adminNav };
      case 'provider':
        return { main: providerNav };
      case 'vendor':
        return { main: vendorNav };
      default:
        return { main: travelerNav };
    }
  };

  const { main: navItems, extra: extraItems } = getNavItems();

  const getRoleThemeClass = () => {
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

  const ExpandIcon = isRTL 
    ? (isExpanded ? ChevronRight : ChevronLeft) 
    : (isExpanded ? ChevronLeft : ChevronRight);

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 flex flex-col border-e bg-sidebar transition-all duration-300',
        isExpanded ? 'w-64' : 'w-16',
        getRoleThemeClass()
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 border-b px-4',
        isExpanded ? 'justify-between' : 'justify-center'
      )}>
        {isExpanded && (
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <span className={`text-lg font-bold ${isRTL ? 'font-arabic' : ''}`}>و</span>
            </div>
            <span className={`text-lg font-semibold ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'وكّلني' : 'Wakilni'}
            </span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8"
        >
          <ExpandIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            const linkContent = (
              <Link
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  !isExpanded && 'justify-center px-2'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {isExpanded && (
                  <span className={isRTL ? 'font-arabic' : ''}>
                    {isRTL ? item.titleAr : item.title}
                  </span>
                )}
              </Link>
            );

            if (!isExpanded) {
              return (
                <li key={item.href}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side={isRTL ? 'left' : 'right'} className="font-medium">
                      {isRTL ? item.titleAr : item.title}
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            }

            return <li key={item.href}>{linkContent}</li>;
          })}
        </ul>

        {/* Super Admin Extra Items */}
        {extraItems && extraItems.length > 0 && (
          <>
            <div className={cn('px-4 py-2 mt-4', !isExpanded && 'hidden')}>
              <p className="text-xs text-destructive font-semibold uppercase tracking-wider">
                {isRTL ? 'المشرف الرئيسي' : 'Super Admin'}
              </p>
            </div>
            <ul className="space-y-1 px-2">
              {extraItems.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;

                const linkContent = (
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-destructive text-destructive-foreground'
                        : 'text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive',
                      !isExpanded && 'justify-center px-2'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {isExpanded && (
                      <span className={isRTL ? 'font-arabic' : ''}>
                        {isRTL ? item.titleAr : item.title}
                      </span>
                    )}
                  </Link>
                );

                if (!isExpanded) {
                  return (
                    <li key={item.href}>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          {linkContent}
                        </TooltipTrigger>
                        <TooltipContent side={isRTL ? 'left' : 'right'} className="font-medium">
                          {isRTL ? item.titleAr : item.title}
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  );
                }

                return <li key={item.href}>{linkContent}</li>;
              })}
            </ul>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        {isExpanded ? (
          <div className="text-xs text-muted-foreground text-center">
            {isRTL ? 'وكّلني © 2024' : '© 2024 Wakilni'}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
