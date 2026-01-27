import { Link } from 'react-router-dom';
import { 
  Building2, 
  DollarSign, 
  Star, 
  Clock, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  Users,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useVendor } from '@/hooks/useVendor';
import { format } from 'date-fns';

export default function VendorDashboard() {
  const { isRTL } = useLanguage();
  const { profile } = useAuth();
  const { vendor, bookings, stats, isLoading } = useVendor();

  type KycStatus = 'pending' | 'under_review' | 'approved' | 'rejected';
  const kycStatus: KycStatus = (vendor?.kyc_status as KycStatus) || 'pending';

  const getKycBadge = (status: KycStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">{isRTL ? 'تم التحقق' : 'Verified'}</Badge>;
      case 'under_review':
        return <Badge className="bg-yellow-500">{isRTL ? 'قيد المراجعة' : 'Under Review'}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{isRTL ? 'مرفوض' : 'Rejected'}</Badge>;
      default:
        return <Badge variant="secondary">{isRTL ? 'في انتظار التحقق' : 'Pending Verification'}</Badge>;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">{isRTL ? 'مكتمل' : 'Completed'}</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">{isRTL ? 'قيد التنفيذ' : 'In Progress'}</Badge>;
      case 'accepted':
        return <Badge className="bg-primary">{isRTL ? 'مقبول' : 'Accepted'}</Badge>;
      case 'pending':
        return <Badge variant="secondary">{isRTL ? 'معلق' : 'Pending'}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{isRTL ? 'ملغي' : 'Cancelled'}</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const statCards = [
    {
      title: isRTL ? 'إجمالي الإيرادات' : 'Total Revenue',
      value: `SAR ${stats.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: isRTL ? 'إجمالي الحجوزات' : 'Total Bookings',
      value: stats.totalBookings.toString(),
      icon: <Calendar className="h-5 w-5" />,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: isRTL ? 'الحجوزات المعلقة' : 'Pending Bookings',
      value: stats.pendingBookings.toString(),
      icon: <Clock className="h-5 w-5" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: isRTL ? 'الحجوزات المكتملة' : 'Completed',
      value: stats.completedBookings.toString(),
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8 px-4">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'لوحة تحكم الوكيل' : 'Vendor Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'مرحباً' : 'Welcome'}, {vendor?.company_name || profile?.full_name || (isRTL ? 'وكيل' : 'Vendor')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{isRTL ? 'حالة التحقق:' : 'Verification:'}</span>
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
                    {isRTL ? 'يرجى إكمال التحقق من حسابك' : 'Please Complete Your Verification'}
                  </h3>
                  <p className="text-sm text-yellow-700 mb-3">
                    {isRTL 
                      ? 'لبدء استقبال الحجوزات وإدارة مقدمي الخدمات، يجب عليك إكمال عملية التحقق'
                      : 'To start receiving bookings and manage providers, you need to complete the verification process'}
                  </p>
                  <Button size="sm" asChild>
                    <Link to="/vendor/kyc">{isRTL ? 'تقديم للتحقق' : 'Submit for Verification'}</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Info */}
        {vendor?.subscription_plan && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">
                      {isRTL ? 'الباقة الحالية:' : 'Current Plan:'} {vendor.subscription_plan}
                    </p>
                    {vendor.subscription_expires_at && (
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'تنتهي في:' : 'Expires:'} {format(new Date(vendor.subscription_expires_at), 'PPP')}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/vendor/subscription">{isRTL ? 'ترقية' : 'Upgrade'}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
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
          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{isRTL ? 'الحجوزات الأخيرة' : 'Recent Bookings'}</CardTitle>
                  <CardDescription>
                    {isRTL ? 'آخر طلبات الحجز' : 'Latest booking requests'}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/vendor/bookings">{isRTL ? 'عرض الكل' : 'View All'}</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">
                          {booking.service?.title || 'Service'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.beneficiary?.full_name || 'Beneficiary'}
                        </p>
                        {booking.scheduled_date && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(booking.scheduled_date), 'PP')}
                          </p>
                        )}
                      </div>
                      <div className="text-end">
                        {getStatusBadge(booking.status)}
                        {booking.total_amount && (
                          <p className="text-sm font-medium mt-1">
                            SAR {booking.total_amount}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    {isRTL ? 'لا توجد حجوزات بعد' : 'No bookings yet'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{isRTL ? 'إجراءات سريعة' : 'Quick Actions'}</CardTitle>
              <CardDescription>
                {isRTL ? 'إدارة وكالتك' : 'Manage your agency'}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <Link to="/vendor/providers">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">{isRTL ? 'مقدمو الخدمات' : 'Providers'}</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <Link to="/vendor/services">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">{isRTL ? 'الخدمات' : 'Services'}</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <Link to="/vendor/bookings">
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">{isRTL ? 'الحجوزات' : 'Bookings'}</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                <Link to="/vendor/profile">
                  <Building2 className="h-6 w-6" />
                  <span className="text-sm">{isRTL ? 'الملف التعريفي' : 'Profile'}</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
