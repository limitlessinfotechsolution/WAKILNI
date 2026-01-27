import { Link } from 'react-router-dom';
import { Calendar, FileText, CreditCard, Shield, ArrowRight, ArrowLeft, Users, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
        <div className="p-6 flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Company Profile Header */}
        <CompanyProfileWidget 
          name={isRTL ? vendor?.company_name_ar || vendor?.company_name : vendor?.company_name}
          isVerified={vendor?.kyc_status === 'approved'}
          logoUrl={vendor?.logo_url || ''}
        />

        {/* Welcome Message */}
        <div>
          <h1 className={`text-2xl font-bold mb-1 ${isRTL ? 'font-arabic' : ''}`}>
            {t.common.welcome}, {profile?.full_name || (isRTL ? 'شريك' : 'Partner')}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'إدارة شركتك وفريقك من هنا' : 'Manage your company and team from here'}
          </p>
        </div>

        {/* KYC Alert */}
        {vendor?.kyc_status !== 'approved' && (
          <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Shield className="h-8 w-8 text-yellow-600" />
                <div className="flex-1">
                  <h3 className="font-medium">
                    {isRTL ? 'أكمل توثيق الشركة' : 'Complete Company Verification'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isRTL 
                      ? 'يجب توثيق الشركة للوصول لجميع الميزات' 
                      : 'Verify your company to unlock all features'}
                  </p>
                </div>
                <Button asChild>
                  <Link to="/vendor/kyc">
                    {isRTL ? 'إكمال التوثيق' : 'Complete Verification'}
                    <Arrow className="ms-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/vendor/bookings">
            <Card className="h-full hover:border-primary transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t.nav.bookings}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'إدارة الحجوزات' : 'Manage bookings'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/vendor/services">
            <Card className="h-full hover:border-primary transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t.nav.services}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'إدارة الخدمات' : 'Manage services'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/vendor/providers">
            <Card className="h-full hover:border-primary transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{isRTL ? 'الفريق' : 'Team'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'إدارة مقدمي الخدمات' : 'Manage providers'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/vendor/subscription">
            <Card className="h-full hover:border-primary transition-colors cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{isRTL ? 'الاشتراك' : 'Subscription'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'إدارة الخطة' : 'Manage plan'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'النشاط الأخير' : 'Recent Activity'}</CardTitle>
            <CardDescription>
              {isRTL ? 'آخر الأحداث في شركتك' : 'Latest events in your company'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mb-4 opacity-50" />
              <p>{isRTL ? 'لا يوجد نشاط بعد' : 'No activity yet'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
