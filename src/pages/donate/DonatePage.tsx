import { useState, useEffect, useRef } from 'react';
import { Heart, CreditCard, Building2, Wallet, Check, Gift, Users, Sparkles, Star, Moon, Calculator, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainLayout, DashboardLayout } from '@/components/layout';
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/cards/GlassCard';
import { useLanguage } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000, 5000];

// Default stats - will be replaced by real data
const DEFAULT_CHARITY_STATS = {
  totalRaised: 0,
  goal: 500000,
  beneficiariesHelped: 0,
  activeRequests: 0,
};

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = null;
    countRef.current = 0;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      countRef.current = Math.floor(target * easeOutQuart);
      setCount(countRef.current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return count;
}

export default function DonatePage() {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  const [amount, setAmount] = useState<number | ''>('');
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState(profile?.full_name || '');
  const [donorEmail, setDonorEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [activeTab, setActiveTab] = useState('donate');
  const [charityStats, setCharityStats] = useState(DEFAULT_CHARITY_STATS);
  
  // Zakat calculator state
  const [wealth, setWealth] = useState<number>(0);
  const zakatAmount = wealth * 0.025; // 2.5% Zakat

  // Fetch real donation stats
  useEffect(() => {
    const fetchStats = async () => {
      const [donationsRes, requestsRes, fulfilledRes] = await Promise.all([
        supabase.from('donations').select('amount').eq('payment_status', 'completed'),
        supabase.from('charity_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('charity_requests').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      ]);
      const totalRaised = donationsRes.data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
      setCharityStats({
        totalRaised,
        goal: DEFAULT_CHARITY_STATS.goal,
        beneficiariesHelped: fulfilledRes.count || 0,
        activeRequests: requestsRes.count || 0,
      });
    };
    fetchStats();
  }, []);

  // Animated counters
  const animatedTotal = useAnimatedCounter(charityStats.totalRaised);
  const animatedBeneficiaries = useAnimatedCounter(charityStats.beneficiariesHelped);
  const animatedRequests = useAnimatedCounter(charityStats.activeRequests);

  // Conditional layout based on auth status
  const Layout = user ? DashboardLayout : MainLayout;

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setAmount(numValue);
    } else {
      setAmount('');
    }
  };

  const handleUseZakatAmount = () => {
    if (zakatAmount > 0) {
      setAmount(zakatAmount);
      setCustomAmount(zakatAmount.toString());
      setActiveTab('donate');
      toast({
        title: isRTL ? 'تم تطبيق مبلغ الزكاة' : 'Zakat amount applied',
        description: isRTL 
          ? `تم تعيين مبلغ التبرع إلى ${zakatAmount.toLocaleString()} ريال`
          : `Donation amount set to SAR ${zakatAmount.toLocaleString()}`,
      });
    }
  };

  const handleSubmit = async () => {
    if (!amount || amount <= 0) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'يرجى إدخال مبلغ صحيح' : 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('donations').insert({
        donor_id: user?.id || null,
        donor_name: isAnonymous ? null : donorName,
        donor_email: isAnonymous ? null : donorEmail,
        amount: amount,
        currency: 'SAR',
        payment_method: paymentMethod,
        payment_status: 'completed',
        is_anonymous: isAnonymous,
        message: message || null,
        allocated_amount: 0,
        remaining_amount: amount,
      });

      if (error) throw error;

      setIsComplete(true);
      toast({
        title: isRTL ? 'شكراً لتبرعك!' : 'Thank you for your donation!',
        description: isRTL 
          ? 'سيتم استخدام تبرعك لمساعدة المحتاجين على أداء فريضة الحج والعمرة'
          : 'Your donation will help those in need perform Hajj and Umrah',
      });
    } catch (error) {
      console.error('Donation error:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'حدث خطأ أثناء معالجة تبرعك' : 'An error occurred while processing your donation',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = Math.min((charityStats.totalRaised / charityStats.goal) * 100, 100);

  if (isComplete) {
    return (
      <Layout>
        <div className="container max-w-2xl py-16 px-4">
          <GlassCard glow className="text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
            <GlassCardContent className="pt-12 pb-12 relative">
              <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 shadow-lg animate-scale-in">
                <Check className="h-12 w-12 text-white" />
              </div>
              <h1 className={cn('text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent', isRTL && 'font-arabic')}>
                {isRTL ? 'جزاك الله خيراً!' : 'Jazak Allah Khair!'}
              </h1>
              <p className="text-muted-foreground text-lg mb-2">
                {isRTL 
                  ? `تم استلام تبرعك بمبلغ ${amount} ريال سعودي بنجاح`
                  : `Your donation of SAR ${amount} has been received successfully`}
              </p>
              {isRecurring && (
                <p className="text-primary font-medium mb-2">
                  {isRTL ? 'تبرع شهري متكرر' : 'Monthly recurring donation'}
                </p>
              )}
              <p className="text-muted-foreground mb-8">
                {isRTL 
                  ? 'سيتم استخدام تبرعك لمساعدة المحتاجين على أداء مناسك الحج والعمرة'
                  : 'Your contribution will help those in need perform Hajj and Umrah'}
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => setIsComplete(false)} className="bg-gradient-to-r from-primary to-secondary">
                  <Heart className="h-4 w-4 me-2" />
                  {isRTL ? 'تبرع مرة أخرى' : 'Donate Again'}
                </Button>
                <Button variant="outline" asChild>
                  <a href="/">{isRTL ? 'العودة للرئيسية' : 'Back to Home'}</a>
                </Button>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-6xl py-8 md:py-12 px-4">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary text-white mb-6 shadow-lg">
            <Moon className="h-10 w-10" />
          </div>
          <h1 className={cn('text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent', isRTL && 'font-arabic')}>
            {isRTL ? 'صدقة جارية' : 'Sadaqah Jariyah'}
          </h1>
          <p className={cn('text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed', isRTL && 'font-arabic')}>
            {isRTL 
              ? 'ساهم في مساعدة المحتاجين على أداء فريضة الحج والعمرة. تبرعك سيُحدث فرقاً كبيراً في حياتهم'
              : 'Help those in need fulfill their religious obligation. Your donation will make a significant difference in their lives'}
          </p>
        </div>

        {/* Stats Cards with Animated Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
          <GlassCard glow hoverable className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <GlassCardContent className="pt-4 md:pt-6 text-center">
              <Heart className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
              <p className="text-xl md:text-2xl font-bold text-primary tabular-nums">
                {animatedTotal.toLocaleString()}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">
                {isRTL ? 'ر.س تم جمعها' : 'SAR Raised'}
              </p>
            </GlassCardContent>
          </GlassCard>
          <GlassCard glow hoverable className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <GlassCardContent className="pt-4 md:pt-6 text-center">
              <Users className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-secondary" />
              <p className="text-xl md:text-2xl font-bold text-secondary tabular-nums">
                {animatedBeneficiaries}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">
                {isRTL ? 'مستفيد' : 'Helped'}
              </p>
            </GlassCardContent>
          </GlassCard>
          <GlassCard glow hoverable className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <GlassCardContent className="pt-4 md:pt-6 text-center">
              <Star className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-accent" />
              <p className="text-xl md:text-2xl font-bold text-accent tabular-nums">
                {animatedRequests}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">
                {isRTL ? 'طلب نشط' : 'Active Requests'}
              </p>
            </GlassCardContent>
          </GlassCard>
          <GlassCard glow hoverable className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <GlassCardContent className="pt-4 md:pt-6 text-center">
              <Sparkles className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-purple-500" />
              <p className="text-xl md:text-2xl font-bold text-purple-500">
                {progressPercentage.toFixed(0)}%
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">
                {isRTL ? 'من الهدف' : 'of Goal'}
              </p>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Progress Bar */}
        <GlassCard className="mb-8">
          <GlassCardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">
                {isRTL ? 'التقدم نحو الهدف' : 'Progress to Goal'}
              </span>
              <span className="text-sm text-muted-foreground">
                {charityStats.totalRaised.toLocaleString()} / {charityStats.goal.toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </GlassCardContent>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Donation Form with Tabs */}
          <div className="lg:col-span-2">
            <GlassCard>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <GlassCardHeader>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="donate" className="flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      {isRTL ? 'تبرع' : 'Donate'}
                    </TabsTrigger>
                    <TabsTrigger value="zakat" className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      {isRTL ? 'حاسبة الزكاة' : 'Zakat Calculator'}
                    </TabsTrigger>
                  </TabsList>
                </GlassCardHeader>

                <GlassCardContent className="space-y-6">
                  {/* Zakat Calculator Tab */}
                  <TabsContent value="zakat" className="mt-0 space-y-6">
                    <div>
                      <CardTitle className={cn('text-lg mb-2', isRTL && 'font-arabic')}>
                        {isRTL ? 'احسب زكاتك' : 'Calculate Your Zakat'}
                      </CardTitle>
                      <CardDescription>
                        {isRTL 
                          ? 'أدخل إجمالي ثروتك لحساب الزكاة المستحقة (2.5%)'
                          : 'Enter your total wealth to calculate Zakat due (2.5%)'}
                      </CardDescription>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-base">{isRTL ? 'إجمالي الثروة' : 'Total Wealth'}</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder={isRTL ? 'أدخل إجمالي ثروتك...' : 'Enter your total wealth...'}
                            value={wealth || ''}
                            onChange={(e) => setWealth(parseFloat(e.target.value) || 0)}
                            className="h-12 text-lg ps-16"
                          />
                          <span className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                            {isRTL ? 'ر.س' : 'SAR'}
                          </span>
                        </div>
                      </div>

                      <GlassCard variant="gradient" className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            {isRTL ? 'الزكاة المستحقة (2.5%)' : 'Zakat Due (2.5%)'}
                          </span>
                          <span className="text-2xl font-bold text-primary">
                            {zakatAmount.toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}
                          </span>
                        </div>
                      </GlassCard>

                      <Button 
                        onClick={handleUseZakatAmount}
                        disabled={zakatAmount <= 0}
                        className="w-full bg-gradient-to-r from-primary to-secondary"
                      >
                        <Gift className="h-4 w-4 me-2" />
                        {isRTL ? 'استخدم هذا المبلغ للتبرع' : 'Use This Amount to Donate'}
                      </Button>

                      <p className="text-sm text-muted-foreground text-center">
                        {isRTL 
                          ? 'ملاحظة: هذه الحاسبة للإرشاد فقط. يرجى استشارة عالم للحصول على فتوى دقيقة.'
                          : 'Note: This calculator is for guidance only. Please consult a scholar for an accurate ruling.'}
                      </p>
                    </div>
                  </TabsContent>

                  {/* Donate Tab */}
                  <TabsContent value="donate" className="mt-0 space-y-6">
                    {/* Preset Amounts */}
                    <div>
                      <Label className="text-base mb-3 block">{isRTL ? 'اختر مبلغاً' : 'Select Amount'}</Label>
                      <div className="grid grid-cols-3 gap-2 md:gap-3">
                        {PRESET_AMOUNTS.map((preset) => (
                          <Button
                            key={preset}
                            variant={amount === preset ? 'default' : 'outline'}
                            className={cn(
                              'h-12 md:h-14 text-base md:text-lg font-semibold transition-all',
                              amount === preset && 'ring-2 ring-primary ring-offset-2'
                            )}
                            onClick={() => handleAmountSelect(preset)}
                          >
                            {preset} {isRTL ? 'ر.س' : 'SAR'}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Amount */}
                    <div className="space-y-2">
                      <Label className="text-base">{isRTL ? 'مبلغ مخصص' : 'Custom Amount'}</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder={isRTL ? 'أدخل مبلغاً...' : 'Enter amount...'}
                          value={customAmount}
                          onChange={(e) => handleCustomAmountChange(e.target.value)}
                          className="h-12 text-lg ps-16"
                        />
                        <span className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                          {isRTL ? 'ر.س' : 'SAR'}
                        </span>
                      </div>
                    </div>

                    {/* Recurring Donation Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-lg border-2 border-dashed">
                      <div className="flex items-center gap-3">
                        <RefreshCw className={cn('h-5 w-5', isRecurring ? 'text-primary' : 'text-muted-foreground')} />
                        <div>
                          <Label className="cursor-pointer" htmlFor="recurring">
                            {isRTL ? 'تبرع شهري متكرر' : 'Monthly Recurring Donation'}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {isRTL ? 'تبرع تلقائياً كل شهر' : 'Automatically donate every month'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="recurring"
                        checked={isRecurring}
                        onCheckedChange={setIsRecurring}
                      />
                    </div>

                    {/* Donor Info */}
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox 
                          id="anonymous" 
                          checked={isAnonymous}
                          onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                        />
                        <Label htmlFor="anonymous" className="cursor-pointer">
                          {isRTL ? 'تبرع بشكل مجهول' : 'Donate anonymously'}
                        </Label>
                      </div>

                      {!isAnonymous && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{isRTL ? 'الاسم' : 'Name'}</Label>
                            <Input
                              value={donorName}
                              onChange={(e) => setDonorName(e.target.value)}
                              placeholder={isRTL ? 'اسمك الكريم' : 'Your name'}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label>
                            <Input
                              type="email"
                              value={donorEmail}
                              onChange={(e) => setDonorEmail(e.target.value)}
                              placeholder={isRTL ? 'بريدك الإلكتروني' : 'Your email'}
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>{isRTL ? 'رسالة (اختياري)' : 'Message (optional)'}</Label>
                        <Textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={isRTL ? 'أضف رسالة أو دعاء...' : 'Add a message or prayer...'}
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-4 pt-4 border-t">
                      <Label className="text-base font-semibold">
                        {isRTL ? 'طريقة الدفع' : 'Payment Method'}
                      </Label>
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Label
                            htmlFor="card"
                            className={cn(
                              'flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all',
                              paymentMethod === 'card' ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2' : 'hover:bg-muted/50'
                            )}
                          >
                            <RadioGroupItem value="card" id="card" />
                            <CreditCard className="h-5 w-5" />
                            <span>{isRTL ? 'بطاقة ائتمان' : 'Credit Card'}</span>
                          </Label>
                          <Label
                            htmlFor="bank"
                            className={cn(
                              'flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all',
                              paymentMethod === 'bank' ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2' : 'hover:bg-muted/50'
                            )}
                          >
                            <RadioGroupItem value="bank" id="bank" />
                            <Building2 className="h-5 w-5" />
                            <span>{isRTL ? 'تحويل بنكي' : 'Bank Transfer'}</span>
                          </Label>
                          <Label
                            htmlFor="wallet"
                            className={cn(
                              'flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all',
                              paymentMethod === 'wallet' ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2' : 'hover:bg-muted/50'
                            )}
                          >
                            <RadioGroupItem value="wallet" id="wallet" />
                            <Wallet className="h-5 w-5" />
                            <span>{isRTL ? 'محفظة رقمية' : 'Digital Wallet'}</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      size="lg" 
                      className="w-full h-14 text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                      disabled={!amount || amount <= 0 || isSubmitting}
                      onClick={handleSubmit}
                    >
                      {isSubmitting ? (
                        isRTL ? 'جاري المعالجة...' : 'Processing...'
                      ) : (
                        <>
                          <Heart className="h-5 w-5 me-2" />
                          {isRTL 
                            ? `تبرع بمبلغ ${amount || 0} ر.س${isRecurring ? ' شهرياً' : ''}`
                            : `Donate SAR ${amount || 0}${isRecurring ? '/month' : ''}`}
                        </>
                      )}
                    </Button>
                  </TabsContent>
                </GlassCardContent>
              </Tabs>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <GlassCard glow className="bg-gradient-to-br from-primary/5 to-secondary/5">
              <GlassCardHeader>
                <CardTitle className={cn('text-lg flex items-center gap-2', isRTL && 'font-arabic')}>
                  <Sparkles className="h-5 w-5 text-primary" />
                  {isRTL ? 'أثر تبرعك' : 'Your Impact'}
                </CardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/60">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {isRTL ? '50 ر.س' : 'SAR 50'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? 'يساهم في تكاليف النقل' : 'Contributes to transport costs'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/60">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-secondary font-bold text-sm">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {isRTL ? '250 ر.س' : 'SAR 250'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? 'يغطي تكاليف عمرة واحدة' : 'Covers one Umrah service'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-background/60">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-accent font-bold text-sm">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {isRTL ? '1000 ر.س' : 'SAR 1000'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? 'يغطي خدمة حج كاملة' : 'Covers a complete Hajj service'}
                    </p>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>

            <GlassCard>
              <GlassCardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">{isRTL ? 'وعد الشفافية' : 'Transparency Promise'}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isRTL 
                    ? 'جميع التبرعات تُخصص لمساعدة المحتاجين على أداء فريضة الحج والعمرة. نضمن الشفافية الكاملة في توزيع التبرعات.'
                    : 'All donations are allocated to help those in need perform Hajj and Umrah. We ensure complete transparency in fund distribution.'}
                </p>
              </GlassCardContent>
            </GlassCard>
          </div>
        </div>
      </div>
    </Layout>
  );
}
