import { CalendarIcon, User, Briefcase, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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

  const serviceTypeLabels = {
    umrah: isRTL ? 'عمرة' : 'Umrah',
    hajj: isRTL ? 'حج' : 'Hajj',
    ziyarat: isRTL ? 'زيارة' : 'Ziyarat',
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">
          {isRTL ? 'مراجعة الحجز' : 'Review Your Booking'}
        </h2>
        <p className="text-muted-foreground">
          {isRTL 
            ? 'تأكد من صحة جميع المعلومات قبل المتابعة'
            : 'Make sure all information is correct before proceeding'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              {isRTL ? 'تفاصيل الخدمة' : 'Service Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'نوع الخدمة' : 'Service Type'}
              </p>
              <Badge variant="secondary">
                {data.serviceType && serviceTypeLabels[data.serviceType]}
              </Badge>
            </div>
            {data.service && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'الخدمة' : 'Service'}
                  </p>
                  <p className="font-medium">
                    {isRTL ? data.service.title_ar || data.service.title : data.service.title}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t.services.price}
                  </p>
                  <p className="font-semibold text-primary">
                    {formatPrice(data.service.price, data.service.currency)}
                  </p>
                </div>
                {data.service.duration_days && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t.services.duration}
                    </p>
                    <p className="font-medium">
                      {data.service.duration_days} {isRTL ? 'أيام' : 'days'}
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Beneficiary Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              {isRTL ? 'المستفيد' : 'Beneficiary'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.beneficiary && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t.beneficiaries.fullName}
                  </p>
                  <p className="font-medium">
                    {isRTL && data.beneficiary.full_name_ar 
                      ? data.beneficiary.full_name_ar 
                      : data.beneficiary.full_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t.beneficiaries.status}
                  </p>
                  <Badge variant="outline">
                    {t.beneficiaries[data.beneficiary.status as keyof typeof t.beneficiaries]}
                  </Badge>
                </div>
                {data.beneficiary.nationality && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t.beneficiaries.nationality}
                    </p>
                    <p className="font-medium">{data.beneficiary.nationality}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Date */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            {t.bookings.scheduledDate}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full md:w-auto justify-start text-start font-normal',
                  !data.scheduledDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="me-2 h-4 w-4" />
                {data.scheduledDate ? (
                  format(data.scheduledDate, 'PPP')
                ) : (
                  <span>{isRTL ? 'اختر التاريخ (اختياري)' : 'Pick a date (optional)'}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={data.scheduledDate || undefined}
                onSelect={(date) => onUpdate({ scheduledDate: date || null })}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Special Requests */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t.bookings.specialRequests}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={isRTL 
              ? 'أضف أي طلبات خاصة مثل كرسي متحرك، مساعدة طبية، إلخ...'
              : 'Add any special requests such as wheelchair, medical assistance, etc...'}
            value={data.specialRequests}
            onChange={(e) => onUpdate({ specialRequests: e.target.value })}
            rows={3}
          />
        </CardContent>
      </Card>
    </div>
  );
}
