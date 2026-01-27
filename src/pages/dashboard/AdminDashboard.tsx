import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, DollarSign, UserCheck, AlertTriangle, TrendingUp,
  Building2, Heart, Settings, Shield, FileText, Bell
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useAuth } from '@/lib/auth';

export default function AdminDashboard() {
  const { t, isRTL } = useLanguage();
  const { stats, isLoading } = useAdminStats();
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const mainStats = [
    {
      title: isRTL ? 'المسافرون' : 'Travelers',
      value: stats.totalTravelers.toString(),
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: isRTL ? 'مقدمو الخدمات' : 'Providers',
      value: stats.totalProviders.toString(),
      icon: <UserCheck className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: isRTL ? 'الوكلاء' : 'Vendors',
      value: stats.totalVendors.toString(),
      icon: <Building2 className="h-5 w-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: isRTL ? 'الحجوزات' : 'Bookings',
      value: stats.totalBookings.toString(),
      icon: <Calendar className="h-5 w-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: isRTL ? 'التبرعات' : 'Donations',
      value: `SAR ${stats.donationAmount.toLocaleString()}`,
      icon: <Heart className="h-5 w-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: isRTL ? 'طلبات التحقق المعلقة' : 'Pending KYC',
      value: stats.pendingKyc.toString(),
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  const adminLinks = [
    {
      title: isRTL ? 'إدارة المستخدمين' : 'User Management',
      description: isRTL ? 'إدارة المسافرين والأدوار' : 'Manage travelers and roles',
      href: '/admin/users',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: isRTL ? 'إدارة مقدمي الخدمات' : 'Provider Management',
      description: isRTL ? 'إدارة مقدمي خدمات الحج والعمرة' : 'Manage Hajj & Umrah service providers',
      href: '/admin/providers',
      icon: <UserCheck className="h-5 w-5" />,
    },
    {
      title: isRTL ? 'إدارة الوكلاء' : 'Vendor Management',
      description: isRTL ? 'إدارة وكالات السفر' : 'Manage travel agencies',
      href: '/admin/vendors',
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      title: isRTL ? 'طابور التحقق' : 'KYC Queue',
      description: isRTL ? 'مراجعة طلبات التحقق' : 'Review verification requests',
      href: '/admin/kyc',
      icon: <AlertTriangle className="h-5 w-5" />,
      badge: stats.pendingKyc,
    },
    {
      title: isRTL ? 'التبرعات والصدقات' : 'Donations & Charity',
      description: isRTL ? 'إدارة التبرعات وطلبات الصدقة' : 'Manage donations and charity requests',
      href: '/admin/donations',
      icon: <Heart className="h-5 w-5" />,
    },
    {
      title: isRTL ? 'إدارة الحجوزات' : 'Booking Management',
      description: isRTL ? 'عرض وتخصيص الحجوزات' : 'View and allocate bookings',
      href: '/admin/bookings',
      icon: <Calendar className="h-5 w-5" />,
      badge: stats.pendingBookings,
    },
    {
      title: isRTL ? 'إشعارات النظام' : 'System Notices',
      description: isRTL ? 'إدارة الإعلانات والتنبيهات' : 'Manage announcements and alerts',
      href: '/admin/notices',
      icon: <Bell className="h-5 w-5" />,
    },
    {
      title: isRTL ? 'التقارير' : 'Reports & Analytics',
      description: isRTL ? 'تحليلات المنصة' : 'Platform analytics',
      href: '/admin/analytics',
      icon: <TrendingUp className="h-5 w-5" />,
    },
  ];

  const superAdminLinks = [
    {
      title: isRTL ? 'إعدادات النظام' : 'System Settings',
      description: isRTL ? 'تحكم في ميزات النظام' : 'Control system features',
      href: '/super-admin/settings',
      icon: <Settings className="h-5 w-5" />,
    },
    {
      title: isRTL ? 'سجل التدقيق' : 'Audit Logs',
      description: isRTL ? 'تتبع جميع الإجراءات' : 'Track all actions',
      href: '/super-admin/audit',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: isRTL ? 'إدارة المشرفين' : 'Admin Management',
      description: isRTL ? 'إدارة حسابات المشرفين' : 'Manage admin accounts',
      href: '/super-admin/admins',
      icon: <Shield className="h-5 w-5" />,
    },
  ];

  return (
    <MainLayout>
      <div className="container py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isRTL ? 'font-arabic' : ''}`}>
            {isSuperAdmin 
              ? (isRTL ? 'لوحة التحكم الرئيسية' : 'Super Admin Dashboard')
              : (isRTL ? 'لوحة تحكم المشرف' : 'Admin Dashboard')
            }
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'نظرة عامة على المنصة' : 'Platform overview'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {mainStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <div className={`p-1.5 rounded-lg ${stat.bgColor} ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
                <p className="text-xl font-bold">{isLoading ? '...' : stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin Actions Grid */}
        <div className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'الإدارة' : 'Management'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {adminLinks.map((link, index) => (
              <Link key={index} to={link.href}>
                <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {link.icon}
                      </div>
                      {link.badge !== undefined && link.badge > 0 && (
                        <span className="px-2 py-1 text-xs font-medium bg-destructive text-destructive-foreground rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-base">{link.title}</CardTitle>
                    <CardDescription className="text-xs">{link.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Super Admin Section */}
        {isSuperAdmin && (
          <div className="mb-8">
            <h2 className={`text-xl font-semibold mb-4 text-destructive ${isRTL ? 'font-arabic' : ''}`}>
              <Shield className="inline-block h-5 w-5 mr-2" />
              {isRTL ? 'تحكم المشرف الرئيسي' : 'Super Admin Controls'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {superAdminLinks.map((link, index) => (
                <Link key={index} to={link.href}>
                  <Card className="h-full hover:border-destructive transition-colors cursor-pointer border-destructive/20">
                    <CardHeader className="pb-3">
                      <div className="p-2 rounded-lg bg-destructive/10 text-destructive w-fit">
                        {link.icon}
                      </div>
                      <CardTitle className="text-base">{link.title}</CardTitle>
                      <CardDescription className="text-xs">{link.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'النشاط الأخير' : 'Recent Activity'}</CardTitle>
            <CardDescription>
              {isRTL ? 'آخر الأحداث على المنصة' : 'Latest platform events'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                {isRTL ? 'لا يوجد نشاط حديث' : 'No recent activity'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
