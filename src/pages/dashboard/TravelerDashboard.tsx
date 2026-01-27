import { Link } from 'react-router-dom';
import { Calendar, Users, FileText, Plus, MapPin, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { 
  PrayerTimeWidget, 
  QuranWidget, 
  DuaWidget, 
  TasbihWidget, 
  QiblaWidget, 
  HijriDateWidget 
} from '@/components/dashboard/TravelerWidgets';

export default function TravelerDashboard() {
  const { t, isRTL } = useLanguage();
  const { profile } = useAuth();

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

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className={`text-2xl font-bold mb-1 ${isRTL ? 'font-arabic' : ''}`}>
            {t.common.welcome}, {profile?.full_name || (isRTL ? 'مسافر' : 'Traveler')}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'إدارة حجوزاتك ومستفيديك من هنا' : 'Manage your bookings and beneficiaries from here'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Islamic Widgets Grid */}
        <div>
          <h2 className={`text-lg font-semibold mb-4 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'أدوات إسلامية' : 'Islamic Tools'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PrayerTimeWidget />
            <HijriDateWidget />
            <QiblaWidget />
            <QuranWidget />
            <DuaWidget />
            <TasbihWidget />
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className={`text-lg font-semibold mb-4 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/bookings/new">
              <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Plus className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{t.bookings.newBooking}</h3>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'ابدأ حجز جديد لمنسك' : 'Start a new pilgrimage booking'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/beneficiaries">
              <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{t.beneficiaries.addNew}</h3>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'أضف مستفيد جديد' : 'Add a new beneficiary'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/services">
              <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-accent/10 text-accent">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{t.nav.services}</h3>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'تصفح الخدمات المتاحة' : 'Browse available services'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
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
    </DashboardLayout>
  );
}
