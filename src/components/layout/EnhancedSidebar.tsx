import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Calendar, Users, FileText, Star, Settings, ChevronLeft, ChevronRight,
  CreditCard, Building2, Shield, UserCheck, BarChart3, DollarSign,
  Clock, Heart, CalendarClock, LogOut, ChevronDown, Image
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  title: string;
  titleAr: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  title: string;
  titleAr: string;
  items: NavItem[];
}

const travelerNavGroups: NavGroup[] = [
  {
    title: 'Main',
    titleAr: 'الرئيسية',
    items: [
      { title: 'Dashboard', titleAr: 'لوحة التحكم', href: '/dashboard', icon: Home },
      { title: 'Bookings', titleAr: 'الحجوزات', href: '/bookings', icon: Calendar },
      { title: 'Services', titleAr: 'الخدمات', href: '/services', icon: FileText },
    ],
  },
  {
    title: 'Management',
    titleAr: 'الإدارة',
    items: [
      { title: 'Beneficiaries', titleAr: 'المستفيدون', href: '/beneficiaries', icon: Users },
      { title: 'Donate', titleAr: 'تبرع', href: '/donate', icon: Heart },
    ],
  },
];

const providerNavGroups: NavGroup[] = [
  {
    title: 'Main',
    titleAr: 'الرئيسية',
    items: [
      { title: 'Dashboard', titleAr: 'لوحة التحكم', href: '/provider', icon: Home },
      { title: 'Calendar', titleAr: 'التقويم', href: '/provider/calendar', icon: Calendar },
      { title: 'Availability', titleAr: 'التوفر', href: '/provider/availability', icon: CalendarClock },
    ],
  },
  {
    title: 'Services',
    titleAr: 'الخدمات',
    items: [
      { title: 'My Services', titleAr: 'خدماتي', href: '/provider/services', icon: FileText },
      { title: 'Reviews', titleAr: 'التقييمات', href: '/provider/reviews', icon: Star },
      { title: 'Proof Gallery', titleAr: 'معرض الإثباتات', href: '/provider/gallery', icon: Image },
    ],
  },
  {
    title: 'Account',
    titleAr: 'الحساب',
    items: [
      { title: 'Verification', titleAr: 'التحقق', href: '/provider/kyc', icon: Shield },
    ],
  },
];

const vendorNavGroups: NavGroup[] = [
  {
    title: 'Main',
    titleAr: 'الرئيسية',
    items: [
      { title: 'Dashboard', titleAr: 'لوحة التحكم', href: '/vendor', icon: Home },
      { title: 'Bookings', titleAr: 'الحجوزات', href: '/vendor/bookings', icon: Calendar },
      { title: 'Services', titleAr: 'الخدمات', href: '/vendor/services', icon: FileText },
    ],
  },
  {
    title: 'Business',
    titleAr: 'الأعمال',
    items: [
      { title: 'Subscription', titleAr: 'الاشتراك', href: '/vendor/subscription', icon: CreditCard },
      { title: 'Verification', titleAr: 'التحقق', href: '/vendor/kyc', icon: Shield },
    ],
  },
];

const adminNavGroups: NavGroup[] = [
  {
    title: 'Overview',
    titleAr: 'نظرة عامة',
    items: [
      { title: 'Dashboard', titleAr: 'لوحة التحكم', href: '/admin', icon: Home },
    ],
  },
  {
    title: 'Users',
    titleAr: 'المستخدمون',
    items: [
      { title: 'All Users', titleAr: 'جميع المستخدمين', href: '/admin/users', icon: Users },
      { title: 'Providers', titleAr: 'مقدمو الخدمات', href: '/admin/providers', icon: UserCheck },
      { title: 'Vendors', titleAr: 'الشركات', href: '/admin/vendors', icon: Building2 },
    ],
  },
  {
    title: 'Operations',
    titleAr: 'العمليات',
    items: [
      { title: 'KYC Queue', titleAr: 'طابور التحقق', href: '/admin/kyc', icon: Shield },
      { title: 'Subscriptions', titleAr: 'الاشتراكات', href: '/admin/subscriptions', icon: CreditCard },
      { title: 'Allocations', titleAr: 'التخصيصات', href: '/admin/allocations', icon: BarChart3 },
    ],
  },
  {
    title: 'Finance',
    titleAr: 'المالية',
    items: [
      { title: 'Donations', titleAr: 'التبرعات', href: '/admin/donations', icon: Heart },
    ],
  },
];

