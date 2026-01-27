import { Check, Star, Zap, Crown, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { useVendor } from '@/hooks/useVendor';
import { format, addMonths, isAfter } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    name: { en: 'Basic', ar: 'أساسي' },
    price: 0,
    period: { en: 'Free', ar: 'مجاني' },
    icon: Star,
    features: {
      en: [
        'Up to 5 providers',
        'Up to 10 bookings/month',
        'Basic analytics',
        'Email support',
      ],
      ar: [
        'حتى 5 مقدمي خدمات',
        'حتى 10 حجوزات/شهر',
        'تحليلات أساسية',
        'دعم بالبريد الإلكتروني',
      ],
    },
  },
  {
    id: 'pro',
    name: { en: 'Professional', ar: 'احترافي' },
    price: 499,
    period: { en: '/month', ar: '/شهر' },
    icon: Zap,
    popular: true,
    features: {
      en: [
        'Up to 25 providers',
        'Unlimited bookings',
        'Advanced analytics',
        'Priority support',
        'Auto-routing',
        'Custom branding',
      ],
      ar: [
        'حتى 25 مقدم خدمة',
        'حجوزات غير محدودة',
        'تحليلات متقدمة',
        'دعم أولوية',
        'توجيه تلقائي',
        'علامة تجارية مخصصة',
      ],
    },
  },
  {
    id: 'enterprise',
    name: { en: 'Enterprise', ar: 'مؤسسي' },
    price: 1499,
    period: { en: '/month', ar: '/شهر' },
    icon: Crown,
    features: {
      en: [
        'Unlimited providers',
        'Unlimited bookings',
        'Full analytics suite',
        'Dedicated account manager',
        'API access',
        'White-label solution',
        'SLA guarantee',
      ],
      ar: [
        'مقدمي خدمات غير محدود',
        'حجوزات غير محدودة',
        'مجموعة تحليلات كاملة',
        'مدير حساب مخصص',
        'وصول API',
        'حل العلامة البيضاء',
        'ضمان SLA',
      ],
    },
  },
];

export default function VendorSubscriptionPage() {
  const { isRTL } = useLanguage();
  const { vendor, updateVendor } = useVendor();
  const { toast } = useToast();

  const currentPlan = vendor?.subscription_plan || 'basic';
  const expiresAt = vendor?.subscription_expires_at 
    ? new Date(vendor.subscription_expires_at) 
    : null;
  const isExpired = expiresAt ? !isAfter(expiresAt, new Date()) : false;

  const handleSelectPlan = async (planId: string) => {
    if (planId === currentPlan && !isExpired) {
      toast({
        title: isRTL ? 'الباقة الحالية' : 'Current Plan',
        description: isRTL ? 'أنت مشترك بالفعل في هذه الباقة' : 'You are already on this plan',
      });
      return;
    }

    // Mock subscription - in production would integrate with payment
    const success = await updateVendor({
      subscription_plan: planId,
      subscription_expires_at: addMonths(new Date(), 1).toISOString(),
    });

    if (success) {
      toast({
        title: isRTL ? 'تم التحديث' : 'Plan Updated',
        description: isRTL 
          ? 'تم تحديث باقتك بنجاح'
          : 'Your subscription has been updated successfully',
      });
    }
  };

  return (
    <MainLayout>
      <div className="container py-8 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-3xl md:text-4xl font-bold mb-3 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'خطط الاشتراك' : 'Subscription Plans'}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {isRTL 
              ? 'اختر الباقة المناسبة لنمو أعمالك'
              : 'Choose the right plan to grow your business'}
          </p>
        </div>

        {/* Current Plan Status */}
        {vendor && (
          <Card className="mb-8 max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'الباقة الحالية' : 'Current Plan'}
                  </p>
                  <p className="text-xl font-bold capitalize">{currentPlan}</p>
                  {expiresAt && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" />
                      {isExpired 
                        ? (isRTL ? 'انتهت في' : 'Expired on') 
                        : (isRTL ? 'تنتهي في' : 'Expires on')}: {format(expiresAt, 'PPP')}
                    </p>
                  )}
                </div>
                {isExpired && (
                  <Badge variant="destructive">
                    {isRTL ? 'منتهية' : 'Expired'}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentPlan === plan.id && !isExpired;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    {isRTL ? 'الأكثر شعبية' : 'Most Popular'}
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">
                    {isRTL ? plan.name.ar : plan.name.en}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      {plan.price === 0 ? (isRTL ? 'مجاني' : 'Free') : `${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground">
                        {' '}{isRTL ? 'ر.س' : 'SAR'}{isRTL ? plan.period.ar : plan.period.en}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(isRTL ? plan.features.ar : plan.features.en).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? 'default' : 'outline'}
                    disabled={isCurrentPlan}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {isCurrentPlan 
                      ? (isRTL ? 'الباقة الحالية' : 'Current Plan')
                      : (isRTL ? 'اختر الباقة' : 'Select Plan')}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ or Contact */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            {isRTL 
              ? 'هل تحتاج مساعدة في اختيار الباقة المناسبة؟'
              : 'Need help choosing the right plan?'}
          </p>
          <Button variant="link" className="mt-2">
            {isRTL ? 'تواصل معنا' : 'Contact Us'}
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
