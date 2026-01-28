import { Link } from 'react-router-dom';
import { Calendar, Users, FileText, Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { StatCard } from '@/components/ui/mobile-card';
import { 
  PrayerTimeWidget, 
  QuranWidget, 
  DuaWidget, 
  TasbihWidget, 
  QiblaWidget, 
  HijriDateWidget 
} from '@/components/dashboard/TravelerWidgets';
import { cn } from '@/lib/utils';

export default function TravelerDashboard() {
  const { t, isRTL } = useLanguage();
  const { profile } = useAuth();

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Welcome Header - Compact on mobile */}
        <div className="space-y-0.5">
          <h1 className={cn('text-xl md:text-2xl font-bold', isRTL && 'font-arabic')}>
            {t.common.welcome}, {profile?.full_name?.split(' ')[0] || (isRTL ? 'مسافر' : 'Traveler')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isRTL ? 'إدارة حجوزاتك ومستفيديك' : 'Manage your bookings and beneficiaries'}
          </p>
        </div>

        {/* Stats Grid - Compact mobile cards */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <StatCard
            title={isRTL ? 'الحجوزات النشطة' : 'Active'}
            value="0"
            icon={<Calendar />}
            color="primary"
          />
          <StatCard
            title={isRTL ? 'المناسك المكتملة' : 'Completed'}
            value="0"
            icon={<FileText />}
            color="secondary"
          />
          <StatCard
            title={isRTL ? 'المستفيدون' : 'Beneficiaries'}
            value="0"
            icon={<Users />}
            color="green"
          />
        </div>

        {/* Quick Actions - Mobile optimized */}
        <div>
          <h2 className={cn('text-base md:text-lg font-semibold mb-3', isRTL && 'font-arabic')}>
            {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
            <Link to="/bookings/new">
              <Card className="h-full hover:border-primary transition-colors cursor-pointer active:scale-[0.98]">
                <CardContent className="p-3 md:pt-6 md:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      <Plus className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-sm md:text-base truncate">{t.bookings.newBooking}</h3>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {isRTL ? 'ابدأ حجز جديد' : 'Start a new booking'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/beneficiaries">
              <Card className="h-full hover:border-primary transition-colors cursor-pointer active:scale-[0.98]">
                <CardContent className="p-3 md:pt-6 md:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/10 text-secondary shrink-0">
                      <Users className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-sm md:text-base truncate">{t.beneficiaries.addNew}</h3>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {isRTL ? 'أضف مستفيد جديد' : 'Add a beneficiary'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/services">
              <Card className="h-full hover:border-primary transition-colors cursor-pointer active:scale-[0.98]">
                <CardContent className="p-3 md:pt-6 md:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10 text-accent shrink-0">
                      <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-sm md:text-base truncate">{t.nav.services}</h3>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {isRTL ? 'تصفح الخدمات' : 'Browse services'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Islamic Widgets Grid - Responsive */}
        <div>
          <h2 className={cn('text-base md:text-lg font-semibold mb-3', isRTL && 'font-arabic')}>
            {isRTL ? 'أدوات إسلامية' : 'Islamic Tools'}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
            <PrayerTimeWidget />
            <HijriDateWidget />
            <QiblaWidget />
            <QuranWidget />
            <DuaWidget />
            <TasbihWidget />
          </div>
        </div>

        {/* Recent Bookings - Compact */}
        <Card>
          <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base md:text-lg">{t.bookings.myBookings}</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  {isRTL ? 'آخر حجوزاتك' : 'Your recent bookings'}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild className="h-8 text-xs md:text-sm">
                <Link to="/bookings">
                  {isRTL ? 'عرض الكل' : 'View All'}
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
            <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center">
              <Calendar className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-3 md:mb-4" />
              <h3 className="font-medium text-sm md:text-base mb-1">{t.bookings.noBookings}</h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">{t.bookings.createFirst}</p>
              <Button size="sm" asChild className="h-9">
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
