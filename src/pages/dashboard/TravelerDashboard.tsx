import { Link } from 'react-router-dom';
import { Calendar, Users, FileText, Plus, MapPin, Sparkles, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { GlassCard, GlassCardContent, StatCard } from '@/components/cards';
import { 
  PrayerTimeWidget, 
  QuranWidget, 
  DuaWidget, 
  TasbihWidget, 
  QiblaWidget, 
  HijriDateWidget 
} from '@/components/dashboard/TravelerWidgets';
import { cn } from '@/lib/utils';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { TravelerDashboardSkeleton } from '@/components/dashboard/DashboardSkeletons';
import { useDashboardRefresh } from '@/hooks/useDashboardRefresh';
import { useTravelerStats } from '@/hooks/useTravelerStats';
import { useBookings } from '@/hooks/useBookings';
import { useEffect } from 'react';
import { format } from 'date-fns';

export default function TravelerDashboard() {
  const { t, isRTL } = useLanguage();
  const { profile } = useAuth();
  const { isLoading, refresh, finishLoading } = useDashboardRefresh();
  const { 
    activeBookings, 
    completedBookings, 
    beneficiariesCount, 
    isLoading: statsLoading 
  } = useTravelerStats();
  const { bookings, isLoading: bookingsLoading } = useBookings();

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  // Get 3 most recent bookings
  const recentBookings = bookings?.slice(0, 3) || [];

  useEffect(() => {
    if (!statsLoading && !bookingsLoading) {
      const timer = setTimeout(finishLoading, 300);
      return () => clearTimeout(timer);
    }
  }, [statsLoading, bookingsLoading, finishLoading]);

  if (isLoading && statsLoading) {
    return (
      <DashboardLayout>
        <TravelerDashboardSkeleton />
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'accepted': 
      case 'in_progress': return 'bg-primary';
      case 'pending': return 'bg-amber-500';
      case 'cancelled': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      pending: { en: 'Pending', ar: 'قيد الانتظار' },
      accepted: { en: 'Accepted', ar: 'مقبول' },
      in_progress: { en: 'In Progress', ar: 'جاري' },
      completed: { en: 'Completed', ar: 'مكتمل' },
      cancelled: { en: 'Cancelled', ar: 'ملغي' },
    };
    return isRTL ? labels[status]?.ar : labels[status]?.en || status;
  };

  return (
    <DashboardLayout>
      <PullToRefresh onRefresh={refresh} className="h-full">
        <div className="p-4 md:p-6 space-y-5 md:space-y-6">
          {/* Welcome Header - Premium styling */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className={cn(
                'text-2xl md:text-3xl font-bold tracking-tight',
                isRTL && 'font-arabic'
              )}>
                {t.common.welcome}
              </h1>
              <Sparkles className="h-5 w-5 text-secondary animate-pulse-scale" />
            </div>
            <p className={cn(
              'text-lg md:text-xl font-medium gradient-text-sacred',
              isRTL && 'font-arabic'
            )}>
              {profile?.full_name?.split(' ')[0] || (isRTL ? 'مسافر' : 'Traveler')}
            </p>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'إدارة حجوزاتك ومستفيديك' : 'Manage your bookings and beneficiaries'}
            </p>
          </div>

          {/* Stats Grid - Premium cards with live data */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <StatCard
              title={isRTL ? 'نشطة' : 'Active'}
              value={activeBookings}
              icon={Calendar}
              iconBgColor="bg-primary/10"
              className="animate-fade-in-up"
            />
            <StatCard
              title={isRTL ? 'مكتملة' : 'Done'}
              value={completedBookings}
              icon={FileText}
              iconBgColor="bg-secondary/10"
              className="animate-fade-in-up"
              style={{ animationDelay: '50ms' }}
            />
            <StatCard
              title={isRTL ? 'العائلة' : 'Family'}
              value={beneficiariesCount}
              icon={Users}
              iconBgColor="bg-emerald-500/10"
              className="animate-fade-in-up"
              style={{ animationDelay: '100ms' }}
            />
          </div>

          {/* Quick Actions - Glass cards with hover effects */}
          <div className="space-y-3">
            <h2 className={cn(
              'text-lg font-semibold',
              isRTL && 'font-arabic'
            )}>
              {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link to="/bookings/new" className="block">
                <GlassCard className="h-full group">
                  <GlassCardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-glow-primary transition-transform group-hover:scale-110">
                        <Plus className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm md:text-base">{t.bookings.newBooking}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {isRTL ? 'ابدأ حجز جديد' : 'Start a new booking'}
                        </p>
                      </div>
                    </div>
                  </GlassCardContent>
                </GlassCard>
              </Link>
              
              <Link to="/beneficiaries" className="block">
                <GlassCard className="h-full group">
                  <GlassCardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 text-white shadow-glow-gold transition-transform group-hover:scale-110">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm md:text-base">{t.beneficiaries.addNew}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {isRTL ? 'أضف مستفيد جديد' : 'Add a beneficiary'}
                        </p>
                      </div>
                    </div>
                  </GlassCardContent>
                </GlassCard>
              </Link>
              
              <Link to="/services" className="block">
                <GlassCard className="h-full group">
                  <GlassCardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg transition-transform group-hover:scale-110">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm md:text-base">{t.nav.services}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {isRTL ? 'تصفح الخدمات' : 'Browse services'}
                        </p>
                      </div>
                    </div>
                  </GlassCardContent>
                </GlassCard>
              </Link>
            </div>
          </div>

          {/* Islamic Widgets Grid */}
          <div className="space-y-3">
            <h2 className={cn(
              'text-lg font-semibold',
              isRTL && 'font-arabic'
            )}>
              {isRTL ? 'أدوات إسلامية' : 'Islamic Tools'}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <PrayerTimeWidget />
              <HijriDateWidget />
              <QiblaWidget />
              <QuranWidget />
              <DuaWidget />
              <TasbihWidget />
            </div>
          </div>

          {/* Recent Bookings - Premium card with real data */}
          <GlassCard variant="heavy" hoverable={false}>
            <CardHeader className="p-4 md:p-6 pb-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">{t.bookings.myBookings}</CardTitle>
                  <CardDescription className="text-sm">
                    {isRTL ? 'آخر حجوزاتك' : 'Your recent bookings'}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild className="rounded-xl">
                  <Link to="/bookings">
                    {isRTL ? 'عرض الكل' : 'View All'}
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {recentBookings.length > 0 ? (
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <Link 
                      key={booking.id} 
                      to={`/bookings/${booking.id}`}
                      className="block"
                    >
                      <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {booking.service?.title || (isRTL ? 'خدمة' : 'Service')}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {booking.scheduled_date 
                                ? format(new Date(booking.scheduled_date), 'MMM d, yyyy')
                                : (isRTL ? 'غير محدد' : 'Not scheduled')
                              }
                            </span>
                          </div>
                        </div>
                        <Badge className={cn(
                          'text-white text-[10px] rounded-full',
                          getStatusColor(booking.status || 'pending')
                        )}>
                          {getStatusLabel(booking.status || 'pending')}
                        </Badge>
                        <Arrow className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-1">{t.bookings.noBookings}</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                    {t.bookings.createFirst}
                  </p>
                  <Button asChild className="rounded-xl btn-premium">
                    <Link to="/bookings/new">
                      <Plus className="me-2 h-4 w-4" />
                      {t.bookings.newBooking}
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </GlassCard>
        </div>
      </PullToRefresh>
    </DashboardLayout>
  );
}
