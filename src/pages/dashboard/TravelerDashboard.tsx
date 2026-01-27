import { Link } from 'react-router-dom';
import { Calendar, Users, FileText, ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';

export default function TravelerDashboard() {
  const { t, isRTL } = useLanguage();
  const { profile } = useAuth();

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const stats = [
    {
      title: isRTL ? 'الحجوزات النشطة' : 'Active Bookings',
      value: '0',
      icon: <Calendar className="h-5 w-5" />,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: isRTL ? 'المناسك المكتملة' : 'Completed Rites',
      value: '0',
      icon: <FileText className="h-5 w-5" />,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: isRTL ? 'المستفيدون' : 'Beneficiaries',
      value: '0',
      icon: <Users className="h-5 w-5" />,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  const quickActions = [
    {
      title: t.bookings.newBooking,
      description: isRTL ? 'ابدأ حجز جديد لمنسك' : 'Start a new pilgrimage booking',
      href: '/bookings/new',
      icon: <Plus className="h-5 w-5" />,
    },
    {
      title: t.beneficiaries.addNew,
      description: isRTL ? 'أضف مستفيد جديد' : 'Add a new beneficiary',
      href: '/beneficiaries/new',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: t.nav.services,
      description: isRTL ? 'تصفح الخدمات المتاحة' : 'Browse available services',
      href: '/services',
      icon: <FileText className="h-5 w-5" />,
    },
  ];

  return (
    <MainLayout>
      <div className="container py-8 px-4">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isRTL ? 'font-arabic' : ''}`}>
            {t.common.welcome}, {profile?.full_name || (isRTL ? 'مسافر' : 'Traveler')}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'إدارة حجوزاتك ومستفيديك من هنا' : 'Manage your bookings and beneficiaries from here'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor} ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className={`text-xl font-semibold mb-4 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.href}>
                <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                      <Arrow className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t.bookings.myBookings}</CardTitle>
                <CardDescription>
                  {isRTL ? 'آخر حجوزاتك' : 'Your recent bookings'}
                </CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link to="/bookings">
                  {isRTL ? 'عرض الكل' : 'View All'}
                  <Arrow className="ms-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">{t.bookings.noBookings}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t.bookings.createFirst}</p>
              <Button asChild>
                <Link to="/bookings/new">
                  <Plus className="me-2 h-4 w-4" />
                  {t.bookings.newBooking}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
