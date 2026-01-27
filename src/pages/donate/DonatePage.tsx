import { useState } from 'react';
import { Heart, CreditCard, Building2, Wallet, Check, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MainLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000, 5000];

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
      // Create donation record (mock payment - in production would integrate with Stripe)
      const { error } = await supabase.from('donations').insert({
        donor_id: user?.id || null,
        donor_name: isAnonymous ? null : donorName,
        donor_email: isAnonymous ? null : donorEmail,
        amount: amount,
        currency: 'SAR',
        payment_method: paymentMethod,
        payment_status: 'completed', // Mock - would be 'pending' until payment confirmed
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

  if (isComplete) {
    return (
      <MainLayout>
        <div className="container max-w-2xl py-16 px-4">
          <Card className="text-center">
            <CardContent className="pt-12 pb-12">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <h1 className={`text-3xl font-bold mb-4 ${isRTL ? 'font-arabic' : ''}`}>
                {isRTL ? 'جزاك الله خيراً!' : 'Jazak Allah Khair!'}
              </h1>
              <p className="text-muted-foreground text-lg mb-2">
                {isRTL 
                  ? `تم استلام تبرعك بمبلغ ${amount} ريال سعودي بنجاح`
                  : `Your donation of SAR ${amount} has been received successfully`}
              </p>
              <p className="text-muted-foreground mb-8">
                {isRTL 
                  ? 'سيتم استخدام تبرعك لمساعدة المحتاجين على أداء مناسك الحج والعمرة'
                  : 'Your contribution will help those in need perform Hajj and Umrah'}
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => setIsComplete(false)}>
                  {isRTL ? 'تبرع مرة أخرى' : 'Donate Again'}
                </Button>
                <Button variant="outline" asChild>
                  <a href="/">{isRTL ? 'العودة للرئيسية' : 'Back to Home'}</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-4xl py-12 px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <Heart className="h-8 w-8" />
          </div>
          <h1 className={`text-3xl md:text-4xl font-bold mb-3 ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'تبرع لصندوق الحج والعمرة' : 'Donate to Hajj & Umrah Fund'}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {isRTL 
              ? 'ساهم في مساعدة المحتاجين على أداء فريضة الحج والعمرة. تبرعك سيُحدث فرقاً كبيراً في حياتهم'
              : 'Help those in need fulfill their religious obligation. Your donation will make a significant difference in their lives'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donation Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className={isRTL ? 'font-arabic' : ''}>
                  {isRTL ? 'مبلغ التبرع' : 'Donation Amount'}
                </CardTitle>
                <CardDescription>
                  {isRTL ? 'اختر مبلغ التبرع أو أدخل مبلغاً مخصصاً' : 'Select an amount or enter a custom value'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preset Amounts */}
                <div className="grid grid-cols-3 gap-3">
                  {PRESET_AMOUNTS.map((preset) => (
                    <Button
                      key={preset}
                      variant={amount === preset ? 'default' : 'outline'}
                      className="h-14 text-lg font-semibold"
                      onClick={() => handleAmountSelect(preset)}
                    >
                      {preset} {isRTL ? 'ر.س' : 'SAR'}
                    </Button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="space-y-2">
                  <Label>{isRTL ? 'مبلغ مخصص' : 'Custom Amount'}</Label>
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
                        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                      >
                        <RadioGroupItem value="card" id="card" />
                        <CreditCard className="h-5 w-5" />
                        <span>{isRTL ? 'بطاقة ائتمان' : 'Credit Card'}</span>
                      </Label>
                      <Label
                        htmlFor="bank"
                        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === 'bank' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                      >
                        <RadioGroupItem value="bank" id="bank" />
                        <Building2 className="h-5 w-5" />
                        <span>{isRTL ? 'تحويل بنكي' : 'Bank Transfer'}</span>
                      </Label>
                      <Label
                        htmlFor="wallet"
                        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === 'wallet' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
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
                  className="w-full h-14 text-lg"
                  disabled={!amount || amount <= 0 || isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    isRTL ? 'جاري المعالجة...' : 'Processing...'
                  ) : (
                    <>
                      <Heart className="h-5 w-5 me-2" />
                      {isRTL ? `تبرع بمبلغ ${amount || 0} ر.س` : `Donate SAR ${amount || 0}`}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className={`text-lg ${isRTL ? 'font-arabic' : ''}`}>
                  <Gift className="h-5 w-5 inline-block me-2" />
                  {isRTL ? 'أثر تبرعك' : 'Your Impact'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
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
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">2</span>
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
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">3</span>
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
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isRTL 
                    ? 'جميع التبرعات تُخصص لمساعدة المحتاجين على أداء فريضة الحج والعمرة. نضمن الشفافية الكاملة في توزيع التبرعات.'
                    : 'All donations are allocated to help those in need perform Hajj and Umrah. We ensure complete transparency in fund distribution.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
