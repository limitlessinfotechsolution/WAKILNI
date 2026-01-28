import { useState } from 'react';
import { CreditCard, Lock, CheckCircle, Loader2, Shield, Sparkles, BadgeCheck, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import type { BookingData } from '../BookingWizard';

interface StepPaymentProps {
  data: BookingData;
  onComplete: () => Promise<void>;
  isSubmitting: boolean;
}

export function StepPayment({ data, onComplete, isSubmitting }: StepPaymentProps) {
  const { isRTL } = useLanguage();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const formatPrice = (price: number, currency: string | null) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: currency || 'SAR',
    }).format(price);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const price = data.service?.price || 0;
  const serviceFee = price * 0.05;
  const total = price + serviceFee;

  const isFormValid = cardNumber.length >= 16 && expiryDate.length === 5 && cvv.length === 3 && name.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-primary">
          <Shield className="h-5 w-5" />
          <span className="text-sm font-medium">
            {isRTL ? 'دفع آمن ومشفر' : 'Secure & Encrypted Payment'}
          </span>
        </div>
        <h2 className="text-2xl font-semibold">
          {isRTL ? 'إتمام الدفع' : 'Complete Payment'}
        </h2>
        <p className="text-muted-foreground">
          {isRTL 
            ? 'أدخل بيانات البطاقة لإتمام الحجز'
            : 'Enter your card details to complete the booking'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Form */}
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary to-secondary" />
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                <CreditCard className="h-4 w-4" />
              </div>
              {isRTL ? 'بيانات البطاقة' : 'Card Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardName">
                {isRTL ? 'الاسم على البطاقة' : 'Name on Card'}
              </Label>
              <Input
                id="cardName"
                placeholder={isRTL ? 'الاسم الكامل' : 'Full Name'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">
                {isRTL ? 'رقم البطاقة' : 'Card Number'}
              </Label>
              <Input
                id="cardNumber"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                className="h-11 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">
                  {isRTL ? 'تاريخ الانتهاء' : 'Expiry Date'}
                </Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiry(e.target.value))}
                  maxLength={5}
                  className="h-11 font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  maxLength={3}
                  type="password"
                  className="h-11 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 bg-muted/30 p-3 rounded-lg">
              <Lock className="h-4 w-4 text-primary" />
              <span>
                {isRTL 
                  ? 'معاملتك مؤمنة ومشفرة بأعلى معايير الأمان'
                  : 'Your transaction is secure and encrypted with industry-standard security'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-secondary to-secondary/50" />
          <CardHeader>
            <CardTitle className="text-base">
              {isRTL ? 'ملخص الطلب' : 'Order Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Service Details */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {isRTL ? data.service?.title_ar || data.service?.title : data.service?.title}
                </span>
                <span className="font-medium">
                  {formatPrice(price, data.service?.currency || null)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {isRTL ? 'رسوم الخدمة (5%)' : 'Service Fee (5%)'}
                </span>
                <span className="font-medium">
                  {formatPrice(serviceFee, data.service?.currency || null)}
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
              <span className="text-primary">
                {formatPrice(total, data.service?.currency || null)}
              </span>
            </div>

            {/* Guarantees */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-sm">
                    {isRTL ? 'ضمان استرداد الأموال' : 'Money-back Guarantee'}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {isRTL 
                      ? 'استرداد كامل خلال 7 أيام'
                      : 'Full refund within 7 days'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BadgeCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-sm">
                    {isRTL ? 'إثبات الأداء' : 'Proof of Performance'}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {isRTL 
                      ? 'صور وفيديو للمناسك'
                      : 'Photo & video proof'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-sm">
                    {isRTL ? 'دعم متواصل' : '24/7 Support'}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {isRTL 
                      ? 'فريق دعم على مدار الساعة'
                      : 'Round-the-clock assistance'}
                  </p>
                </div>
              </div>
            </div>

            <Button 
              className="w-full h-12 text-base" 
              size="lg"
              onClick={onComplete}
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="me-2 h-5 w-5 animate-spin" />
                  {isRTL ? 'جاري المعالجة...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Lock className="me-2 h-5 w-5" />
                  {isRTL ? `إتمام الدفع ${formatPrice(total, data.service?.currency || null)}` : `Pay ${formatPrice(total, data.service?.currency || null)}`}
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              {isRTL 
                ? 'هذا عرض تجريبي. لن يتم خصم أي مبالغ فعلية.'
                : 'This is a demo. No actual charges will be made.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trust Banner */}
      <div className="flex flex-wrap justify-center items-center gap-6 pt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          <span>{isRTL ? 'دفع مشفر' : 'Encrypted'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span>PCI DSS</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className={cn(isRTL && 'font-arabic')}>
            {isRTL ? 'بارك الله في صدقاتكم' : 'May Allah bless your charity'}
          </span>
        </div>
      </div>
    </div>
  );
}
