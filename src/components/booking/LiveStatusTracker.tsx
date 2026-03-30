import { Check, Clock, Loader2, Star, AlertCircle, Building2, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { BookingStatusInfo } from '@/hooks/useBookingStatus';

interface LiveStatusTrackerProps {
  booking: BookingStatusInfo;
  onReviewClick?: () => void;
  onDownloadCertificate?: () => void;
  onDownloadInvoice?: () => void;
}

const STATUS_CONFIG: Record<string, { icon: any; color: string; bgColor: string; borderColor: string }> = {
  pending: { icon: Clock, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500' },
  assigned_to_vendor: { icon: Building2, color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500' },
  assigned_to_provider: { icon: UserCheck, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500' },
  accepted: { icon: Check, color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500' },
  in_progress: { icon: Loader2, color: 'text-primary', bgColor: 'bg-primary/10', borderColor: 'border-primary' },
  completed: { icon: Star, color: 'text-green-500', bgColor: 'bg-green-500/10', borderColor: 'border-green-500' },
  cancelled: { icon: AlertCircle, color: 'text-destructive', bgColor: 'bg-destructive/10', borderColor: 'border-destructive' },
  disputed: { icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500' },
};

const STEPS = [
  { key: 'pending', labelEn: 'Pending', labelAr: 'قيد الانتظار' },
  { key: 'assigned_to_vendor', labelEn: 'Vendor', labelAr: 'الوكيل' },
  { key: 'assigned_to_provider', labelEn: 'Provider', labelAr: 'المزود' },
  { key: 'in_progress', labelEn: 'In Progress', labelAr: 'قيد التنفيذ' },
  { key: 'completed', labelEn: 'Completed', labelAr: 'مكتمل' },
];

export function LiveStatusTracker({
  booking, onReviewClick, onDownloadCertificate, onDownloadInvoice,
}: LiveStatusTrackerProps) {
  const { isRTL } = useLanguage();
  const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const StatusIcon = config.icon;
  const currentStepIndex = STEPS.findIndex(s => s.key === booking.status);

  return (
    <Card className={cn('border-2', config.borderColor)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={cn('text-lg flex items-center gap-2', isRTL && 'font-arabic')}>
            <div className={cn('p-2 rounded-full', config.bgColor)}>
              <StatusIcon className={cn('h-5 w-5', config.color, booking.status === 'in_progress' && 'animate-spin')} />
            </div>
            {booking.service_title}
          </CardTitle>
          <Badge variant="outline" className={cn(config.color)}>
            {isRTL ? STEPS.find(s => s.key === booking.status)?.labelAr : STEPS.find(s => s.key === booking.status)?.labelEn}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{isRTL ? 'التقدم' : 'Progress'}</span>
            <span className="font-medium">{booking.progress_percentage}%</span>
          </div>
          <Progress value={booking.progress_percentage} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="relative">
          <div className="flex justify-between items-center">
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const StepIcon = isCurrent ? config.icon : Check;

              return (
                <div key={step.key} className="flex flex-col items-center z-10">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                    isCompleted && 'bg-green-500 border-green-500 text-white',
                    isCurrent && cn(config.bgColor, config.borderColor, config.color),
                    !isCompleted && !isCurrent && 'bg-muted border-muted-foreground/30 text-muted-foreground'
                  )}>
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : isCurrent ? (
                      <StepIcon className={cn('h-5 w-5', step.key === 'in_progress' && 'animate-spin')} />
                    ) : (
                      <span className="text-sm">{index + 1}</span>
                    )}
                  </div>
                  <span className={cn(
                    'text-xs mt-2 text-center max-w-[60px]',
                    isCurrent ? 'font-medium' : 'text-muted-foreground',
                    isRTL && 'font-arabic'
                  )}>
                    {isRTL ? step.labelAr : step.labelEn}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted -z-0">
            <div 
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          {booking.beneficiary_name && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">{isRTL ? 'المستفيد' : 'Beneficiary'}</p>
              <p className="text-sm font-medium">{booking.beneficiary_name}</p>
            </div>
          )}
          {booking.provider_name && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">{isRTL ? 'المزود' : 'Provider'}</p>
              <p className="text-sm font-medium">{booking.provider_name}</p>
            </div>
          )}
          {booking.scheduled_date && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">{isRTL ? 'التاريخ' : 'Scheduled Date'}</p>
              <p className="text-sm font-medium">{new Date(booking.scheduled_date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</p>
            </div>
          )}
          {booking.total_amount && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">{isRTL ? 'المبلغ' : 'Amount'}</p>
              <p className="text-sm font-medium">{booking.total_amount.toLocaleString()} SAR</p>
            </div>
          )}
        </div>

        {booking.next_action && (
          <div className={cn('p-3 rounded-lg', config.bgColor)}>
            <p className={cn('text-sm', config.color, isRTL && 'font-arabic')}>{booking.next_action}</p>
          </div>
        )}

        {booking.status === 'completed' && (
          <div className="flex flex-wrap gap-2 pt-2">
            {onReviewClick && <Button size="sm" onClick={onReviewClick}><Star className="h-4 w-4 me-2" />{isRTL ? 'ترك تقييم' : 'Leave Review'}</Button>}
            {onDownloadCertificate && <Button size="sm" variant="outline" onClick={onDownloadCertificate}>{isRTL ? 'تحميل الشهادة' : 'Download Certificate'}</Button>}
            {onDownloadInvoice && <Button size="sm" variant="outline" onClick={onDownloadInvoice}>{isRTL ? 'تحميل الفاتورة' : 'Download Invoice'}</Button>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
