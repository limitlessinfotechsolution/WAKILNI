import { Calendar, Info } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AvailabilityManager } from '@/components/provider/AvailabilityManager';
import { useLanguage } from '@/lib/i18n';
import { GlassCard, GlassCardContent } from '@/components/cards/GlassCard';
import { cn } from '@/lib/utils';

export default function AvailabilityPage() {
  const { isRTL } = useLanguage();

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h1 className={cn('text-xl md:text-2xl font-bold', isRTL && 'font-arabic')}>
              {isRTL ? 'إدارة التوفر' : 'Availability Management'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isRTL 
                ? 'حدد أيام عملك، أوقات الحظر، والحد الأقصى للحجوزات اليومية'
                : 'Set your working days, block times, and maximum daily bookings'}
            </p>
          </div>
        </div>

        {/* Availability Manager Component */}
        <AvailabilityManager />

        {/* Quick Tips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-emerald-600 text-lg font-bold">1</span>
              </div>
              <h3 className={cn('font-semibold', isRTL && 'font-arabic')}>
                {isRTL ? 'حدد الأيام' : 'Select Days'}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {isRTL 
                ? 'انقر على أي يوم لتعديل توفره، أو استخدم التحديد المتعدد لتعديل عدة أيام معاً'
                : 'Click any day to edit its availability, or use multi-select to edit multiple days at once'}
            </p>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-600 text-lg font-bold">2</span>
              </div>
              <h3 className={cn('font-semibold', isRTL && 'font-arabic')}>
                {isRTL ? 'حدد الأوقات' : 'Set Times'}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {isRTL 
                ? 'حدد ساعات العمل والحد الأقصى للحجوزات المسموح بها في اليوم'
                : 'Define your working hours and the maximum number of bookings allowed per day'}
            </p>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-amber-600 text-lg font-bold">3</span>
              </div>
              <h3 className={cn('font-semibold', isRTL && 'font-arabic')}>
                {isRTL ? 'حظر الأيام' : 'Block Days'}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {isRTL 
                ? 'قم بإيقاف تشغيل "متاح للحجز" لحظر أي أيام لا تستطيع فيها قبول الحجوزات'
                : 'Toggle off "Available for bookings" to block any days when you cannot accept bookings'}
            </p>
          </GlassCard>
        </div>

        {/* Info Card */}
        <GlassCard variant="gradient" className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Info className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className={cn('font-medium mb-1', isRTL && 'font-arabic')}>
                {isRTL ? 'نصيحة' : 'Pro Tip'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {isRTL 
                  ? 'تأكد من تحديث جدولك بانتظام لتجنب حجوزات في أيام غير متاحة. يمكنك حظر أيام معينة مسبقاً للعطلات أو الالتزامات الشخصية.'
                  : 'Keep your schedule updated regularly to avoid bookings on unavailable days. You can block specific days in advance for holidays or personal commitments.'}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
