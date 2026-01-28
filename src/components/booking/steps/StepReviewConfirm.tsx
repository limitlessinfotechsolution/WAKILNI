import { CalendarIcon, User, Briefcase, FileText, Sparkles, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import type { BookingData } from '../BookingWizard';

interface StepReviewConfirmProps {
  data: BookingData;
  onUpdate: (updates: Partial<BookingData>) => void;
}

export function StepReviewConfirm({ data, onUpdate }: StepReviewConfirmProps) {
  const { t, isRTL } = useLanguage();

  const formatPrice = (price: number, currency: string | null) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: currency || 'SAR',
    }).format(price);
  };

  const serviceTypeConfig = {
    umrah: { label: isRTL ? 'عمرة' : 'Umrah', icon: '🕋' },
    hajj: { label: isRTL ? 'حج' : 'Hajj', icon: '🕌' },
    ziyarat: { label: isRTL ? 'زيارة' : 'Ziyarat', icon: '🌙' },
  };

  const statusLabels: Record<string, string> = {
    deceased: isRTL ? 'متوفى' : 'Deceased',
    sick: isRTL ? 'مريض' : 'Sick',
    elderly: isRTL ? 'كبير في السن' : 'Elderly',
    disabled: isRTL ? 'ذو إعاقة' : 'Disabled',
    other: isRTL ? 'أخرى' : 'Other',
  };

  const price = data.service?.price || 0;
  const serviceFee = price * 0.05;
  const total = price + serviceFee;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-medium">
            {isRTL ? 'توكلنا على الله' : 'We place our trust in Allah'}
          </span>
        </div>
        <h2 className="text-2xl font-semibold">
          {isRTL ? 'مراجعة الحجز' : 'Review Your Booking'}
        </h2>
        <p className="text-muted-foreground">
          {isRTL 
            ? 'تأكد من صحة جميع المعلومات قبل المتابعة'
            : 'Make sure all information is correct before proceeding'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Details */}
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary to-primary/50" />
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                <Briefcase className="h-4 w-4" />
              </div>
              {isRTL ? 'تفاصيل الخدمة' : 'Service Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Service Type */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {isRTL ? 'نوع الخدمة' : 'Service Type'}
              </span>
              <Badge variant="secondary" className="gap-1">
                {data.serviceType && serviceTypeConfig[data.serviceType].icon}
                {data.serviceType && serviceTypeConfig[data.serviceType].label}
              </Badge>
            </div>
            
            {data.service && (
              <>
                {/* Service Name */}
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">
                    {isRTL ? 'الخدمة' : 'Service'}
                  </span>
                  <p className="font-medium">
                    {isRTL ? data.service.title_ar || data.service.title : data.service.title}
                  </p>
                </div>
                
                {/* Duration */}
                {data.service.duration_days && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {data.service.duration_days} {isRTL ? 'أيام' : 'days'}
                    </span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Beneficiary Details */}
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-secondary to-secondary/50" />
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-secondary/10 text-secondary-foreground">
                <User className="h-4 w-4" />
              </div>
              {isRTL ? 'المستفيد' : 'Beneficiary'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.beneficiary && (
              <>
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">
                    {t.beneficiaries.fullName}
                  </span>
                  <p className="font-medium">
                    {isRTL && data.beneficiary.full_name_ar 
                      ? data.beneficiary.full_name_ar 
                      : data.beneficiary.full_name}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {t.beneficiaries.status}
                  </span>
                  <Badge variant="outline">
                    {statusLabels[data.beneficiary.status]}
                  </Badge>
                </div>
                
                {data.beneficiary.nationality && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t.beneficiaries.nationality}
                    </span>
                    <span className="font-medium">{data.beneficiary.nationality}</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Date */}
      {data.scheduledDate && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {t.bookings.scheduledDate}
                </p>
                <p className="font-semibold">
                  {format(data.scheduledDate, 'EEEE, d MMMM yyyy', { locale: isRTL ? ar : undefined })}
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Special Requests */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-muted">
              <FileText className="h-4 w-4" />
            </div>
            {t.bookings.specialRequests}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={isRTL 
              ? 'أضف أي طلبات خاصة مثل الدعاء بأسماء معينة، كرسي متحرك، مساعدة طبية، إلخ...'
              : 'Add any special requests such as specific prayers, wheelchair, medical assistance, etc...'}
            value={data.specialRequests}
            onChange={(e) => onUpdate({ specialRequests: e.target.value })}
            rows={3}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Price Summary */}
      <Card className="bg-muted/30">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold">
            {isRTL ? 'ملخص التكلفة' : 'Cost Summary'}
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {isRTL ? data.service?.title_ar || data.service?.title : data.service?.title}
              </span>
              <span>{formatPrice(price, data.service?.currency || null)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {isRTL ? 'رسوم الخدمة (5%)' : 'Service Fee (5%)'}
              </span>
              <span>{formatPrice(serviceFee, data.service?.currency || null)}</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between text-lg font-bold">
            <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
            <span className="text-primary">
              {formatPrice(total, data.service?.currency || null)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Islamic Assurance */}
      <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
        <p className={cn(
          'text-sm text-muted-foreground',
          isRTL && 'font-arabic'
        )}>
          {isRTL 
            ? '✨ "مَنْ دَعَا لِأَخِيهِ بِظَهْرِ الْغَيْبِ قَالَ الْمَلَكُ الْمُوَكَّلُ بِهِ: آمِينَ وَلَكَ بِمِثْلٍ" ✨'
            : '✨ "Whoever prays for his brother in his absence, the angel assigned says: Amen, and may you have the same" ✨'}
        </p>
      </div>
    </div>
  );
}
