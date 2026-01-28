import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Calendar, FileText, CreditCard, Shield, ArrowRight, ArrowLeft, Users, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useVendor } from '@/hooks/useVendor';
import { 
  SubscriptionWidget, 
  TeamWidget, 
  RevenueWidget, 
  ServicesStatsWidget, 
  CompanyProfileWidget 
} from '@/components/dashboard/VendorWidgets';
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/cards/GlassCard';
import { SparklineChart } from '@/components/data-display/SparklineChart';
import { RingChart } from '@/components/data-display/RingChart';
import { FloatingActionButton } from '@/components/navigation/FloatingActionButton';
import { Timeline } from '@/components/data-display/Timeline';
import { cn } from '@/lib/utils';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { VendorDashboardSkeleton } from '@/components/dashboard/DashboardSkeletons';
import { useDashboardRefresh } from '@/hooks/useDashboardRefresh';

// Mock revenue trend data
const revenueSparkline = [2500, 3200, 2800, 4100, 3800, 4500, 5200];
const bookingsSparkline = [12, 18, 15, 22, 19, 25, 28];

export default function VendorDashboard() {
  const { t, isRTL } = useLanguage();
  const { profile } = useAuth();
  const { vendor, stats, isLoading: vendorLoading } = useVendor();
  const { isLoading, refresh, finishLoading } = useDashboardRefresh();

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  // Calculate days remaining for subscription
  const daysRemaining = vendor?.subscription_expires_at 
    ? Math.max(0, Math.ceil((new Date(vendor.subscription_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Subscription progress for ring chart
  const subscriptionProgress = Math.min((daysRemaining / 30) * 100, 100);

  useEffect(() => {
    if (!vendorLoading) {
      finishLoading();
    }
  }, [vendorLoading, finishLoading]);

  const fabActions = [
    {
      icon: <Users className="h-5 w-5" />,
      label: isRTL ? 'إضافة مقدم خدمة' : 'Add Provider',
      onClick: () => { window.location.href = '/vendor/kyc'; },
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: isRTL ? 'خدمة جديدة' : 'New Service',
      onClick: () => { window.location.href = '/vendor/services'; },
    },
  ];

  if (isLoading && vendorLoading) {
    return (
      <DashboardLayout>
        <VendorDashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PullToRefresh onRefresh={refresh} className="h-full">
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Company Profile Header - Compact on mobile */}
          <CompanyProfileWidget 
            name={isRTL ? vendor?.company_name_ar || vendor?.company_name : vendor?.company_name}
            isVerified={vendor?.kyc_status === 'approved'}
            logoUrl={vendor?.logo_url || ''}
          />

          {/* Welcome Message */}
          <div className="space-y-0.5">
            <h1 className={cn('text-xl md:text-2xl font-bold', isRTL && 'font-arabic')}>
              {t.common.welcome}, {profile?.full_name?.split(' ')[0] || (isRTL ? 'شريك' : 'Partner')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'إدارة شركتك وفريقك' : 'Manage your company and team'}
            </p>
          </div>

          {/* KYC Alert - Compact on mobile */}
          {vendor?.kyc_status !== 'approved' && (
            <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
              <CardContent className="p-3 md:pt-6 md:p-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <Shield className="h-6 w-6 md:h-8 md:w-8 text-yellow-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm md:text-base">
                      {isRTL ? 'أكمل توثيق الشركة' : 'Complete Verification'}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                      {isRTL 
                        ? 'يجب توثيق الشركة للوصول لجميع الميزات' 
                        : 'Verify to unlock all features'}
                    </p>
                  </div>
                  <Button size="sm" asChild className="h-8 md:h-9 shrink-0">
                    <Link to="/vendor/kyc">
                      {isRTL ? 'إكمال' : 'Verify'}
                      <Arrow className="ms-1 md:ms-2 h-3 w-3 md:h-4 md:w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Revenue Overview with Sparkline */}
          <GlassCard variant="gradient" className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
                  </span>
                </div>
                <p className="text-2xl md:text-3xl font-bold">
                  SAR {(stats?.totalRevenue || 0).toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  +18% {isRTL ? 'مقارنة بالشهر الماضي' : 'vs last month'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <SparklineChart 
                  data={revenueSparkline} 
                  width={120} 
                  height={50}
                  color="hsl(var(--primary))"
                  showDots={false}
                />
                <RingChart
                  value={subscriptionProgress}
                  size={60}
                  strokeWidth={6}
                  label={isRTL ? 'الاشتراك' : 'Plan'}
                  valueFormatter={(v) => `${Math.round(v)}%`}
                />
              </div>
            </div>
          </GlassCard>

          {/* Widgets Grid - 2x2 on mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            <SubscriptionWidget 
              plan={vendor?.subscription_plan || 'basic'} 
              daysRemaining={daysRemaining}
              isActive={daysRemaining > 0}
            />
            <TeamWidget 
              totalProviders={0} 
              activeProviders={0} 
              pendingVerification={0} 
            />
            <RevenueWidget 
              thisMonth={stats?.totalRevenue || 0} 
              lastMonth={0} 
              growth={0} 
            />
            <ServicesStatsWidget 
              totalServices={0} 
              activeServices={0} 
              avgRating={vendor?.rating || 0} 
            />
          </div>

          {/* Quick Links - 2x2 on mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            <Link to="/vendor/bookings">
              <GlassCard hoverable className="h-full">
                <CardContent className="p-3 md:pt-6 md:p-6">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 text-center md:text-left">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-xs md:text-base truncate">{t.nav.bookings}</h3>
                      <p className="text-[10px] md:text-sm text-muted-foreground hidden md:block">
                        {isRTL ? 'إدارة الحجوزات' : 'Manage bookings'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </GlassCard>
            </Link>
            <Link to="/vendor/services">
              <GlassCard hoverable className="h-full">
                <CardContent className="p-3 md:pt-6 md:p-6">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 text-center md:text-left">
                    <div className="p-2 rounded-lg bg-secondary/10 text-secondary shrink-0">
                      <FileText className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-xs md:text-base truncate">{t.nav.services}</h3>
                      <p className="text-[10px] md:text-sm text-muted-foreground hidden md:block">
                        {isRTL ? 'إدارة الخدمات' : 'Manage services'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </GlassCard>
            </Link>
            <Link to="/vendor/kyc">
              <GlassCard hoverable className="h-full">
                <CardContent className="p-3 md:pt-6 md:p-6">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 text-center md:text-left">
                    <div className="p-2 rounded-lg bg-accent/10 text-accent shrink-0">
                      <Users className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-xs md:text-base truncate">{isRTL ? 'الفريق' : 'Team'}</h3>
                      <p className="text-[10px] md:text-sm text-muted-foreground hidden md:block">
                        {isRTL ? 'إدارة الفريق' : 'Manage team'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </GlassCard>
            </Link>
            <Link to="/vendor/subscription">
              <GlassCard hoverable className="h-full">
                <CardContent className="p-3 md:pt-6 md:p-6">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4 text-center md:text-left">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
                      <CreditCard className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-xs md:text-base truncate">{isRTL ? 'الاشتراك' : 'Plan'}</h3>
                      <p className="text-[10px] md:text-sm text-muted-foreground hidden md:block">
                        {isRTL ? 'إدارة الخطة' : 'Manage plan'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </GlassCard>
            </Link>
          </div>

          {/* Recent Activity with Timeline */}
          <GlassCard>
            <GlassCardHeader>
              <h3 className="text-base md:text-lg font-semibold">{isRTL ? 'النشاط الأخير' : 'Recent Activity'}</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                {isRTL ? 'آخر الأحداث' : 'Latest events'}
              </p>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center text-muted-foreground">
                <Calendar className="h-10 w-10 md:h-12 md:w-12 mb-3 opacity-50" />
                <p className="text-sm">{isRTL ? 'لا يوجد نشاط بعد' : 'No activity yet'}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isRTL ? 'ستظهر الأنشطة هنا عند إجراء حجوزات' : 'Activities will appear here when bookings are made'}
                </p>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </PullToRefresh>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon={<Plus className="h-6 w-6" />}
        actions={fabActions}
        position="bottom-right"
      />
    </DashboardLayout>
  );
}
