import { Link } from 'react-router-dom';
import { Calendar, FileText, CreditCard, Shield, ArrowRight, ArrowLeft, Users } from 'lucide-react';
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
import { cn } from '@/lib/utils';

export default function VendorDashboard() {
  const { t, isRTL } = useLanguage();
  const { profile } = useAuth();
  const { vendor, stats, isLoading } = useVendor();

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  // Calculate days remaining for subscription
  const daysRemaining = vendor?.subscription_expires_at 
    ? Math.max(0, Math.ceil((new Date(vendor.subscription_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6 flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
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
            <Card className="h-full hover:border-primary transition-colors cursor-pointer active:scale-[0.98]">
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
            </Card>
          </Link>
          <Link to="/vendor/services">
            <Card className="h-full hover:border-primary transition-colors cursor-pointer active:scale-[0.98]">
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
            </Card>
          </Link>
          <Link to="/vendor/kyc">
            <Card className="h-full hover:border-primary transition-colors cursor-pointer active:scale-[0.98]">
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
            </Card>
          </Link>
          <Link to="/vendor/subscription">
            <Card className="h-full hover:border-primary transition-colors cursor-pointer active:scale-[0.98]">
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
            </Card>
          </Link>
        </div>

        {/* Recent Activity - Compact */}
        <Card>
          <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
            <CardTitle className="text-base md:text-lg">{isRTL ? 'النشاط الأخير' : 'Recent Activity'}</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {isRTL ? 'آخر الأحداث' : 'Latest events'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
            <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center text-muted-foreground">
              <Calendar className="h-10 w-10 md:h-12 md:w-12 mb-3 opacity-50" />
              <p className="text-sm">{isRTL ? 'لا يوجد نشاط بعد' : 'No activity yet'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
