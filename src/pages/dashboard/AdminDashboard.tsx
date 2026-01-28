import { Link } from 'react-router-dom';
import { 
  Users, Calendar, Heart, Shield, Settings, FileText, TrendingUp, Building2, 
  Crown, CreditCard, UserPlus, BarChart3, Clock, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useAuth } from '@/lib/auth';
import { 
  UserStatsWidget, 
  KycQueueWidget, 
  BookingsAnalyticsWidget, 
  RevenueStatsWidget,
  PlatformHealthWidget,
  CharityStatsWidget
} from '@/components/dashboard/AdminWidgets';
import { CreateUserDialog } from '@/components/admin/CreateUserDialog';

export default function AdminDashboard() {
  const { t, isRTL } = useLanguage();
  const { stats, isLoading } = useAdminStats();
  const { isSuperAdmin, profile } = useAuth();

  const adminLinks = [
    {
      title: isRTL ? 'إدارة المستخدمين' : 'User Management',
      description: isRTL ? 'إنشاء وإدارة وتعيين أدوار المستخدمين' : 'Create, manage and assign user roles',
      href: '/admin/users',
      icon: <Users className="h-5 w-5" />,
      color: 'from-gray-500 to-slate-500',
    },
    {
      title: isRTL ? 'مقدمو الخدمات' : 'Providers',
      description: isRTL ? 'إدارة مقدمي الخدمات والتحقق' : 'Manage providers and verification',
      href: '/admin/providers',
      icon: <Users className="h-5 w-5" />,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: isRTL ? 'الوكلاء' : 'Vendors',
      description: isRTL ? 'إدارة وكالات السفر' : 'Manage travel agencies',
      href: '/admin/vendors',
      icon: <Building2 className="h-5 w-5" />,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: isRTL ? 'طابور التحقق' : 'KYC Queue',
      description: isRTL ? 'مراجعة طلبات التحقق' : 'Review verification requests',
      href: '/admin/kyc',
      icon: <Shield className="h-5 w-5" />,
      badge: stats.pendingKyc,
      color: 'from-orange-500 to-amber-500',
    },
    {
      title: isRTL ? 'الاشتراكات' : 'Subscriptions',
      description: isRTL ? 'إدارة اشتراكات الوكلاء' : 'Manage vendor subscriptions',
      href: '/admin/subscriptions',
      icon: <CreditCard className="h-5 w-5" />,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      title: isRTL ? 'التبرعات' : 'Donations',
      description: isRTL ? 'إدارة التبرعات والتوزيع' : 'Manage donations & distribution',
      href: '/admin/donations',
      icon: <Heart className="h-5 w-5" />,
      color: 'from-pink-500 to-rose-500',
    },
    {
      title: isRTL ? 'التخصيصات' : 'Allocations',
      description: isRTL ? 'تعيين الحجوزات' : 'Assign bookings to providers',
      href: '/admin/allocations',
      icon: <Calendar className="h-5 w-5" />,
      badge: stats.pendingBookings,
      color: 'from-teal-500 to-cyan-500',
    },
  ];

  const superAdminLinks = [
    {
      title: isRTL ? 'التحليلات المتقدمة' : 'Advanced Analytics',
      href: '/super-admin/analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      description: isRTL ? 'إحصائيات وتقارير شاملة' : 'Comprehensive stats and reports',
    },
    {
      title: isRTL ? 'إدارة الاشتراكات' : 'Subscription Control',
      href: '/super-admin/subscriptions',
      icon: <CreditCard className="h-5 w-5" />,
      description: isRTL ? 'تحكم كامل في الاشتراكات' : 'Full subscription management',
    },
    {
      title: isRTL ? 'إعدادات النظام' : 'System Settings',
      href: '/super-admin/settings',
      icon: <Settings className="h-5 w-5" />,
      description: isRTL ? 'إعدادات المنصة العامة' : 'Platform-wide settings',
    },
    {
      title: isRTL ? 'سجل التدقيق' : 'Audit Logs',
      href: '/super-admin/audit',
      icon: <FileText className="h-5 w-5" />,
      description: isRTL ? 'تتبع جميع الأحداث' : 'Track all system events',
    },
    {
      title: isRTL ? 'إدارة المشرفين' : 'Admin Management',
      href: '/super-admin/admins',
      icon: <Crown className="h-5 w-5" />,
      description: isRTL ? 'إنشاء وإدارة المشرفين' : 'Create and manage admins',
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isSuperAdmin ? 'bg-gradient-to-br from-red-500 to-pink-500' : 'bg-gradient-to-br from-purple-500 to-indigo-500'} text-white shadow-lg`}>
              {isSuperAdmin ? <Crown className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isRTL ? 'font-arabic' : ''}`}>
                {isRTL ? 'مرحباً' : 'Welcome'}, {profile?.full_name || (isSuperAdmin ? (isRTL ? 'المشرف الرئيسي' : 'Super Admin') : (isRTL ? 'المشرف' : 'Admin'))}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                {isSuperAdmin 
                  ? (isRTL ? 'لوحة التحكم الرئيسية - صلاحيات كاملة' : 'Super Admin Dashboard - Full Access')
                  : (isRTL ? 'لوحة تحكم المشرف' : 'Admin Dashboard')
                }
                <Badge variant="outline" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </Badge>
              </p>
            </div>
          </div>
          <CreateUserDialog />
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 dark:text-blue-300 uppercase tracking-wider font-medium">
                    {isRTL ? 'إجمالي المستخدمين' : 'Total Users'}
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {stats.totalTravelers + stats.totalProviders + stats.totalVendors}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 dark:text-green-300 uppercase tracking-wider font-medium">
                    {isRTL ? 'الحجوزات المكتملة' : 'Completed'}
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.completedBookings}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-600 dark:text-orange-300 uppercase tracking-wider font-medium">
                    {isRTL ? 'بانتظار التحقق' : 'Pending KYC'}
                  </p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.pendingKyc}</p>
                </div>
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 border-pink-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-pink-600 dark:text-pink-300 uppercase tracking-wider font-medium">
                    {isRTL ? 'التبرعات' : 'Donations'}
                  </p>
                  <p className="text-2xl font-bold text-pink-900 dark:text-pink-100">
                    {stats.donationAmount.toLocaleString()} <span className="text-sm">{isRTL ? 'ر.س' : 'SAR'}</span>
                  </p>
                </div>
                <Heart className="h-8 w-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UserStatsWidget 
            travelers={stats.totalTravelers} 
            providers={stats.totalProviders} 
            vendors={stats.totalVendors}
            newThisWeek={0}
          />
          <KycQueueWidget 
            pending={stats.pendingKyc} 
            underReview={0} 
            approvedToday={0}
            rejectedToday={0}
          />
          <BookingsAnalyticsWidget 
            total={stats.totalBookings} 
            pending={stats.pendingBookings} 
            inProgress={0}
            completed={stats.completedBookings}
            completionRate={stats.totalBookings > 0 ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0}
          />
          <RevenueStatsWidget 
            totalDonations={stats.donationAmount} 
            platformFees={0}
            thisMonth={0}
            growth={0}
          />
          <CharityStatsWidget 
            totalRequests={0} 
            fulfilled={0}
            pendingApproval={0}
            totalDistributed={stats.donationAmount}
          />
          <PlatformHealthWidget 
            uptime={99.9} 
            activeUsers={stats.totalTravelers + stats.totalProviders + stats.totalVendors}
            errorRate={0}
            avgResponseTime={0}
          />
        </div>

        {/* Quick Links */}
        <div>
          <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isRTL ? 'font-arabic' : ''}`}>
            <TrendingUp className="h-5 w-5 text-primary" />
            {isRTL ? 'الإدارة والعمليات' : 'Management & Operations'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {adminLinks.map((link, index) => (
              <Link key={index} to={link.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-primary/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${link.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                          {link.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold group-hover:text-primary transition-colors">{link.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{link.description}</p>
                        </div>
                      </div>
                      {link.badge !== undefined && link.badge > 0 && (
                        <Badge className="bg-destructive text-destructive-foreground animate-pulse">
                          {link.badge}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Super Admin Section */}
        {isSuperAdmin && (
          <div>
            <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 text-red-600 ${isRTL ? 'font-arabic' : ''}`}>
              <Crown className="h-5 w-5" />
              {isRTL ? 'تحكم المشرف الرئيسي' : 'Super Admin Controls'}
              <Badge variant="destructive" className="ml-2">
                {isRTL ? 'صلاحيات عليا' : 'Elevated Access'}
              </Badge>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {superAdminLinks.map((link, index) => (
                <Link key={index} to={link.href}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-red-200 dark:border-red-800 hover:border-red-500 group bg-gradient-to-br from-red-50/50 to-pink-50/50 dark:from-red-950/30 dark:to-pink-950/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg group-hover:scale-110 transition-transform">
                          {link.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-red-700 dark:text-red-300">{link.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{link.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              {isRTL ? 'النشاط الأخير' : 'Recent Activity'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'آخر الأحداث على المنصة' : 'Latest platform events'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Calendar className="h-8 w-8 opacity-50" />
              </div>
              <p className="font-medium">{isRTL ? 'لا يوجد نشاط حديث' : 'No recent activity'}</p>
              <p className="text-sm mt-1">{isRTL ? 'ستظهر الأحداث الجديدة هنا' : 'New events will appear here'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
