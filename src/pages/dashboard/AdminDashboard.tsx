import { Link } from 'react-router-dom';
import { Users, Calendar, DollarSign, UserCheck, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';

export default function AdminDashboard() {
  const { t, isRTL } = useLanguage();

  const stats = [
    {
      title: t.admin.totalUsers,
      value: '0',
      change: '+0%',
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: t.admin.totalProviders,
      value: '0',
      change: '+0%',
      icon: <UserCheck className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: t.admin.totalBookings,
      value: '0',
      change: '+0%',
      icon: <Calendar className="h-5 w-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: t.admin.revenue,
      value: 'SAR 0',
      change: '+0%',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  const adminLinks = [
    {
      title: t.admin.users,
      description: isRTL ? 'إدارة المستخدمين والأدوار' : 'Manage users and roles',
      href: '/admin/users',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: t.admin.providers,
      description: isRTL ? 'إدارة مقدمي الخدمات' : 'Manage service providers',
      href: '/admin/providers',
      icon: <UserCheck className="h-5 w-5" />,
    },
    {
      title: t.admin.kycQueue,
      description: isRTL ? 'مراجعة طلبات التحقق' : 'Review verification requests',
      href: '/admin/kyc',
      icon: <AlertTriangle className="h-5 w-5" />,
      badge: 0,
    },
    {
      title: t.admin.bookings,
      description: isRTL ? 'عرض جميع الحجوزات' : 'View all bookings',
      href: '/admin/bookings',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: t.admin.analytics,
      description: isRTL ? 'تحليلات المنصة' : 'Platform analytics',
      href: '/admin/analytics',
      icon: <TrendingUp className="h-5 w-5" />,
    },
  ];

  return (
    <MainLayout>
      <div className="container py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isRTL ? 'font-arabic' : ''}`}>
            {t.admin.dashboard}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'نظرة عامة على المنصة' : 'Platform overview'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <span className="text-xs text-green-600">{stat.change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminLinks.map((link, index) => (
            <Link key={index} to={link.href}>
              <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                <CardHeader>
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
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
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
