import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Calendar, Users, FileText, Star, Shield, CreditCard, Settings, 
  BarChart3, Heart, Menu, CalendarClock, Building2, Clock, DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  title: string;
  titleAr: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavSection {
  title: string;
  titleAr: string;
  items: NavItem[];
}

const travelerNav: NavItem[] = [
  { title: 'Home', titleAr: 'الرئيسية', href: '/dashboard', icon: Home },
  { title: 'Bookings', titleAr: 'الحجوزات', href: '/bookings', icon: Calendar },
  { title: 'Services', titleAr: 'الخدمات', href: '/services', icon: FileText },
  { title: 'Beneficiaries', titleAr: 'المستفيدون', href: '/beneficiaries', icon: Users },
];

const travelerMoreSections: NavSection[] = [
  {
    title: 'Actions',
    titleAr: 'إجراءات',
    items: [
      { title: 'Donate', titleAr: 'تبرع', href: '/donate', icon: Heart },
    ],
  },
  {
    title: 'Account',
    titleAr: 'الحساب',
    items: [
      { title: 'Settings', titleAr: 'الإعدادات', href: '/settings/profile', icon: Settings },
    ],
  },
];

const providerNav: NavItem[] = [
  { title: 'Home', titleAr: 'الرئيسية', href: '/provider', icon: Home },
  { title: 'Calendar', titleAr: 'التقويم', href: '/provider/calendar', icon: Calendar },
  { title: 'Services', titleAr: 'الخدمات', href: '/provider/services', icon: FileText },
  { title: 'Reviews', titleAr: 'التقييمات', href: '/provider/reviews', icon: Star },
];

const providerMoreSections: NavSection[] = [
  {
    title: 'Manage',
    titleAr: 'إدارة',
    items: [
      { title: 'Availability', titleAr: 'التوفر', href: '/provider/availability', icon: CalendarClock },
      { title: 'Verification', titleAr: 'التحقق', href: '/provider/kyc', icon: Shield },
    ],
  },
  {
    title: 'Account',
    titleAr: 'الحساب',
    items: [
      { title: 'Settings', titleAr: 'الإعدادات', href: '/settings/profile', icon: Settings },
    ],
  },
];

const vendorNav: NavItem[] = [
  { title: 'Home', titleAr: 'الرئيسية', href: '/vendor', icon: Home },
  { title: 'Bookings', titleAr: 'الحجوزات', href: '/vendor/bookings', icon: Calendar },
  { title: 'Services', titleAr: 'الخدمات', href: '/vendor/services', icon: FileText },
  { title: 'Plan', titleAr: 'الاشتراك', href: '/vendor/subscription', icon: CreditCard },
];

const vendorMoreSections: NavSection[] = [
  {
    title: 'Business',
    titleAr: 'الأعمال',
    items: [
      { title: 'Verification', titleAr: 'التحقق', href: '/vendor/kyc', icon: Shield },
    ],
  },
  {
    title: 'Account',
    titleAr: 'الحساب',
    items: [
      { title: 'Settings', titleAr: 'الإعدادات', href: '/settings/profile', icon: Settings },
    ],
  },
];

const adminNav: NavItem[] = [
  { title: 'Home', titleAr: 'الرئيسية', href: '/admin', icon: Home },
  { title: 'Users', titleAr: 'المستخدمون', href: '/admin/users', icon: Users },
  { title: 'KYC', titleAr: 'التحقق', href: '/admin/kyc', icon: Shield },
  { title: 'Stats', titleAr: 'الإحصائيات', href: '/super-admin/analytics', icon: BarChart3 },
];

const adminMoreSections: NavSection[] = [
  {
    title: 'Management',
    titleAr: 'الإدارة',
    items: [
      { title: 'Providers', titleAr: 'مقدمو الخدمات', href: '/admin/providers', icon: Users },
      { title: 'Vendors', titleAr: 'الشركات', href: '/admin/vendors', icon: Building2 },
      { title: 'Allocations', titleAr: 'التخصيصات', href: '/admin/allocations', icon: BarChart3 },
    ],
  },
  {
    title: 'Finance',
    titleAr: 'المالية',
    items: [
      { title: 'Donations', titleAr: 'التبرعات', href: '/admin/donations', icon: Heart },
      { title: 'Subscriptions', titleAr: 'الاشتراكات', href: '/super-admin/subscriptions', icon: DollarSign },
    ],
  },
  {
    title: 'System',
    titleAr: 'النظام',
    items: [
      { title: 'Audit Logs', titleAr: 'سجل التدقيق', href: '/super-admin/audit', icon: Clock },
      { title: 'Settings', titleAr: 'الإعدادات', href: '/super-admin/settings', icon: Settings },
    ],
  },
];

