import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, TrendingUp, Users, DollarSign, Shield, Activity, 
  AlertTriangle, Settings, Zap, Server, Database, Globe, Download, Calendar
} from 'lucide-react';
import { 
  BookingTrendsChart, 
  RevenuePieChart, 
  UserGrowthChart,
  ServiceDistributionChart,
  KycStatusChart 
} from '@/components/admin/AnalyticsCharts';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/cards/StatCard';
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/cards/GlassCard';
import { SparklineChart } from '@/components/data-display/SparklineChart';
import { RingChart } from '@/components/data-display/RingChart';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAdminStats } from '@/hooks/useAdminStats';


export default function SuperAdminAnalyticsPage() {
  const { isRTL } = useLanguage();
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const { stats, isLoading: statsLoading } = useAdminStats();

  // Real data from DB
  const [analyticsData, setAnalyticsData] = useState({
    bookingTrends: [] as { date: string; bookings: number }[],
    revenueData: [] as { name: string; value: number }[],
    userGrowth: [] as { date: string; users: number }[],
    serviceDistribution: { umrah: 0, hajj: 0, ziyarat: 0 },
    kycStatus: { pending: 0, underReview: 0, approved: 0, rejected: 0 },
    completionRate: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      const [bookingsRes, servicesRes, kycRes, donationsRes] = await Promise.all([
        supabase.from('bookings').select('status, created_at, total_amount, service_id, services(service_type)'),
        supabase.from('services').select('service_type, is_active'),
        supabase.from('providers').select('kyc_status'),
        supabase.from('donations').select('amount, created_at').eq('payment_status', 'completed'),
      ]);

      // Booking trends by month
      const bookingsByMonth: Record<string, number> = {};
      (bookingsRes.data || []).forEach(b => {
        const month = new Date(b.created_at).toLocaleString('en', { month: 'short' });
        bookingsByMonth[month] = (bookingsByMonth[month] || 0) + 1;
      });
      const bookingTrends = Object.entries(bookingsByMonth).map(([date, bookings]) => ({ date, bookings }));

      // Revenue by service type
      const revenueByType: Record<string, number> = {};
      (bookingsRes.data || []).filter(b => b.status === 'completed').forEach(b => {
        const svc = Array.isArray(b.services) ? b.services[0] : b.services;
        const type = (svc as any)?.service_type || 'other';
        revenueByType[type] = (revenueByType[type] || 0) + (b.total_amount || 0);
      });
      const revenueData = Object.entries(revenueByType).map(([name, value]) => ({ 
        name: name.charAt(0).toUpperCase() + name.slice(1), value 
      }));

      // Service distribution
      const svcTypes = (servicesRes.data || []).filter(s => s.is_active);
      const serviceDistribution = {
        umrah: svcTypes.filter(s => s.service_type === 'umrah').length,
        hajj: svcTypes.filter(s => s.service_type === 'hajj').length,
        ziyarat: svcTypes.filter(s => s.service_type === 'ziyarat').length,
      };

      // KYC status
      const kycData = kycRes.data || [];
      const kycStatus = {
        pending: kycData.filter(p => p.kyc_status === 'pending').length,
        underReview: kycData.filter(p => p.kyc_status === 'under_review').length,
        approved: kycData.filter(p => p.kyc_status === 'approved').length,
        rejected: kycData.filter(p => p.kyc_status === 'rejected').length,
      };

      // Completion rate
      const total = bookingsRes.data?.length || 0;
      const completed = (bookingsRes.data || []).filter(b => b.status === 'completed').length;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;

      // Donation-based user growth (approximate)
      const donationsByMonth: Record<string, number> = {};
      (donationsRes.data || []).forEach(d => {
        const month = new Date(d.created_at).toLocaleString('en', { month: 'short' });
        donationsByMonth[month] = (donationsByMonth[month] || 0) + 1;
      });

      setAnalyticsData({
        bookingTrends,
        revenueData: revenueData.length > 0 ? revenueData : [{ name: 'No data', value: 0 }],
        userGrowth: Object.entries(donationsByMonth).map(([date, users]) => ({ date, users })),
        serviceDistribution,
        kycStatus,
        completionRate,
      });
    };
    fetchAnalytics();
  }, []);

  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <p>{isRTL ? 'غير مصرح لك بالوصول إلى هذه الصفحة' : 'You are not authorized to access this page'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header - Premium Super Admin styling */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative p-3 md:p-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-500 text-white shadow-xl shadow-purple-500/25">
              <BarChart3 className="h-6 w-6 md:h-7 md:w-7" />
              <div className="absolute inset-0 rounded-2xl bg-purple-500 blur-xl opacity-40 -z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="text-[10px] h-5 px-2 font-bold border-0 text-white bg-gradient-to-r from-red-500 to-rose-500">
                  <Zap className="h-2.5 w-2.5 mr-1" />
                  Super Admin
                </Badge>
                <Badge variant="outline" className="text-emerald-600 border-emerald-500/50 animate-pulse">
                  <Activity className="h-2.5 w-2.5 me-1" />
                  {isRTL ? 'مباشر' : 'Live'}
                </Badge>
              </div>
              <h1 className={cn('text-xl md:text-2xl font-bold', isRTL && 'font-arabic')}>
                {isRTL ? 'التحليلات المتقدمة' : 'Advanced Analytics'}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isRTL ? 'نظرة شاملة على أداء المنصة' : 'Comprehensive platform performance overview'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl">
              <Calendar className="h-4 w-4 me-2" />
              {isRTL ? 'آخر 30 يوم' : 'Last 30 days'}
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl">
              <Download className="h-4 w-4 me-2" />
              {isRTL ? 'تصدير' : 'Export'}
            </Button>
          </div>
        </div>

        {/* Quick Stats with Sparklines */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <SparklineChart data={analyticsData.bookingTrends.map(t => t.bookings)} width={60} height={24} color="hsl(var(--primary))" />
            </div>
            <p className="text-xs text-muted-foreground">{isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
            <p className="text-xl font-bold">{(stats.donationAmount || 0).toLocaleString()} SAR</p>
            <p className="text-xs text-emerald-600">{isRTL ? 'من المعاملات' : 'from transactions'}</p>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <SparklineChart data={analyticsData.userGrowth.map(u => u.users)} width={60} height={24} color="hsl(147 76% 48%)" />
            </div>
            <p className="text-xs text-muted-foreground">{isRTL ? 'المستخدمون النشطون' : 'Active Users'}</p>
            <p className="text-xl font-bold">{stats.totalTravelers + stats.totalProviders + stats.totalVendors}</p>
            <p className="text-xs text-emerald-600">{isRTL ? 'إجمالي المسجلين' : 'total registered'}</p>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <TrendingUp className="h-4 w-4 text-amber-600" />
              </div>
              <RingChart value={analyticsData.completionRate} size={40} strokeWidth={6} showValue={false} />
            </div>
            <p className="text-xs text-muted-foreground">{isRTL ? 'معدل الإتمام' : 'Completion Rate'}</p>
            <p className="text-xl font-bold">{analyticsData.completionRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">{isRTL ? 'الحجوزات المكتملة' : 'bookings completed'}</p>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
              <SparklineChart data={[analyticsData.kycStatus.pending, analyticsData.kycStatus.underReview, analyticsData.kycStatus.approved]} width={60} height={24} color="hsl(280 67% 60%)" />
            </div>
            <p className="text-xs text-muted-foreground">{isRTL ? 'طلبات التحقق' : 'KYC Requests'}</p>
            <p className="text-xl font-bold">{analyticsData.kycStatus.pending}</p>
            <p className="text-xs text-amber-600">{isRTL ? 'قيد الانتظار' : 'pending'}</p>
          </GlassCard>
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">{isRTL ? 'نظرة عامة' : 'Overview'}</TabsTrigger>
            <TabsTrigger value="users">{isRTL ? 'المستخدمون' : 'Users'}</TabsTrigger>
            <TabsTrigger value="system">{isRTL ? 'النظام' : 'System'}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <GlassCard>
                <BookingTrendsChart data={analyticsData.bookingTrends.length > 0 ? analyticsData.bookingTrends : [{ date: 'No data', bookings: 0 }]} />
              </GlassCard>
              <GlassCard>
                <RevenuePieChart data={analyticsData.revenueData} />
              </GlassCard>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <GlassCard>
                <ServiceDistributionChart umrah={analyticsData.serviceDistribution.umrah} hajj={analyticsData.serviceDistribution.hajj} ziyarat={analyticsData.serviceDistribution.ziyarat} />
              </GlassCard>
              <GlassCard>
                <KycStatusChart pending={analyticsData.kycStatus.pending} underReview={analyticsData.kycStatus.underReview} approved={analyticsData.kycStatus.approved} rejected={analyticsData.kycStatus.rejected} />
              </GlassCard>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <GlassCard>
                <UserGrowthChart data={analyticsData.userGrowth.length > 0 ? analyticsData.userGrowth : [{ date: 'No data', users: 0 }]} />
              </GlassCard>
              <GlassCard>
                <GlassCardHeader>
                  <h3 className="font-semibold">{isRTL ? 'توزيع المستخدمين' : 'User Distribution'}</h3>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'حسب نوع الحساب' : 'By account type'}</p>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span>{isRTL ? 'المسافرون' : 'Travelers'}</span>
                      </div>
                      <span className="font-bold">{stats.totalTravelers}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span>{isRTL ? 'مقدمو الخدمات' : 'Providers'}</span>
                      </div>
                      <span className="font-bold">{stats.totalProviders}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span>{isRTL ? 'الوكلاء' : 'Vendors'}</span>
                      </div>
                      <span className="font-bold">{stats.totalVendors}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <span>{isRTL ? 'المشرفون' : 'Admins'}</span>
                      </div>
                      <span className="font-bold">—</span>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassCard className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Server className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium">{isRTL ? 'الخدمات النشطة' : 'Active Services'}</span>
                </div>
                <p className="text-3xl font-bold text-emerald-600">{stats.activeServices}</p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'خدمات متاحة' : 'Available services'}</p>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Zap className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">{isRTL ? 'إجمالي الحجوزات' : 'Total Bookings'}</span>
                </div>
                <p className="text-3xl font-bold">{stats.totalBookings}</p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'حجوزات' : 'Bookings'}</p>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Database className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium">{isRTL ? 'مقدمو الخدمات' : 'Providers'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <RingChart value={stats.totalProviders > 0 ? (stats.pendingKyc / stats.totalProviders) * 100 : 0} size={50} strokeWidth={6} valueFormatter={(v) => `${Math.round(v)}%`} />
                  <div>
                    <p className="text-xl font-bold">{stats.totalProviders}</p>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'قيد التحقق' : 'Pending KYC'}: {stats.pendingKyc}</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            <GlassCard>
              <GlassCardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <h3 className="font-semibold">{isRTL ? 'التحكم السريع' : 'Quick Controls'}</h3>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate('/super-admin/settings')}>
                    <Settings className="h-4 w-4 me-2" />
                    {isRTL ? 'إعدادات النظام' : 'System Settings'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/super-admin/audit')}>
                    {isRTL ? 'سجل التدقيق' : 'Audit Logs'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/super-admin/admins')}>
                    {isRTL ? 'إدارة المشرفين' : 'Manage Admins'}
                  </Button>
                </div>
              </GlassCardContent>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
