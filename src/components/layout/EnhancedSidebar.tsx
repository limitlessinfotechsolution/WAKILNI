import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Calendar, Users, FileText, Star, Settings, ChevronLeft, ChevronRight,
  CreditCard, Building2, Shield, UserCheck, BarChart3, DollarSign,
  Clock, Heart, CalendarClock, LogOut, ChevronDown, Image, Zap,
  LayoutGrid, Briefcase, Activity
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
import { Separator } from '@/components/ui/separator';
import wakilniLogo from '@/assets/wakilni-logo.jpg';

interface NavItem {
  title: string;
  titleAr: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface NavGroup {
  title: string;
  titleAr: string;
  items: NavItem[];
  collapsible?: boolean;
}

const travelerNavGroups: NavGroup[] = [
  {
    title: 'Main',
    titleAr: 'الرئيسية',
    collapsible: false,
    items: [
      { title: 'Dashboard', titleAr: 'لوحة التحكم', href: '/dashboard', icon: Home },
      { title: 'Bookings', titleAr: 'الحجوزات', href: '/bookings', icon: Calendar },
      { title: 'Services', titleAr: 'الخدمات', href: '/services', icon: FileText },
    ],
  },
  {
    title: 'Management',
    titleAr: 'الإدارة',
    collapsible: true,
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
    collapsible: false,
    items: [
      { title: 'Dashboard', titleAr: 'لوحة التحكم', href: '/provider', icon: Home },
      { title: 'Calendar', titleAr: 'التقويم', href: '/provider/calendar', icon: Calendar },
      { title: 'Availability', titleAr: 'التوفر', href: '/provider/availability', icon: CalendarClock },
    ],
  },
  {
    title: 'Services',
    titleAr: 'الخدمات',
    collapsible: true,
    items: [
      { title: 'My Services', titleAr: 'خدماتي', href: '/provider/services', icon: FileText },
      { title: 'Reviews', titleAr: 'التقييمات', href: '/provider/reviews', icon: Star },
      { title: 'Proof Gallery', titleAr: 'معرض الإثباتات', href: '/provider/gallery', icon: Image },
    ],
  },
  {
    title: 'Account',
    titleAr: 'الحساب',
    collapsible: true,
    items: [
      { title: 'Verification', titleAr: 'التحقق', href: '/provider/kyc', icon: Shield },
    ],
  },
];

const vendorNavGroups: NavGroup[] = [
  {
    title: 'Main',
    titleAr: 'الرئيسية',
    collapsible: false,
    items: [
      { title: 'Dashboard', titleAr: 'لوحة التحكم', href: '/vendor', icon: Home },
      { title: 'Bookings', titleAr: 'الحجوزات', href: '/vendor/bookings', icon: Calendar },
      { title: 'Services', titleAr: 'الخدمات', href: '/vendor/services', icon: FileText },
    ],
  },
  {
    title: 'Business',
    titleAr: 'الأعمال',
    collapsible: true,
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
    collapsible: false,
    items: [
      { title: 'Dashboard', titleAr: 'لوحة التحكم', href: '/admin', icon: LayoutGrid },
    ],
  },
  {
    title: 'User Management',
    titleAr: 'إدارة المستخدمين',
    collapsible: true,
    items: [
      { title: 'All Users', titleAr: 'جميع المستخدمين', href: '/admin/users', icon: Users },
      { title: 'Providers', titleAr: 'مقدمو الخدمات', href: '/admin/providers', icon: UserCheck },
      { title: 'Vendors', titleAr: 'الشركات', href: '/admin/vendors', icon: Building2 },
    ],
  },
  {
    title: 'Operations',
    titleAr: 'العمليات',
    collapsible: true,
    items: [
      { title: 'KYC Queue', titleAr: 'طابور التحقق', href: '/admin/kyc', icon: Shield, badge: '3', badgeVariant: 'destructive' },
      { title: 'Subscriptions', titleAr: 'الاشتراكات', href: '/admin/subscriptions', icon: CreditCard },
      { title: 'Allocations', titleAr: 'التخصيصات', href: '/admin/allocations', icon: BarChart3 },
    ],
  },
  {
    title: 'Finance',
    titleAr: 'المالية',
    collapsible: true,
    items: [
      { title: 'Donations', titleAr: 'التبرعات', href: '/admin/donations', icon: Heart },
    ],
  },
];

const superAdminNavGroups: NavGroup[] = [
  {
    title: 'Super Admin',
    titleAr: 'المشرف الرئيسي',
    collapsible: false,
    items: [
      { title: 'Analytics', titleAr: 'التحليلات', href: '/super-admin/analytics', icon: Activity },
      { title: 'Revenue', titleAr: 'الإيرادات', href: '/super-admin/subscriptions', icon: DollarSign },
      { title: 'System Settings', titleAr: 'إعدادات النظام', href: '/super-admin/settings', icon: Settings },
      { title: 'Audit Logs', titleAr: 'سجل التدقيق', href: '/super-admin/audit', icon: Clock },
      { title: 'Admin Management', titleAr: 'إدارة المشرفين', href: '/super-admin/admins', icon: Shield },
    ],
  },
];

const roleConfig = {
  traveler: {
    label: 'Traveler',
    labelAr: 'مسافر',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    icon: Briefcase,
  },
  provider: {
    label: 'Provider',
    labelAr: 'مقدم خدمة',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-600 dark:text-amber-400',
    icon: Star,
  },
  vendor: {
    label: 'Vendor',
    labelAr: 'شركة',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-600 dark:text-blue-400',
    icon: Building2,
  },
  admin: {
    label: 'Admin',
    labelAr: 'مشرف',
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-600 dark:text-purple-400',
    icon: Shield,
  },
  super_admin: {
    label: 'Super Admin',
    labelAr: 'المشرف الرئيسي',
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-600 dark:text-red-400',
    icon: Zap,
  },
};

export function EnhancedSidebar() {
  const { isRTL } = useLanguage();
  const { role, profile, signOut } = useAuth();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Main', 'الرئيسية', 'Overview', 'نظرة عامة', 'Super Admin', 'المشرف الرئيسي']);

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
  const currentRole = roleConfig[role as keyof typeof roleConfig] || roleConfig.traveler;

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
        return 'theme-super-admin';
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
      {/* Header with Logo */}
      <div className={cn(
        'flex items-center h-16 border-b px-3 gap-3',
        isExpanded ? 'justify-between' : 'justify-center'
      )}>
        {isExpanded ? (
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                <img src={wakilniLogo} alt="Wakilni" className="h-full w-full object-cover" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className={cn('text-base font-bold leading-tight', isRTL && 'font-arabic')}>
                {isRTL ? 'وكّلني' : 'Wakilni'}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {isRTL ? 'منصة الحج والعمرة' : 'Hajj & Umrah'}
              </span>
            </div>
          </Link>
        ) : (
          <Link to="/">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img src={wakilniLogo} alt="Wakilni" className="h-full w-full object-cover" />
            </div>
          </Link>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 shrink-0 rounded-lg hover:bg-sidebar-accent"
        >
          <ExpandIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Role Badge */}
      {isExpanded && (
        <div className="px-3 py-3 border-b">
          <div className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-xl',
            currentRole.bgColor
          )}>
            <div className={cn('p-1.5 rounded-lg bg-gradient-to-br', currentRole.color)}>
              <currentRole.icon className="h-3.5 w-3.5 text-white" />
            </div>
            <span className={cn('text-sm font-semibold', currentRole.textColor)}>
              {isRTL ? currentRole.labelAr : currentRole.label}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="px-2 space-y-4">
          {navGroups.map((group, groupIndex) => {
            const groupTitle = isRTL ? group.titleAr : group.title;
            const isGroupExpanded = expandedGroups.includes(group.title) || expandedGroups.includes(group.titleAr);
            const isSuperAdminGroup = group.title === 'Super Admin';

            return (
              <div key={group.title}>
                {groupIndex > 0 && isExpanded && (
                  <Separator className="mb-3 opacity-50" />
                )}
                
                <Collapsible
                  open={isExpanded ? (group.collapsible !== false ? isGroupExpanded : true) : true}
                  onOpenChange={() => isExpanded && group.collapsible !== false && toggleGroup(group.title)}
                >
                  {isExpanded && (
                    <CollapsibleTrigger asChild disabled={group.collapsible === false}>
                      <button
                        className={cn(
                          'flex items-center justify-between w-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md transition-colors mb-1',
                          isSuperAdminGroup 
                            ? 'text-destructive' 
                            : 'text-muted-foreground/70',
                          group.collapsible !== false && 'hover:text-foreground cursor-pointer'
                        )}
                      >
                        <span>{groupTitle}</span>
                        {group.collapsible !== false && (
                          <ChevronDown className={cn(
                            'h-3 w-3 transition-transform opacity-50',
                            isGroupExpanded && 'rotate-180'
                          )} />
                        )}
                      </button>
                    </CollapsibleTrigger>
                  )}

                  <CollapsibleContent className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.href;
                      const Icon = item.icon;

                      const linkContent = (
                        <Link
                          to={item.href}
                          className={cn(
                            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                            isActive
                              ? isSuperAdminGroup
                                ? 'bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground shadow-md shadow-destructive/25'
                                : 'bg-gradient-to-r from-sidebar-primary to-sidebar-primary/90 text-sidebar-primary-foreground shadow-md shadow-sidebar-primary/25'
                              : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                            !isExpanded && 'justify-center px-2'
                          )}
                        >
                          <div className={cn(
                            'flex items-center justify-center h-8 w-8 rounded-lg transition-colors shrink-0',
                            isActive 
                              ? 'bg-white/20' 
                              : 'bg-sidebar-accent/50'
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          {isExpanded && (
                            <>
                              <span className={cn('flex-1', isRTL && 'font-arabic')}>
                                {isRTL ? item.titleAr : item.title}
                              </span>
                              {item.badge && (
                                <Badge 
                                  variant={item.badgeVariant || 'secondary'} 
                                  className="text-[10px] h-5 px-1.5 font-bold"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </>
                          )}
                        </Link>
                      );

                      if (!isExpanded) {
                        return (
                          <Tooltip key={item.href} delayDuration={0}>
                            <TooltipTrigger asChild>
                              {linkContent}
                            </TooltipTrigger>
                            <TooltipContent 
                              side={isRTL ? 'left' : 'right'} 
                              className="font-medium flex items-center gap-2"
                            >
                              {isRTL ? item.titleAr : item.title}
                              {item.badge && (
                                <Badge variant={item.badgeVariant || 'secondary'} className="text-[10px] h-4 px-1">
                                  {item.badge}
                                </Badge>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        );
                      }

                      return <div key={item.href}>{linkContent}</div>;
                    })}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Settings Link */}
      <div className="px-2 py-2 border-t">
        {isExpanded ? (
          <Link
            to="/settings/profile"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors',
              location.pathname === '/settings/profile'
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50'
            )}
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-muted/50">
              <Settings className="h-4 w-4" />
            </div>
            <span>{isRTL ? 'الإعدادات' : 'Settings'}</span>
          </Link>
        ) : (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link
                to="/settings/profile"
                className={cn(
                  'flex items-center justify-center px-2 py-2.5 rounded-xl transition-colors',
                  location.pathname === '/settings/profile'
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-muted/50">
                  <Settings className="h-4 w-4" />
                </div>
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
          <div className="flex items-center gap-3 p-2 rounded-xl bg-sidebar-accent/30">
            <Avatar className="h-10 w-10 border-2 border-sidebar-primary/30 shadow-sm">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground text-sm font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {profile?.full_name || 'User'}
              </p>
              {profile?.display_id && (
                <p className="text-[10px] font-mono font-bold text-primary/80 tracking-wide">
                  {profile.display_id}
                </p>
              )}
              <p className="text-xs text-muted-foreground truncate">
                {isRTL ? currentRole.labelAr : currentRole.label}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-10 w-10 cursor-pointer border-2 border-sidebar-primary/30 shadow-sm">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 text-sidebar-primary-foreground text-sm font-bold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
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
