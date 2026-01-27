import { Building2, Users, TrendingUp, CreditCard, Calendar, Star, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';

// Subscription Status Widget
export function SubscriptionWidget({ 
  plan = 'basic', 
  daysRemaining = 0,
  isActive = true 
}: { 
  plan?: string; 
  daysRemaining?: number;
  isActive?: boolean;
}) {
  const { isRTL } = useLanguage();

  const planNames: Record<string, { en: string; ar: string }> = {
    basic: { en: 'Basic', ar: 'أساسي' },
    premium: { en: 'Premium', ar: 'مميز' },
    enterprise: { en: 'Enterprise', ar: 'مؤسسي' },
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'font-arabic' : ''}`}>
          <CreditCard className="h-5 w-5 text-purple-500" />
          {isRTL ? 'الاشتراك' : 'Subscription'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant={isActive ? 'default' : 'destructive'}>
              {isActive 
                ? (isRTL ? 'نشط' : 'Active') 
                : (isRTL ? 'منتهي' : 'Expired')}
            </Badge>
            <span className="font-semibold">
              {isRTL ? planNames[plan]?.ar : planNames[plan]?.en}
            </span>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">
                {isRTL ? 'الأيام المتبقية' : 'Days Remaining'}
              </span>
              <span className="font-medium">{daysRemaining}</span>
            </div>
            <Progress value={(daysRemaining / 30) * 100} className="h-2" />
          </div>
          <Button variant="outline" size="sm" className="w-full">
            {isRTL ? 'ترقية الخطة' : 'Upgrade Plan'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Team Overview Widget
export function TeamWidget({ 
  totalProviders = 0, 
  activeProviders = 0,
  pendingVerification = 0 
}: { 
  totalProviders?: number; 
  activeProviders?: number;
  pendingVerification?: number;
}) {
  const { isRTL } = useLanguage();

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'font-arabic' : ''}`}>
          <Users className="h-5 w-5 text-blue-500" />
          {isRTL ? 'فريق العمل' : 'Team'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-2xl font-bold">{totalProviders}</p>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'الإجمالي' : 'Total'}
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500">{activeProviders}</p>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'نشط' : 'Active'}
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-500">{pendingVerification}</p>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'قيد التحقق' : 'Pending'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Revenue Widget
export function RevenueWidget({ 
  thisMonth = 0, 
  lastMonth = 0,
  growth = 0 
}: { 
  thisMonth?: number; 
  lastMonth?: number;
  growth?: number;
}) {
  const { isRTL } = useLanguage();

  return (
    <Card className="bg-gradient-to-br from-gold/10 to-gold/5 border-gold/20">
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'font-arabic' : ''}`}>
          <TrendingUp className="h-5 w-5 text-gold" />
          {isRTL ? 'الإيرادات' : 'Revenue'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'هذا الشهر' : 'This Month'}
            </p>
            <p className="text-2xl font-bold text-gold">
              {thisMonth.toLocaleString()} SAR
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={growth >= 0 ? 'default' : 'destructive'}>
              {growth >= 0 ? '+' : ''}{growth}%
            </Badge>
            <span className="text-sm text-muted-foreground">
              {isRTL ? 'مقارنة بالشهر الماضي' : 'vs last month'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Services Stats Widget
export function ServicesStatsWidget({ 
  totalServices = 0, 
  activeServices = 0,
  avgRating = 0 
}: { 
  totalServices?: number; 
  activeServices?: number;
  avgRating?: number;
}) {
  const { isRTL } = useLanguage();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'font-arabic' : ''}`}>
          <Package className="h-5 w-5 text-primary" />
          {isRTL ? 'الخدمات' : 'Services'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{totalServices}</p>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'إجمالي' : 'Total'}
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500">{activeServices}</p>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'نشطة' : 'Active'}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-gold fill-gold" />
              <span className="text-lg font-bold">{avgRating.toFixed(1)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'التقييم' : 'Rating'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Company Profile Widget
export function CompanyProfileWidget({ 
  name = '', 
  isVerified = false,
  logoUrl = '' 
}: { 
  name?: string; 
  isVerified?: boolean;
  logoUrl?: string;
}) {
  const { isRTL } = useLanguage();

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
            {logoUrl ? (
              <img src={logoUrl} alt={name} className="h-full w-full object-cover rounded-xl" />
            ) : (
              <Building2 className="h-8 w-8 text-primary" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{name || (isRTL ? 'شركتك' : 'Your Company')}</h3>
            <Badge variant={isVerified ? 'default' : 'secondary'}>
              {isVerified 
                ? (isRTL ? 'موثقة' : 'Verified') 
                : (isRTL ? 'قيد التحقق' : 'Pending Verification')}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
