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

// Mock data - in production, this would come from hooks
const mockBookingTrends = [
  { date: 'Jan', bookings: 45 },
  { date: 'Feb', bookings: 52 },
  { date: 'Mar', bookings: 61 },
  { date: 'Apr', bookings: 58 },
  { date: 'May', bookings: 71 },
  { date: 'Jun', bookings: 85 },
];

const mockRevenueData = [
  { name: 'Umrah', value: 45000 },
  { name: 'Hajj', value: 75000 },
  { name: 'Ziyarat', value: 15000 },
];

const mockUserGrowth = [
  { date: 'Jan', users: 120 },
  { date: 'Feb', users: 145 },
  { date: 'Mar', users: 178 },
  { date: 'Apr', users: 210 },
  { date: 'May', users: 256 },
  { date: 'Jun', users: 312 },
];

const revenueSparkline = [45, 52, 61, 58, 71, 85, 92];
const usersSparkline = [120, 145, 178, 210, 256, 312, 350];
const bookingsSparkline = [32, 45, 38, 56, 48, 62, 71];

export default function SuperAdminAnalyticsPage() {
  const { isRTL } = useLanguage();
  const { isSuperAdmin } = useAuth();
  const navigate = useNavigate();

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
              <SparklineChart data={revenueSparkline} width={60} height={24} color="hsl(var(--primary))" />
            </div>
            <p className="text-xs text-muted-foreground">{isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}</p>
            <p className="text-xl font-bold">135,000 SAR</p>
            <p className="text-xs text-emerald-600">+12.5% {isRTL ? 'من الشهر الماضي' : 'from last month'}</p>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <SparklineChart data={usersSparkline} width={60} height={24} color="hsl(147 76% 48%)" />
            </div>
            <p className="text-xs text-muted-foreground">{isRTL ? 'المستخدمون النشطون' : 'Active Users'}</p>
            <p className="text-xl font-bold">1,248</p>
            <p className="text-xs text-emerald-600">+8.2% {isRTL ? 'من الأسبوع الماضي' : 'from last week'}</p>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <TrendingUp className="h-4 w-4 text-amber-600" />
              </div>
              <RingChart value={94.7} size={40} strokeWidth={6} showValue={false} />
            </div>
            <p className="text-xs text-muted-foreground">{isRTL ? 'معدل الإتمام' : 'Completion Rate'}</p>
            <p className="text-xl font-bold">94.7%</p>
            <p className="text-xs text-emerald-600">+2.1% {isRTL ? 'تحسن' : 'improvement'}</p>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
              <SparklineChart data={bookingsSparkline} width={60} height={24} color="hsl(280 67% 60%)" />
            </div>
            <p className="text-xs text-muted-foreground">{isRTL ? 'طلبات التحقق' : 'KYC Requests'}</p>
            <p className="text-xl font-bold">23</p>
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
                <BookingTrendsChart data={mockBookingTrends} />
              </GlassCard>
              <GlassCard>
                <RevenuePieChart data={mockRevenueData} />
              </GlassCard>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <GlassCard>
                <ServiceDistributionChart umrah={156} hajj={89} ziyarat={45} />
              </GlassCard>
              <GlassCard>
                <KycStatusChart pending={23} underReview={8} approved={245} rejected={12} />
              </GlassCard>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <GlassCard>
                <UserGrowthChart data={mockUserGrowth} />
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
                      <span className="font-bold">892</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span>{isRTL ? 'مقدمو الخدمات' : 'Providers'}</span>
                      </div>
                      <span className="font-bold">156</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span>{isRTL ? 'الوكلاء' : 'Vendors'}</span>
                      </div>
                      <span className="font-bold">45</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <span>{isRTL ? 'المشرفون' : 'Admins'}</span>
                      </div>
                      <span className="font-bold">5</span>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            {/* System Health */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassCard className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Server className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium">{isRTL ? 'وقت التشغيل' : 'Uptime'}</span>
                </div>
                <p className="text-3xl font-bold text-emerald-600">99.99%</p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'خلال 30 يوم' : 'Last 30 days'}</p>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Zap className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">{isRTL ? 'سرعة الاستجابة' : 'Response Time'}</span>
                </div>
                <p className="text-3xl font-bold">145ms</p>
                <p className="text-xs text-muted-foreground">{isRTL ? 'متوسط' : 'Average'}</p>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Database className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium">{isRTL ? 'استخدام قاعدة البيانات' : 'Database Usage'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <RingChart value={24} size={50} strokeWidth={6} valueFormatter={(v) => `${v}%`} />
                  <div>
                    <p className="text-xl font-bold">2.4 GB</p>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'من 10 GB' : 'of 10 GB'}</p>
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
