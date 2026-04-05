import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Calendar, FileText, CreditCard, Shield, ArrowRight, ArrowLeft, Users, Plus, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useVendor } from '@/hooks/useVendor';
import { 
  SubscriptionWidget, TeamWidget, RevenueWidget, ServicesStatsWidget, CompanyProfileWidget 
} from '@/components/dashboard/VendorWidgets';
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/cards/GlassCard';
import { SparklineChart } from '@/components/data-display/SparklineChart';
import { RingChart } from '@/components/data-display/RingChart';
import { FloatingActionButton } from '@/components/navigation/FloatingActionButton';
import { cn } from '@/lib/utils';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { VendorDashboardSkeleton } from '@/components/dashboard/DashboardSkeletons';
import { useDashboardRefresh } from '@/hooks/useDashboardRefresh';

export default function VendorDashboard() {
  const { t, isRTL } = useLanguage();
  const { profile } = useAuth();
  const { vendor, stats, isLoading: vendorLoading, vendorProviders, services } = useVendor();
  const { isLoading, refresh, finishLoading } = useDashboardRefresh();

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const daysRemaining = vendor?.subscription_expires_at 
    ? Math.max(0, Math.ceil((new Date(vendor.subscription_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const subscriptionProgress = Math.min((daysRemaining / 30) * 100, 100);

  useEffect(() => {
    if (!vendorLoading) finishLoading();
  }, [vendorLoading, finishLoading]);

  const fabActions = [
    { icon: <Users className="h-5 w-5" />, label: isRTL ? 'إضافة مقدم خدمة' : 'Add Provider', onClick: () => { window.location.href = '/vendor/kyc'; } },
    { icon: <FileText className="h-5 w-5" />, label: isRTL ? 'خدمة جديدة' : 'New Service', onClick: () => { window.location.href = '/vendor/services'; } },
  ];

  if (isLoading && vendorLoading) {
    return <DashboardLayout><VendorDashboardSkeleton /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <PullToRefresh onRefresh={refresh} className="h-full">
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
          {/* Company Profile Header */}
          <div className="animate-fade-in">
            <CompanyProfileWidget 
              name={isRTL ? vendor?.company_name_ar || vendor?.company_name : vendor?.company_name}
              isVerified={vendor?.kyc_status === 'approved'}
              logoUrl={vendor?.logo_url || ''}
            />
          </div>

          {/* Welcome Message */}
          <div className="space-y-1 animate-fade-in" style={{ animationDelay: '50ms' }}>
            <h1 className={cn('text-xl md:text-2xl font-bold', isRTL && 'font-arabic')}>
              {t.common.welcome}, {profile?.full_name?.split(' ')[0] || (isRTL ? 'شريك' : 'Partner')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'إدارة شركتك وفريقك' : 'Manage your company and team'}
            </p>
          </div>

          {/* KYC Alert */}
          {vendor?.kyc_status !== 'approved' && (
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Shield className="h-6 w-6 text-yellow-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm md:text-base">
                        {isRTL ? 'أكمل توثيق الشركة' : 'Complete Verification'}
                      </h3>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {isRTL ? 'يجب توثيق الشركة للوصول لجميع الميزات' : 'Verify to unlock all features'}
                      </p>
                    </div>
                    <Button size="sm" asChild className="h-8 shrink-0 rounded-xl">
                      <Link to="/vendor/kyc">
                        {isRTL ? 'إكمال' : 'Verify'}
                        <Arrow className="ms-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Revenue Overview with Sparkline */}
          <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
            <GlassCard variant="gradient" className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-emerald-500/20">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-sm text-muted-foreground">{isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}</span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold">SAR {(stats?.totalRevenue || 0).toLocaleString()}</p>
                  {stats?.totalRevenue > 0 && (
                    <p className="text-xs text-emerald-600 mt-1">{isRTL ? 'إجمالي المكتسبات' : 'Total earned'}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <SparklineChart data={[stats?.totalRevenue || 0]} width={120} height={50} color="hsl(var(--primary))" showDots={false} />
                  <RingChart value={subscriptionProgress} size={60} strokeWidth={6} label={isRTL ? 'الاشتراك' : 'Plan'} valueFormatter={(v) => `${Math.round(v)}%`} />
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Widgets Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="animate-fade-in" style={{ animationDelay: `${200 + i * 50}ms` }}>
                {i === 0 && <SubscriptionWidget plan={vendor?.subscription_plan || 'basic'} daysRemaining={daysRemaining} isActive={daysRemaining > 0} />}
                {i === 1 && <TeamWidget totalProviders={vendorProviders.length} activeProviders={vendorProviders.filter(p => p.is_active).length} pendingVerification={0} />}
                {i === 2 && <RevenueWidget thisMonth={stats?.totalRevenue || 0} lastMonth={0} growth={0} />}
                {i === 3 && <ServicesStatsWidget totalServices={services.length} activeServices={services.filter(s => s.is_active).length} avgRating={vendor?.rating || 0} />}
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              { to: '/vendor/bookings', icon: Calendar, title: t.nav.bookings, desc: isRTL ? 'إدارة الحجوزات' : 'Manage bookings', color: 'bg-primary/10 text-primary' },
              { to: '/vendor/services', icon: FileText, title: t.nav.services, desc: isRTL ? 'إدارة الخدمات' : 'Manage services', color: 'bg-secondary/10 text-secondary' },
              { to: '/vendor/kyc', icon: Users, title: isRTL ? 'الفريق' : 'Team', desc: isRTL ? 'إدارة الفريق' : 'Manage team', color: 'bg-accent/10 text-accent-foreground' },
              { to: '/vendor/subscription', icon: CreditCard, title: isRTL ? 'الاشتراك' : 'Plan', desc: isRTL ? 'إدارة الخطة' : 'Manage plan', color: 'bg-purple-500/10 text-purple-500' },
            ].map((link, i) => (
              <Link key={link.to} to={link.to} className="animate-fade-in" style={{ animationDelay: `${400 + i * 50}ms` }}>
                <GlassCard hoverable className="h-full">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-3 text-center md:text-left">
                      <div className={cn('p-2 rounded-lg shrink-0', link.color)}>
                        <link.icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm truncate">{link.title}</h3>
                        <p className="text-[10px] text-muted-foreground hidden md:block">{link.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </GlassCard>
              </Link>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
            <GlassCard>
              <GlassCardHeader>
                <h3 className="text-base md:text-lg font-semibold">{isRTL ? 'النشاط الأخير' : 'Recent Activity'}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{isRTL ? 'آخر الأحداث' : 'Latest events'}</p>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <Calendar className="h-10 w-10 mb-3 opacity-50" />
                  <p className="text-sm">{isRTL ? 'لا يوجد نشاط بعد' : 'No activity yet'}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isRTL ? 'ستظهر الأنشطة هنا عند إجراء حجوزات' : 'Activities will appear here when bookings are made'}
                  </p>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </PullToRefresh>

      <FloatingActionButton icon={<Plus className="h-6 w-6" />} actions={fabActions} position="bottom-right" />
    </DashboardLayout>
  );
}