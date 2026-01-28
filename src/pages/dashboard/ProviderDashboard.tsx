import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Calendar, FileText, Star, Shield, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useProvider } from '@/hooks/useProvider';
import { useProviderReviews } from '@/hooks/useReviews';
import { 
  EarningsWidget, 
  PerformanceWidget, 
  BookingsOverviewWidget, 
  ClientsWidget 
} from '@/components/dashboard/ProviderWidgets';
import { cn } from '@/lib/utils';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { ProviderDashboardSkeleton } from '@/components/dashboard/DashboardSkeletons';
import { useDashboardRefresh } from '@/hooks/useDashboardRefresh';

export default function ProviderDashboard() {
  const { t, isRTL } = useLanguage();
  const { profile } = useAuth();
  const { provider, isLoading: providerLoading } = useProvider();
  const { stats: reviewStats } = useProviderReviews(provider?.id);
  const { isLoading, refresh, finishLoading } = useDashboardRefresh();

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  useEffect(() => {
    if (!providerLoading) {
      finishLoading();
    }
  }, [providerLoading, finishLoading]);

  if (isLoading && providerLoading) {
    return (
      <DashboardLayout>
        <ProviderDashboardSkeleton />
      </DashboardLayout>
    );
  }

  const avgRating = reviewStats?.averageRating || 0;

  const kycStatusBadge = () => {
    switch (provider?.kyc_status) {
      case 'approved':
        return <Badge className="bg-green-500 text-[10px] md:text-xs">{t.provider.kycApproved}</Badge>;
      case 'under_review':
        return <Badge variant="secondary" className="text-[10px] md:text-xs">{t.provider.kycUnderReview}</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-[10px] md:text-xs">{t.provider.kycRejected}</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] md:text-xs">{t.provider.kycPending}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <PullToRefresh onRefresh={refresh} className="h-full">
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Welcome Header - Compact on mobile */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className={cn('text-xl md:text-2xl font-bold mb-0.5 truncate', isRTL && 'font-arabic')}>
              {t.common.welcome}, {profile?.full_name?.split(' ')[0] || (isRTL ? 'مقدم الخدمة' : 'Provider')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'إدارة خدماتك وحجوزاتك' : 'Manage your services and bookings'}
            </p>
          </div>
          {kycStatusBadge()}
        </div>

        {/* KYC Alert - Compact on mobile */}
        {provider?.kyc_status !== 'approved' && (
          <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="p-3 md:pt-6 md:p-6">
              <div className="flex items-center gap-3 md:gap-4">
                <Shield className="h-6 w-6 md:h-8 md:w-8 text-yellow-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm md:text-base">
                    {isRTL ? 'أكمل التحقق من هويتك' : 'Complete Your Verification'}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                    {isRTL 
                      ? 'يجب إكمال التحقق من الهوية لقبول الحجوزات' 
                      : 'Complete verification to accept bookings'}
                  </p>
                </div>
                <Button size="sm" asChild className="h-8 md:h-9 shrink-0">
                  <Link to="/provider/kyc">
                    {t.provider.submitKyc}
                    <Arrow className="ms-1 md:ms-2 h-3 w-3 md:h-4 md:w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Widgets Grid - 2x2 on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          <EarningsWidget total={0} thisMonth={0} />
          <PerformanceWidget 
            completionRate={provider?.total_bookings ? 100 : 0} 
            responseTime={2} 
            rating={avgRating} 
          />
          <ClientsWidget total={provider?.total_bookings || 0} returning={0} />
          <BookingsOverviewWidget pending={0} inProgress={0} completed={provider?.total_bookings || 0} />
        </div>

        {/* Reviews Summary - Compact */}
        <Card>
          <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Star className="h-4 w-4 md:h-5 md:w-5 text-gold fill-gold" />
                  {t.provider.reviews}
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  {isRTL ? 'تقييمات العملاء' : 'Customer feedback'}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild className="h-8 text-xs md:text-sm">
                <Link to="/provider/reviews">
                  {isRTL ? 'عرض' : 'View'}
                  <Arrow className="ms-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
            {reviewStats && reviewStats.totalReviews > 0 ? (
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-bold">{avgRating.toFixed(1)}</p>
                  <div className="flex gap-0.5 mt-1 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          'h-3 w-3 md:h-4 md:w-4',
                          star <= avgRating ? 'text-gold fill-gold' : 'text-muted'
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {reviewStats.totalReviews} {isRTL ? 'تقييم' : 'reviews'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 md:py-8 text-muted-foreground">
                <Star className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">{isRTL ? 'لا توجد تقييمات بعد' : 'No reviews yet'}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links - Compact grid */}
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          <Link to="/provider/services">
            <Card className="h-full hover:border-primary transition-colors cursor-pointer active:scale-[0.98]">
              <CardContent className="p-3 md:pt-6 md:p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 text-center md:text-left">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <FileText className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-xs md:text-base truncate">{t.nav.services}</h3>
                    <p className="text-[10px] md:text-sm text-muted-foreground hidden md:block">
                      {isRTL ? 'إدارة خدماتك' : 'Manage services'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/provider/calendar">
            <Card className="h-full hover:border-primary transition-colors cursor-pointer active:scale-[0.98]">
              <CardContent className="p-3 md:pt-6 md:p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 text-center md:text-left">
                  <div className="p-2 rounded-lg bg-secondary/10 text-secondary shrink-0">
                    <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-xs md:text-base truncate">{isRTL ? 'التقويم' : 'Calendar'}</h3>
                    <p className="text-[10px] md:text-sm text-muted-foreground hidden md:block">
                      {isRTL ? 'عرض الحجوزات' : 'View bookings'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/provider/reviews">
            <Card className="h-full hover:border-primary transition-colors cursor-pointer active:scale-[0.98]">
              <CardContent className="p-3 md:pt-6 md:p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 text-center md:text-left">
                  <div className="p-2 rounded-lg bg-gold/10 text-gold shrink-0">
                    <Star className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-xs md:text-base truncate">{t.provider.reviews}</h3>
                    <p className="text-[10px] md:text-sm text-muted-foreground hidden md:block">
                      {isRTL ? 'عرض التقييمات' : 'View reviews'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
        </div>
      </PullToRefresh>
    </DashboardLayout>
  );
}
