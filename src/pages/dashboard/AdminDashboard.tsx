import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { 
  Users, Calendar, Heart, Shield, Settings, FileText, TrendingUp, Building2, 
  Crown, CreditCard, BarChart3, Clock, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useAuth } from '@/lib/auth';
import { StatCard, ActionCard, WidgetCard } from '@/components/ui/mobile-card';
import { CreateUserDialog } from '@/components/admin/CreateUserDialog';
import { cn } from '@/lib/utils';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { AdminDashboardSkeleton } from '@/components/dashboard/DashboardSkeletons';
import { useDashboardRefresh } from '@/hooks/useDashboardRefresh';

export default function AdminDashboard() {
  const { isRTL } = useLanguage();
  const { stats, isLoading: statsLoading } = useAdminStats();
  const { isSuperAdmin, profile } = useAuth();
  const { isLoading, refresh, finishLoading } = useDashboardRefresh();

  useEffect(() => {
    if (!statsLoading) {
      finishLoading();
    }
  }, [statsLoading, finishLoading]);

  if (isLoading && statsLoading) {
    return (
      <DashboardLayout>
        <AdminDashboardSkeleton />
      </DashboardLayout>
    );
  }

  const adminLinks = [
    {
      title: isRTL ? 'إدارة المستخدمين' : 'User Management',
      description: isRTL ? 'إنشاء وإدارة المستخدمين' : 'Create and manage users',
      href: '/admin/users',
      icon: <Users className="h-5 w-5" />,
      color: 'from-gray-500 to-slate-500',
    },
    {
      title: isRTL ? 'مقدمو الخدمات' : 'Providers',
      description: isRTL ? 'إدارة مقدمي الخدمات' : 'Manage providers',
      href: '/admin/providers',
      icon: <Users className="h-5 w-5" />,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: isRTL ? 'الوكلاء' : 'Vendors',
      description: isRTL ? 'إدارة وكالات السفر' : 'Manage agencies',
      href: '/admin/vendors',
      icon: <Building2 className="h-5 w-5" />,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: isRTL ? 'طابور التحقق' : 'KYC Queue',
      description: isRTL ? 'مراجعة الطلبات' : 'Review requests',
      href: '/admin/kyc',
      icon: <Shield className="h-5 w-5" />,
      badge: stats.pendingKyc,
      color: 'from-orange-500 to-amber-500',
    },
    {
      title: isRTL ? 'اعتماد المعتمرين' : 'Pilgrim Verification',
      description: isRTL ? 'مراجعة شهادات المعتمرين' : 'Review pilgrim certifications',
      href: '/admin/scholar-verification',
      icon: <Shield className="h-5 w-5" />,
      color: 'from-purple-500 to-violet-500',
    },
    {
      title: isRTL ? 'الاشتراكات' : 'Subscriptions',
      description: isRTL ? 'إدارة اشتراكات الوكلاء' : 'Manage subscriptions',
      href: '/admin/subscriptions',
      icon: <CreditCard className="h-5 w-5" />,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      title: isRTL ? 'التبرعات' : 'Donations',
      description: isRTL ? 'إدارة التبرعات' : 'Manage donations',
      href: '/admin/donations',
      icon: <Heart className="h-5 w-5" />,
      color: 'from-pink-500 to-rose-500',
    },
    {
      title: isRTL ? 'التخصيصات' : 'Allocations',
      description: isRTL ? 'تعيين الحجوزات' : 'Assign bookings',
      href: '/admin/allocations',
      icon: <Calendar className="h-5 w-5" />,
      badge: stats.pendingBookings,
      color: 'from-teal-500 to-cyan-500',
    },
  ];

  const superAdminLinks = [
    {
      title: isRTL ? 'التحليلات' : 'Analytics',
      href: '/super-admin/analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      description: isRTL ? 'إحصائيات شاملة' : 'Full stats',
    },
    {
      title: isRTL ? 'الاشتراكات' : 'Subscriptions',
      href: '/super-admin/subscriptions',
      icon: <CreditCard className="h-5 w-5" />,
      description: isRTL ? 'تحكم كامل' : 'Full control',
    },
    {
      title: isRTL ? 'إعدادات النظام' : 'Settings',
      href: '/super-admin/settings',
      icon: <Settings className="h-5 w-5" />,
      description: isRTL ? 'إعدادات المنصة' : 'Platform settings',
    },
    {
      title: isRTL ? 'سجل التدقيق' : 'Audit Logs',
      href: '/super-admin/audit',
      icon: <FileText className="h-5 w-5" />,
      description: isRTL ? 'تتبع الأحداث' : 'Track events',
    },
    {
      title: isRTL ? 'إدارة المشرفين' : 'Admins',
      href: '/super-admin/admins',
      icon: <Crown className="h-5 w-5" />,
      description: isRTL ? 'إدارة المشرفين' : 'Manage admins',
    },
  ];

  return (
    <DashboardLayout>
      <PullToRefresh onRefresh={refresh} className="h-full">
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header - Compact on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 md:p-3 rounded-xl text-white shadow-lg shrink-0",
              isSuperAdmin ? 'bg-gradient-to-br from-red-500 to-pink-500' : 'bg-gradient-to-br from-purple-500 to-indigo-500'
            )}>
              {isSuperAdmin ? <Crown className="h-5 w-5 md:h-6 md:w-6" /> : <Shield className="h-5 w-5 md:h-6 md:w-6" />}
            </div>
            <div className="min-w-0">
              <h1 className={cn('text-lg md:text-2xl font-bold truncate', isRTL && 'font-arabic')}>
                {isRTL ? 'مرحباً' : 'Welcome'}, {profile?.full_name?.split(' ')[0] || (isSuperAdmin ? 'Super Admin' : 'Admin')}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs md:text-sm text-muted-foreground">
                  {isSuperAdmin 
                    ? (isRTL ? 'صلاحيات كاملة' : 'Full Access')
                    : (isRTL ? 'لوحة تحكم المشرف' : 'Admin Dashboard')
                  }
                </p>
                <Badge variant="outline" className="text-[10px] h-5">
                  <Sparkles className="h-2.5 w-2.5 mr-1" />
                  {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </Badge>
              </div>
            </div>
          </div>
          <CreateUserDialog />
        </div>

        {/* Quick Stats Bar - 2x2 grid on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <StatCard
            title={isRTL ? 'إجمالي المستخدمين' : 'Total Users'}
            value={stats.totalTravelers + stats.totalProviders + stats.totalVendors}
            icon={<Users />}
            color="blue"
          />
          <StatCard
            title={isRTL ? 'الحجوزات المكتملة' : 'Completed'}
            value={stats.completedBookings}
            icon={<Calendar />}
            color="green"
          />
          <StatCard
            title={isRTL ? 'بانتظار التحقق' : 'Pending KYC'}
            value={stats.pendingKyc}
            icon={<Shield />}
            color="orange"
          />
          <StatCard
            title={isRTL ? 'التبرعات' : 'Donations'}
            value={`${stats.donationAmount.toLocaleString()}`}
            icon={<Heart />}
            color="pink"
          />
        </div>

        {/* Widgets Grid - 2 column on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
          <WidgetCard title={isRTL ? 'المستخدمون' : 'Users'} icon={<Users />} color="blue">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span>{isRTL ? 'المسافرون' : 'Travelers'}</span>
                <span className="font-bold">{stats.totalTravelers}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>{isRTL ? 'مقدمو الخدمات' : 'Providers'}</span>
                <span className="font-bold">{stats.totalProviders}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>{isRTL ? 'الوكلاء' : 'Vendors'}</span>
                <span className="font-bold">{stats.totalVendors}</span>
              </div>
            </div>
          </WidgetCard>
          
          <WidgetCard title={isRTL ? 'طابور التحقق' : 'KYC Queue'} icon={<Shield />} color="yellow">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span>{isRTL ? 'قيد الانتظار' : 'Pending'}</span>
                <Badge variant="outline" className="h-5 text-[10px]">{stats.pendingKyc}</Badge>
              </div>
              <div className="flex justify-between text-xs pt-1.5 border-t">
                <span className="text-green-600">{isRTL ? 'موافق' : 'Approved'}</span>
                <span className="font-bold text-green-600">0</span>
              </div>
            </div>
          </WidgetCard>

          <WidgetCard title={isRTL ? 'الحجوزات' : 'Bookings'} icon={<Calendar />} color="primary">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold">{stats.totalBookings}</p>
              <p className="text-[10px] text-muted-foreground">{isRTL ? 'إجمالي الحجوزات' : 'Total Bookings'}</p>
              <div className="grid grid-cols-3 gap-1 mt-2 text-[10px]">
                <div>
                  <p className="font-bold text-yellow-500">{stats.pendingBookings}</p>
                  <p className="text-muted-foreground">{isRTL ? 'معلق' : 'Pending'}</p>
                </div>
                <div>
                  <p className="font-bold text-blue-500">0</p>
                  <p className="text-muted-foreground">{isRTL ? 'جارٍ' : 'Active'}</p>
                </div>
                <div>
                  <p className="font-bold text-green-500">{stats.completedBookings}</p>
                  <p className="text-muted-foreground">{isRTL ? 'مكتمل' : 'Done'}</p>
                </div>
              </div>
            </div>
          </WidgetCard>

          <WidgetCard title={isRTL ? 'الإيرادات' : 'Revenue'} icon={<TrendingUp />} color="green">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{isRTL ? 'إجمالي التبرعات' : 'Total Donations'}</p>
              <p className="text-lg md:text-xl font-bold text-green-500">
                {stats.donationAmount.toLocaleString()} <span className="text-[10px]">{isRTL ? 'ر.س' : 'SAR'}</span>
              </p>
            </div>
          </WidgetCard>

          <WidgetCard title={isRTL ? 'الصدقات' : 'Charity'} icon={<Heart />} color="red">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-lg font-bold">0</p>
                <p className="text-[10px] text-muted-foreground">{isRTL ? 'الطلبات' : 'Requests'}</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-500">0</p>
                <p className="text-[10px] text-muted-foreground">{isRTL ? 'مُنجز' : 'Fulfilled'}</p>
              </div>
            </div>
          </WidgetCard>

          <WidgetCard title={isRTL ? 'صحة النظام' : 'System'} icon={<BarChart3 />} color="purple">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span>{isRTL ? 'وقت التشغيل' : 'Uptime'}</span>
                <Badge className="bg-green-500 h-5 text-[10px]">99.9%</Badge>
              </div>
              <div className="flex justify-between text-xs">
                <span>{isRTL ? 'معدل الخطأ' : 'Error Rate'}</span>
                <span className="font-bold text-green-500">0%</span>
              </div>
            </div>
          </WidgetCard>
        </div>

        {/* Quick Links - Mobile optimized grid */}
        <div>
          <h2 className={cn('text-base md:text-lg font-semibold mb-3 flex items-center gap-2', isRTL && 'font-arabic')}>
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            {isRTL ? 'الإدارة والعمليات' : 'Management'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
            {adminLinks.map((link, index) => (
              <Link key={index} to={link.href}>
                <ActionCard
                  title={link.title}
                  description={link.description}
                  icon={link.icon}
                  badge={link.badge}
                  gradientFrom={link.color.split(' ')[0].replace('from-', '')}
                  gradientTo={link.color.split(' ')[1].replace('to-', '')}
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Super Admin Section */}
        {isSuperAdmin && (
          <div>
            <h2 className={cn('text-base md:text-lg font-semibold mb-3 flex items-center gap-2 text-red-600', isRTL && 'font-arabic')}>
              <Crown className="h-4 w-4 md:h-5 md:w-5" />
              {isRTL ? 'تحكم المشرف الرئيسي' : 'Super Admin'}
              <Badge variant="destructive" className="text-[10px] h-5">
                {isRTL ? 'صلاحيات عليا' : 'Elevated'}
              </Badge>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
              {superAdminLinks.map((link, index) => (
                <Link key={index} to={link.href}>
                  <Card className="h-full hover:shadow-lg transition-all cursor-pointer border-2 border-red-200 dark:border-red-800 hover:border-red-500 group bg-gradient-to-br from-red-50/50 to-pink-50/50 dark:from-red-950/30 dark:to-pink-950/30 active:scale-[0.98]">
                    <CardContent className="p-3 md:pt-6 md:p-4">
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg group-hover:scale-105 transition-transform">
                          {link.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-xs md:text-sm text-red-700 dark:text-red-300">{link.title}</h3>
                          <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">{link.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity - Compact */}
        <Card className="border-2">
          <CardHeader className="p-3 md:p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-sm md:text-base">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
              {isRTL ? 'النشاط الأخير' : 'Recent Activity'}
            </CardTitle>
            <CardDescription className="text-xs">
              {isRTL ? 'آخر الأحداث' : 'Latest events'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col items-center justify-center py-6 md:py-8 text-center text-muted-foreground">
              <div className="p-3 md:p-4 rounded-full bg-muted mb-3">
                <Calendar className="h-6 w-6 md:h-8 md:w-8 opacity-50" />
              </div>
              <p className="font-medium text-sm">{isRTL ? 'لا يوجد نشاط حديث' : 'No recent activity'}</p>
              <p className="text-xs mt-1">{isRTL ? 'ستظهر الأحداث الجديدة هنا' : 'New events will appear here'}</p>
            </div>
          </CardContent>
        </Card>
        </div>
      </PullToRefresh>
    </DashboardLayout>
  );
}
