import { Building2, Users, TrendingUp, CreditCard, Star, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { WidgetCard } from '@/components/ui/mobile-card';
import { cn } from '@/lib/utils';

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
    <WidgetCard 
      title={isRTL ? 'الاشتراك' : 'Subscription'} 
      icon={<CreditCard />}
      color="purple"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant={isActive ? 'default' : 'destructive'} className="text-[9px] h-5">
            {isActive 
              ? (isRTL ? 'نشط' : 'Active') 
              : (isRTL ? 'منتهي' : 'Expired')}
          </Badge>
          <span className="font-semibold text-xs">
            {isRTL ? planNames[plan]?.ar : planNames[plan]?.en}
          </span>
        </div>
        <div>
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-muted-foreground">
              {isRTL ? 'المتبقي' : 'Remaining'}
            </span>
            <span className="font-medium">{daysRemaining} {isRTL ? 'يوم' : 'days'}</span>
          </div>
          <Progress value={(daysRemaining / 30) * 100} className="h-1.5" />
        </div>
        <Button variant="outline" size="sm" className="w-full h-7 text-[10px]">
          {isRTL ? 'ترقية' : 'Upgrade'}
        </Button>
      </div>
    </WidgetCard>
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
    <WidgetCard 
      title={isRTL ? 'الفريق' : 'Team'} 
      icon={<Users />}
      color="blue"
    >
      <div className="grid grid-cols-3 gap-1 text-center">
        <div>
          <p className="text-base md:text-lg font-bold">{totalProviders}</p>
          <p className="text-[9px] text-muted-foreground">
            {isRTL ? 'الإجمالي' : 'Total'}
          </p>
        </div>
        <div>
          <p className="text-base md:text-lg font-bold text-green-500">{activeProviders}</p>
          <p className="text-[9px] text-muted-foreground">
            {isRTL ? 'نشط' : 'Active'}
          </p>
        </div>
        <div>
          <p className="text-base md:text-lg font-bold text-yellow-500">{pendingVerification}</p>
          <p className="text-[9px] text-muted-foreground">
            {isRTL ? 'قيد التحقق' : 'Pending'}
          </p>
        </div>
      </div>
    </WidgetCard>
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
    <WidgetCard 
      title={isRTL ? 'الإيرادات' : 'Revenue'} 
      icon={<TrendingUp />}
      color="yellow"
    >
      <div className="space-y-2">
        <div>
          <p className="text-[10px] text-muted-foreground">
            {isRTL ? 'هذا الشهر' : 'This Month'}
          </p>
          <p className="text-lg md:text-xl font-bold text-yellow-600">
            {thisMonth.toLocaleString()} <span className="text-[10px]">SAR</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant={growth >= 0 ? 'default' : 'destructive'} className="text-[9px] h-4">
            {growth >= 0 ? '+' : ''}{growth}%
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {isRTL ? 'مقارنة بالماضي' : 'vs last'}
          </span>
        </div>
      </div>
    </WidgetCard>
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
    <WidgetCard 
      title={isRTL ? 'الخدمات' : 'Services'} 
      icon={<Package />}
      color="primary"
    >
      <div className="grid grid-cols-3 gap-1 text-center">
        <div>
          <p className="text-base md:text-lg font-bold">{totalServices}</p>
          <p className="text-[9px] text-muted-foreground">
            {isRTL ? 'إجمالي' : 'Total'}
          </p>
        </div>
        <div>
          <p className="text-base md:text-lg font-bold text-green-500">{activeServices}</p>
          <p className="text-[9px] text-muted-foreground">
            {isRTL ? 'نشطة' : 'Active'}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-0.5">
            <Star className="h-3 w-3 text-gold fill-gold" />
            <span className="text-sm font-bold">{avgRating.toFixed(1)}</span>
          </div>
          <p className="text-[9px] text-muted-foreground">
            {isRTL ? 'التقييم' : 'Rating'}
          </p>
        </div>
      </div>
    </WidgetCard>
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
      <CardContent className="p-3 md:pt-6 md:p-6">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="h-12 w-12 md:h-16 md:w-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt={name} className="h-full w-full object-cover rounded-xl" />
            ) : (
              <Building2 className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className={cn('font-semibold text-base md:text-lg truncate', isRTL && 'font-arabic')}>
              {name || (isRTL ? 'شركتك' : 'Your Company')}
            </h3>
            <Badge 
              variant={isVerified ? 'default' : 'secondary'} 
              className="text-[10px] h-5 mt-0.5"
            >
              {isVerified 
                ? (isRTL ? 'موثقة' : 'Verified') 
                : (isRTL ? 'قيد التحقق' : 'Pending')}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
