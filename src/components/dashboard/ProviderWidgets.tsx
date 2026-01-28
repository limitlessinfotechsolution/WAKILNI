import { DollarSign, TrendingUp, Calendar, Star, Users, Clock, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/lib/i18n';
import { WidgetCard } from '@/components/ui/mobile-card';

// Earnings Widget
export function EarningsWidget({ total = 0, thisMonth = 0 }: { total?: number; thisMonth?: number }) {
  const { isRTL } = useLanguage();

  return (
    <WidgetCard 
      title={isRTL ? 'الأرباح' : 'Earnings'} 
      icon={<DollarSign />}
      color="yellow"
    >
      <div className="space-y-2">
        <div>
          <p className="text-[10px] text-muted-foreground">
            {isRTL ? 'إجمالي الأرباح' : 'Total'}
          </p>
          <p className="text-lg md:text-xl font-bold text-yellow-600">
            {total.toLocaleString()} <span className="text-[10px]">SAR</span>
          </p>
        </div>
        <div className="pt-1.5 border-t">
          <div className="flex justify-between text-[10px] md:text-xs">
            <span className="text-muted-foreground">
              {isRTL ? 'هذا الشهر' : 'This Month'}
            </span>
            <span className="font-medium">{thisMonth.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}

// Performance Widget
export function PerformanceWidget({ 
  completionRate = 0, 
  responseTime = 0,
  rating = 0 
}: { 
  completionRate?: number; 
  responseTime?: number;
  rating?: number;
}) {
  const { isRTL } = useLanguage();

  return (
    <WidgetCard 
      title={isRTL ? 'الأداء' : 'Performance'} 
      icon={<TrendingUp />}
      color="primary"
    >
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-[10px] mb-1">
            <span>{isRTL ? 'معدل الإكمال' : 'Completion'}</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-1.5" />
        </div>
        <div className="flex justify-between text-[10px]">
          <span>{isRTL ? 'سرعة الاستجابة' : 'Response'}</span>
          <span className="font-medium">{responseTime}h</span>
        </div>
        <div className="flex items-center gap-1.5 pt-1 border-t">
          <Star className="h-3 w-3 text-gold fill-gold" />
          <span className="font-medium text-sm">{rating.toFixed(1)}</span>
          <span className="text-[10px] text-muted-foreground">
            {isRTL ? 'التقييم' : 'Rating'}
          </span>
        </div>
      </div>
    </WidgetCard>
  );
}

// Bookings Overview Widget
export function BookingsOverviewWidget({
  pending = 0,
  inProgress = 0,
  completed = 0,
}: {
  pending?: number;
  inProgress?: number;
  completed?: number;
}) {
  const { isRTL } = useLanguage();

  return (
    <WidgetCard 
      title={isRTL ? 'الحجوزات' : 'Bookings'} 
      icon={<Calendar />}
      color="blue"
    >
      <div className="grid grid-cols-3 gap-1 text-center">
        <div>
          <Clock className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-1 text-yellow-500" />
          <p className="text-base md:text-lg font-bold">{pending}</p>
          <p className="text-[9px] text-muted-foreground">{isRTL ? 'انتظار' : 'Pending'}</p>
        </div>
        <div>
          <Calendar className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-1 text-blue-500" />
          <p className="text-base md:text-lg font-bold">{inProgress}</p>
          <p className="text-[9px] text-muted-foreground">{isRTL ? 'جارٍ' : 'Active'}</p>
        </div>
        <div>
          <CheckCircle className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-1 text-green-500" />
          <p className="text-base md:text-lg font-bold">{completed}</p>
          <p className="text-[9px] text-muted-foreground">{isRTL ? 'مكتمل' : 'Done'}</p>
        </div>
      </div>
    </WidgetCard>
  );
}

// Clients Widget
export function ClientsWidget({ total = 0, returning = 0 }: { total?: number; returning?: number }) {
  const { isRTL } = useLanguage();

  return (
    <WidgetCard 
      title={isRTL ? 'العملاء' : 'Clients'} 
      icon={<Users />}
      color="green"
    >
      <div className="flex justify-between text-center">
        <div>
          <p className="text-lg md:text-xl font-bold">{total}</p>
          <p className="text-[10px] text-muted-foreground">
            {isRTL ? 'إجمالي' : 'Total'}
          </p>
        </div>
        <div>
          <p className="text-lg md:text-xl font-bold">{returning}</p>
          <p className="text-[10px] text-muted-foreground">
            {isRTL ? 'عائدون' : 'Returning'}
          </p>
        </div>
      </div>
    </WidgetCard>
  );
}
