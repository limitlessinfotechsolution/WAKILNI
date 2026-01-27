import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Star, Clock, FileText, AlertCircle, CheckCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useProvider } from '@/hooks/useProvider';
import { useProviderReviews } from '@/hooks/useReviews';
export default function ProviderDashboard() {
  const { t, isRTL } = useLanguage();
  const { profile } = useAuth();
  const { provider } = useProvider();
  const { stats: reviewStats } = useProviderReviews(provider?.id);

  // Mock KYC status - would come from providers table
  // Mock KYC status - would come from providers table
  type KycStatus = 'pending' | 'under_review' | 'approved' | 'rejected';
  const kycStatus: KycStatus = 'pending';

  const getKycBadge = (status: KycStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">{t.provider.kycApproved}</Badge>;
      case 'under_review':
        return <Badge className="bg-yellow-500">{t.provider.kycUnderReview}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{t.provider.kycRejected}</Badge>;
      default:
        return <Badge variant="secondary">{t.provider.kycPending}</Badge>;
    }
  };

  const stats = [
    {
      title: t.provider.earnings,
      value: 'SAR 0',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: t.provider.rating,
      value: reviewStats.averageRating.toFixed(1),
      icon: <Star className="h-5 w-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: t.provider.completedBookings,
      value: '0',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: t.provider.pendingRequests,
      value: '0',
      icon: <Clock className="h-5 w-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <MainLayout>
      <div className="container py-8 px-4">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isRTL ? 'font-arabic' : ''}`}>
              {t.provider.dashboard}
            </h1>
            <p className="text-muted-foreground">
              {t.common.welcome}, {profile?.full_name || (isRTL ? 'مقدم خدمة' : 'Provider')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t.provider.kyc}:</span>
            {getKycBadge(kycStatus)}
          </div>
        </div>

        {/* KYC Alert for pending status */}
        {kycStatus === 'pending' && (
          <Card className="mb-8 border-yellow-300 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-medium text-yellow-800 mb-1">
                    {isRTL ? 'يرجى إكمال التحقق من هويتك' : 'Please Complete Your Verification'}
                  </h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    {isRTL 
                      ? 'لبدء استقبال الحجوزات، يجب عليك إكمال عملية التحقق من الهوية'
                      : 'To start receiving bookings, you need to complete the identity verification process'}
                  </p>
                  <Button size="sm" asChild>
                    <Link to="/provider/kyc">{t.provider.submitKyc}</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor} ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Requests */}
          <Card>
            <CardHeader>
              <CardTitle>{t.provider.pendingRequests}</CardTitle>
              <CardDescription>
                {isRTL ? 'طلبات الحجز الجديدة' : 'New booking requests'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  {isRTL ? 'لا توجد طلبات معلقة' : 'No pending requests'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* My Services */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t.nav.services}</CardTitle>
                  <CardDescription>
                    {isRTL ? 'الخدمات التي تقدمها' : 'Services you offer'}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/provider/services">
                    {isRTL ? 'إدارة' : 'Manage'}
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-3">
                  {isRTL ? 'لم تضف أي خدمات بعد' : 'No services added yet'}
                </p>
                <Button size="sm" asChild>
                  <Link to="/provider/services/new">
                    {isRTL ? 'إضافة خدمة' : 'Add Service'}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {isRTL ? 'التقييمات' : 'Reviews'}
                  </CardTitle>
                  <CardDescription>
                    {isRTL ? 'تقييمات المسافرين لخدماتك' : 'Traveler feedback on your services'}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/provider/reviews">
                    {isRTL ? 'عرض الكل' : 'View All'}
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{reviewStats.averageRating.toFixed(1)}</div>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(reviewStats.averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {reviewStats.totalReviews} {isRTL ? 'تقييم' : 'reviews'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