const superAdminNavGroups: NavGroup[] = [
  {
    title: 'Super Admin',
    titleAr: 'المشرف الرئيسي',
    items: [
      { title: 'Analytics', titleAr: 'التحليلات', href: '/super-admin/analytics', icon: BarChart3 },
      { title: 'Subscriptions', titleAr: 'الاشتراكات', href: '/super-admin/subscriptions', icon: DollarSign },
      { title: 'System Settings', titleAr: 'إعدادات النظام', href: '/super-admin/settings', icon: Settings },
      { title: 'Audit Logs', titleAr: 'سجل التدقيق', href: '/super-admin/audit', icon: Clock },
      { title: 'Admin Management', titleAr: 'إدارة المشرفين', href: '/super-admin/admins', icon: Shield },
    ],
  },
];

export function EnhancedSidebar() {
  const { isRTL } = useLanguage();
  const { role, profile, signOut } = useAuth();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Main', 'الرئيسية', 'Overview', 'نظرة عامة']);

  const getNavGroups = (): NavGroup[] => {
    switch (role) {
      case 'super_admin':
        return [...adminNavGroups, ...superAdminNavGroups];
      case 'admin':
        return adminNavGroups;
      case 'provider':
        return providerNavGroups;
      case 'vendor':
        return vendorNavGroups;
      default:
        return travelerNavGroups;
    }
  };

  const navGroups = getNavGroups();

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

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

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'U';
  };

  const ExpandIcon = isRTL 
    ? (isExpanded ? ChevronRight : ChevronLeft) 
    : (isExpanded ? ChevronLeft : ChevronRight);

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 flex flex-col border-e bg-sidebar transition-all duration-300',
        isExpanded ? 'w-64' : 'w-[68px]',
        getRoleThemeClass()
      )}
    >
      {/* Header with Toggle */}
      <div className={cn(
        'flex items-center h-14 border-b px-3',
        isExpanded ? 'justify-between' : 'justify-center'
      )}>
        {isExpanded ? (
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {isRTL ? 'القائمة' : 'Navigation'}
          </span>
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 shrink-0"
        >
          <ExpandIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav className="px-2 space-y-1">
          {navGroups.map((group) => {
            const groupTitle = isRTL ? group.titleAr : group.title;
            const isGroupExpanded = expandedGroups.includes(group.title) || expandedGroups.includes(group.titleAr);
            const isSuperAdminGroup = group.title === 'Super Admin';

            return (
              <Collapsible
                key={group.title}
                open={isExpanded ? isGroupExpanded : true}
                onOpenChange={() => isExpanded && toggleGroup(group.title)}
              >
                {isExpanded && (
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        'flex items-center justify-between w-full px-2 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors',
                        isSuperAdminGroup 
                          ? 'text-destructive hover:bg-destructive/10' 
                          : 'text-muted-foreground hover:bg-muted/50'
                      )}
                    >
                      <span>{groupTitle}</span>
                      <ChevronDown className={cn(
                        'h-3 w-3 transition-transform',
                        isGroupExpanded && 'rotate-180'
                      )} />
                    </button>
                  </CollapsibleTrigger>
                )}

                <CollapsibleContent className="space-y-0.5 mt-1">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;

                    const linkContent = (
                      <Link
                        to={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                          isActive
                            ? isSuperAdminGroup
                              ? 'bg-destructive text-destructive-foreground shadow-sm'
                              : 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                          !isExpanded && 'justify-center px-2'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {isExpanded && (
                          <span className={cn('flex-1', isRTL && 'font-arabic')}>
                            {isRTL ? item.titleAr : item.title}
                          </span>
                        )}
                        {isExpanded && item.badge && (
                          <Badge variant="secondary" className="text-[10px] h-5">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );

                    if (!isExpanded) {
                      return (
                        <Tooltip key={item.href} delayDuration={0}>
                          <TooltipTrigger asChild>
                            {linkContent}
                          </TooltipTrigger>
                          <TooltipContent side={isRTL ? 'left' : 'right'} className="font-medium">
                            {isRTL ? item.titleAr : item.title}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return <div key={item.href}>{linkContent}</div>;
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Settings Link */}
      <div className="px-2 py-2 border-t">
        {isExpanded ? (
          <Link
            to="/settings/profile"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>{isRTL ? 'الإعدادات' : 'Settings'}</span>
          </Link>
        ) : (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link
                to="/settings/profile"
                className="flex items-center justify-center px-2 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side={isRTL ? 'left' : 'right'}>
              {isRTL ? 'الإعدادات' : 'Settings'}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* User Profile */}
      <div className="border-t p-3">
        {isExpanded ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border-2 border-sidebar-primary/20">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {isRTL ? (role === 'provider' ? 'مقدم خدمة' : role) : role}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Avatar className="h-9 w-9 mx-auto cursor-pointer border-2 border-sidebar-primary/20">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side={isRTL ? 'left' : 'right'}>
              {profile?.full_name || 'User'}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}
