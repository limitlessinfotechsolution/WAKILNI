import { Link } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { Calendar, FileText, Star, Shield, ArrowRight, ArrowLeft, TrendingUp, TrendingDown, Clock, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useProvider } from '@/hooks/useProvider';
import { useProviderBookings } from '@/hooks/useProviderBookings';
import { useProviderReviews } from '@/hooks/useReviews';
import { useProviderStats } from '@/hooks/useProviderStats';
import { GlassCard, GlassCardContent, StatCard } from '@/components/cards';
import { SparklineChart } from '@/components/data-display/SparklineChart';
import { RingChart } from '@/components/data-display/RingChart';
import { FloatingActionButton } from '@/components/navigation/FloatingActionButton';
import { cn } from '@/lib/utils';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { ProviderDashboardSkeleton } from '@/components/dashboard/DashboardSkeletons';
import { useDashboardRefresh } from '@/hooks/useDashboardRefresh';

export default function ProviderDashboard() {
  const { t, isRTL } = useLanguage();
  const { profile } = useAuth();
  const { provider, isLoading: providerLoading } = useProvider();
  const { bookings: allBookings, isLoading: bookingsLoading } = useProviderBookings();
  const { stats: reviewStats } = useProviderReviews(provider?.id);
  const { isLoading, refresh, finishLoading } = useDashboardRefresh();
  const { 
    monthlyEarnings, growthPercentage, earningsTrend, completionRate, 
    averageRating, totalBookings, currency, isLoading: statsLoading 
  } = useProviderStats();

  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const TrendIcon = growthPercentage >= 0 ? TrendingUp : TrendingDown;

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayBookings = useMemo(() => 
    allBookings.filter(b => b.scheduled_date === todayStr),
    [allBookings, todayStr]
  );

  useEffect(() => {
    if (!providerLoading && !statsLoading && !bookingsLoading) {
      finishLoading();
    }
  }, [providerLoading, statsLoading, bookingsLoading, finishLoading]);

  if (isLoading && providerLoading) {
    return (
      <DashboardLayout>
        <ProviderDashboardSkeleton />
      </DashboardLayout>
    );
  }

  const avgRating = averageRating || reviewStats?.averageRating || 0;
  const displayCompletionRate = completionRate || (provider?.total_bookings ? 100 : 0);

  const kycStatusBadge = () => {
    switch (provider?.kyc_status) {
      case 'approved':
        return <Badge className="bg-emerald-500 text-white rounded-full px-3">{t.provider.kycApproved}</Badge>;
      case 'under_review':
        return <Badge variant="secondary" className="rounded-full px-3">{t.provider.kycUnderReview}</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="rounded-full px-3">{t.provider.kycRejected}</Badge>;
      default:
        return <Badge variant="outline" className="rounded-full px-3">{t.provider.kycPending}</Badge>;
    }
  };

  const fabActions = [
    { icon: <Calendar className="h-4 w-4" />, label: isRTL ? 'إدارة التوفر' : 'Manage Availability', onClick: () => {} },
    { icon: <FileText className="h-4 w-4" />, label: isRTL ? 'إضافة خدمة' : 'Add Service', onClick: () => {} },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-SA', {
      style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <PullToRefresh onRefresh={refresh} className="h-full">
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 pb-32">
          {/* Welcome Header */}
          <div className="flex items-start justify-between gap-3 animate-fade-in">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <h1 className={cn('text-2xl md:text-3xl font-bold tracking-tight', isRTL && 'font-arabic')}>
                  {t.common.welcome}
                </h1>
                <TrendingUp className="h-5 w-5 text-secondary" />
              </div>
              <p className={cn('text-lg font-medium gradient-text-gold', isRTL && 'font-arabic')}>
                {profile?.full_name?.split(' ')[0] || (isRTL ? 'مقدم الخدمة' : 'Provider')}
              </p>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'إدارة خدماتك وحجوزاتك' : 'Manage your services and bookings'}
              </p>
            </div>
            {kycStatusBadge()}
          </div>

          {/* KYC Alert */}
          {provider?.kyc_status !== 'approved' && (
            <div className="animate-fade-in" style={{ animationDelay: '50ms' }}>
              <GlassCard className="border-amber-500/30 bg-gradient-to-r from-amber-50/80 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20">
                <GlassCardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-amber-500/20">
                      <Shield className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm md:text-base">
                        {isRTL ? 'أكمل التحقق من هويتك' : 'Complete Your Verification'}
                      </h3>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {isRTL ? 'يجب إكمال التحقق من الهوية لقبول الحجوزات' : 'Complete verification to accept bookings'}
                      </p>
                    </div>
                    <Button size="sm" asChild className="rounded-xl btn-premium shrink-0">
                      <Link to="/provider/kyc">
                        {t.provider.submitKyc}
                        <Arrow className="ms-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>
          )}

          {/* Hero Earnings Card */}
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <GlassCard variant="gradient" className="overflow-hidden">
              <GlassCardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {isRTL ? 'الأرباح هذا الشهر' : "This Month's Earnings"}
                    </p>
                    <p className="text-3xl md:text-4xl font-bold gradient-text-gold">
                      {formatCurrency(monthlyEarnings)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={cn(
                        "border-0",
                        growthPercentage >= 0 
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-red-500/20 text-red-600 dark:text-red-400"
                      )}>
                        <TrendIcon className="h-3 w-3 mr-1" />
                        {growthPercentage >= 0 ? '+' : ''}{growthPercentage}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {isRTL ? 'مقارنة بالشهر الماضي' : 'vs last month'}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <SparklineChart data={earningsTrend} width={140} height={60} color="hsl(var(--secondary))" showDots={false} />
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>

          {/* Performance Rings */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              { value: displayCompletionRate, color: 'hsl(var(--primary))', label: isRTL ? 'إكمال' : 'Complete', sublabel: isRTL ? 'معدل الإكمال' : 'Completion Rate', type: 'ring' as const },
              { value: avgRating * 20, color: 'hsl(38 92% 50%)', label: isRTL ? 'تقييم' : 'Rating', sublabel: isRTL ? 'التقييم المتوسط' : 'Avg Rating', type: 'ring' as const, formatter: () => avgRating.toFixed(1) },
              { value: totalBookings || provider?.total_bookings || 0, label: isRTL ? 'الحجوزات' : 'Bookings', type: 'stat' as const, icon: Calendar },
              { value: reviewStats?.totalReviews || 0, label: isRTL ? 'المراجعات' : 'Reviews', type: 'stat' as const, icon: Star },
            ].map((item, i) => (
              <div key={i} className="animate-fade-in" style={{ animationDelay: `${150 + i * 50}ms` }}>
                {item.type === 'ring' ? (
                  <GlassCard className="p-4 flex flex-col items-center justify-center">
                    <RingChart 
                      value={item.value} size={70} strokeWidth={6} color={item.color}
                      label={item.label}
                      {...(item.formatter ? { valueFormatter: item.formatter, max: 100 } : {})}
                    />
                    <p className="text-xs text-muted-foreground mt-2">{item.sublabel}</p>
                  </GlassCard>
                ) : (
                  <StatCard
                    title={item.label}
                    value={item.value}
                    subtitle={isRTL ? 'إجمالي' : 'Total'}
                    icon={item.icon!}
                    iconBgColor={item.icon === Calendar ? 'bg-blue-500/10' : 'bg-amber-500/10'}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Today's Schedule */}
          <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
            <GlassCard variant="heavy" hoverable={false}>
              <CardHeader className="p-4 md:p-6 pb-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="h-5 w-5 text-primary" />
                      {isRTL ? 'جدول اليوم' : "Today's Schedule"}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {isRTL ? 'الحجوزات المجدولة لهذا اليوم' : 'Bookings scheduled for today'}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild className="rounded-xl">
                    <Link to="/provider/calendar">
                      {isRTL ? 'عرض التقويم' : 'View Calendar'}
                      <Arrow className="ms-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                {todayBookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 opacity-50" />
                    </div>
                    <p className="font-medium">{isRTL ? 'لا توجد حجوزات اليوم' : 'No bookings today'}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isRTL ? 'ستظهر الحجوزات المجدولة هنا' : 'Scheduled bookings will appear here'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {todayBookings.map(booking => (
                      <Link key={booking.id} to={`/bookings/${booking.id}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-all duration-200 active:scale-[0.98] group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className={cn('font-medium text-sm truncate', isRTL && 'font-arabic')}>
                              {isRTL && booking.service?.title_ar ? booking.service.title_ar : booking.service?.title || (isRTL ? 'خدمة' : 'Service')}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {booking.beneficiary?.full_name || (isRTL ? 'مستفيد' : 'Beneficiary')}
                            </p>
                          </div>
                        </div>
                        <Badge variant={booking.status === 'completed' ? 'default' : booking.status === 'in_progress' ? 'secondary' : 'outline'} className="shrink-0 text-[10px]">
                          {booking.status}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </GlassCard>
          </div>

          {/* Reviews Summary */}
          <div className="animate-fade-in" style={{ animationDelay: '450ms' }}>
            <GlassCard variant="heavy" hoverable={false}>
              <CardHeader className="p-4 md:p-6 pb-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                      {t.provider.reviews}
                    </CardTitle>
                    <CardDescription className="text-sm">{isRTL ? 'تقييمات العملاء' : 'Customer feedback'}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild className="rounded-xl">
                    <Link to="/provider/reviews">
                      {isRTL ? 'عرض الكل' : 'View All'}
                      <Arrow className="ms-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                {reviewStats && reviewStats.totalReviews > 0 ? (
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-4xl md:text-5xl font-bold gradient-text-gold">{avgRating.toFixed(1)}</p>
                      <div className="flex gap-0.5 mt-2 justify-center">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={cn('h-4 w-4', star <= avgRating ? 'text-amber-500 fill-amber-500' : 'text-muted')} />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{reviewStats.totalReviews} {isRTL ? 'تقييم' : 'reviews'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Star className="h-8 w-8 opacity-50" />
                    </div>
                    <p className="font-medium">{isRTL ? 'لا توجد تقييمات بعد' : 'No reviews yet'}</p>
                    <p className="text-sm text-muted-foreground mt-1">{isRTL ? 'ستظهر التقييمات هنا' : 'Reviews will appear here'}</p>
                  </div>
                )}
              </CardContent>
            </GlassCard>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { to: '/provider/services', icon: FileText, title: t.nav.services, desc: isRTL ? 'إدارة خدماتك' : 'Manage services', gradient: 'from-primary to-primary/80' },
              { to: '/provider/availability', icon: MapPin, title: isRTL ? 'التوفر' : 'Availability', desc: isRTL ? 'إدارة أوقاتك' : 'Manage times', gradient: 'from-secondary to-secondary/80' },
              { to: '/provider/reviews', icon: Star, title: t.provider.reviews, desc: isRTL ? 'عرض التقييمات' : 'View reviews', gradient: 'from-amber-500 to-amber-600' },
            ].map((link, i) => (
              <Link key={link.to} to={link.to} className="block animate-fade-in" style={{ animationDelay: `${500 + i * 50}ms` }}>
                <GlassCard className="h-full group">
                  <GlassCardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className={cn('p-2.5 rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform group-hover:scale-110', link.gradient)}>
                      <link.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-sm">{link.title}</h3>
                    <p className="text-xs text-muted-foreground hidden md:block">{link.desc}</p>
                  </GlassCardContent>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>
      </PullToRefresh>

      <FloatingActionButton icon={<Plus className="h-6 w-6" />} actions={fabActions} />
    </DashboardLayout>
  );
}