export function MobileBottomNav() {
  const { isRTL } = useLanguage();
  const { role, profile } = useAuth();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const getNavItems = (): { main: NavItem[]; moreSections: NavSection[] } => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return { main: adminNav, moreSections: adminMoreSections };
      case 'provider':
        return { main: providerNav, moreSections: providerMoreSections };
      case 'vendor':
        return { main: vendorNav, moreSections: vendorMoreSections };
      default:
        return { main: travelerNav, moreSections: travelerMoreSections };
    }
  };

  const { main: navItems, moreSections } = getNavItems();

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'U';
  };

  const getRoleColor = () => {
    switch (role) {
      case 'super_admin': return 'from-red-500 to-rose-600';
      case 'admin': return 'from-purple-500 to-violet-600';
      case 'provider': return 'from-amber-500 to-orange-600';
      case 'vendor': return 'from-blue-500 to-indigo-600';
      default: return 'from-emerald-500 to-teal-600';
    }
  };

  const getRoleLabel = () => {
    const labels: Record<string, { en: string; ar: string }> = {
      super_admin: { en: 'Super Admin', ar: 'المشرف الرئيسي' },
      admin: { en: 'Admin', ar: 'مشرف' },
      provider: { en: 'Provider', ar: 'مقدم خدمة' },
      vendor: { en: 'Vendor', ar: 'شركة' },
      traveler: { en: 'Traveler', ar: 'مسافر' },
    };
    const config = labels[role || 'traveler'];
    return isRTL ? config.ar : config.en;
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-around h-[68px] px-1 pb-safe">
          {navItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/dashboard' && item.href !== '/provider' && item.href !== '/vendor' && item.href !== '/admin' && location.pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 min-w-0 relative',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground active:scale-95'
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full" />
                )}
                <div className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-xl transition-all',
                  isActive ? 'bg-primary/10' : 'hover:bg-muted/50'
                )}>
                  <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                </div>
                <span className={cn(
                  'text-[10px] font-medium truncate max-w-[60px]',
                  isRTL ? 'font-arabic' : '',
                  isActive ? 'text-primary' : ''
                )}>
                  {isRTL ? item.titleAr : item.title}
                </span>
              </Link>
            );
          })}
          
          {/* More Button */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all min-w-0',
                  sheetOpen ? 'text-primary' : 'text-muted-foreground active:scale-95'
                )}
              >
                <div className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-xl transition-all',
                  sheetOpen ? 'bg-primary/10' : 'hover:bg-muted/50'
                )}>
                  <Menu className="h-5 w-5" />
                </div>
                <span className={cn('text-[10px] font-medium', isRTL ? 'font-arabic' : '')}>
                  {isRTL ? 'المزيد' : 'More'}
                </span>
              </button>
            </SheetTrigger>
            
            <SheetContent 
              side="bottom" 
              className="h-auto max-h-[85vh] rounded-t-3xl px-0 pb-safe"
            >
              {/* Handle */}
              <div className="flex justify-center pt-2 pb-4">
                <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
              </div>
              
              <SheetHeader className="px-6 pb-4">
                <SheetTitle className="sr-only">
                  {isRTL ? 'قائمة التنقل' : 'Navigation Menu'}
                </SheetTitle>
              </SheetHeader>
              
              {/* User Profile Card */}
              <div className="mx-6 mb-6 p-4 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <Avatar className={cn('h-12 w-12 border-2 border-white shadow-lg ring-2 ring-offset-2 ring-offset-background', `ring-${getRoleColor().split(' ')[0].replace('from-', '')}`)}>
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className={cn('bg-gradient-to-br text-white font-bold', getRoleColor())}>
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-foreground">
                      {profile?.full_name || 'User'}
                    </p>
                    <Badge 
                      className={cn(
                        'mt-1 text-[10px] px-2 py-0.5 font-medium border-0 bg-gradient-to-r text-white',
                        getRoleColor()
                      )}
                    >
                      {getRoleLabel()}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Navigation Sections */}
              <div className="px-6 space-y-6 pb-6 overflow-y-auto max-h-[50vh]">
                {moreSections.map((section, idx) => (
                  <div key={section.title}>
                    {idx > 0 && <Separator className="mb-4" />}
                    <h3 className={cn(
                      'text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1',
                      isRTL && 'font-arabic'
                    )}>
                      {isRTL ? section.titleAr : section.title}
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setSheetOpen(false)}
                            className={cn(
                              'flex flex-col items-center gap-2 p-4 rounded-2xl transition-all active:scale-95',
                              isActive 
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                                : 'bg-muted/50 hover:bg-muted text-foreground'
                            )}
                          >
                            <Icon className="h-6 w-6" />
                            <span className={cn(
                              'text-xs font-medium text-center leading-tight',
                              isRTL ? 'font-arabic' : ''
                            )}>
                              {isRTL ? item.titleAr : item.title}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
      
      {/* Spacer to prevent content from being hidden behind the nav */}
      <div className="lg:hidden h-[68px]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
    </>
  );
}
