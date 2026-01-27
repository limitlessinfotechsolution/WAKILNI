import { Link } from 'react-router-dom';
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

export default function ProviderDashboard() {
  const { t, isRTL } = useLanguage();
  const { profile } = useAuth();
  const { provider, isLoading: providerLoading } = useProvider();
  const { stats: reviewStats } = useProviderReviews(provider?.id);

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const avgRating = reviewStats?.averageRating || 0;

  const kycStatusBadge = () => {
    switch (provider?.kyc_status) {
      case 'approved':
        return <Badge className="bg-green-500">{t.provider.kycApproved}</Badge>;
      case 'under_review':
        return <Badge variant="secondary">{t.provider.kycUnderReview}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{t.provider.kycRejected}</Badge>;
      default:
        return <Badge variant="outline">{t.provider.kycPending}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className={`text-2xl font-bold mb-1 ${isRTL ? 'font-arabic' : ''}`}>
              {t.common.welcome}, {profile?.full_name || (isRTL ? 'مقدم الخدمة' : 'Provider')}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'إدارة خدماتك وحجوزاتك' : 'Manage your services and bookings'}
            </p>
          </div>
          {kycStatusBadge()}
        </div>

        {/* KYC Alert */}
        {provider?.kyc_status !== 'approved' && (
          <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Shield className="h-8 w-8 text-yellow-600" />
                <div className="flex-1">
                  <h3 className="font-medium">
                    {isRTL ? 'أكمل التحقق من هويتك' : 'Complete Your Verification'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isRTL 
                      ? 'يجب إكمال التحقق من الهوية لقبول الحجوزات' 
                      : 'Complete identity verification to start accepting bookings'}
                  </p>
                </div>
                <Button asChild>
                  <Link to="/provider/kyc">
                    {t.provider.submitKyc}
                    <Arrow className="ms-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <EarningsWidget total={0} thisMonth={0} />
          <PerformanceWidget 
            completionRate={provider?.total_bookings ? 100 : 0} 
            responseTime={2} 
            rating={avgRating} 
          />
          <ClientsWidget total={provider?.total_bookings || 0} returning={0} />
          <BookingsOverviewWidget pending={0} inProgress={0} completed={provider?.total_bookings || 0} />
        </div>

        {/* Reviews Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-gold fill-gold" />
                  {t.provider.reviews}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'تقييمات العملاء' : 'Customer feedback'}
                </CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link to="/provider/reviews">
                  {isRTL ? 'عرض الكل' : 'View All'}
                  <Arrow className="ms-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {reviewStats && reviewStats.totalReviews > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold">{avgRating.toFixed(1)}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= avgRating ? 'text-gold fill-gold' : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {reviewStats.totalReviews} {isRTL ? 'تقييم' : 'reviews'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{isRTL ? 'لا توجد تقييمات بعد' : 'No reviews yet'}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/provider/services">
            <Card className="h-full hover:border-primary transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t.nav.services}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'إدارة خدماتك' : 'Manage your services'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/provider/bookings">
            <Card className="h-full hover:border-primary transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t.nav.bookings}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'عرض الحجوزات' : 'View bookings'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/provider/reviews">
            <Card className="h-full hover:border-primary transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-gold/10 text-gold">
                    <Star className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t.provider.reviews}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'عرض التقييمات' : 'View reviews'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
