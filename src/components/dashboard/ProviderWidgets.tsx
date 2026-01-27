import { DollarSign, TrendingUp, Calendar, Star, Users, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/lib/i18n';

// Earnings Widget
export function EarningsWidget({ total = 0, thisMonth = 0 }: { total?: number; thisMonth?: number }) {
  const { isRTL } = useLanguage();

  return (
    <Card className="bg-gradient-to-br from-gold/10 to-gold/5 border-gold/20">
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'font-arabic' : ''}`}>
          <DollarSign className="h-5 w-5 text-gold" />
          {isRTL ? 'الأرباح' : 'Earnings'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'إجمالي الأرباح' : 'Total Earnings'}
            </p>
            <p className="text-2xl font-bold text-gold">
              {total.toLocaleString()} SAR
            </p>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {isRTL ? 'هذا الشهر' : 'This Month'}
              </span>
              <span className="font-medium">{thisMonth.toLocaleString()} SAR</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'font-arabic' : ''}`}>
          <TrendingUp className="h-5 w-5 text-primary" />
          {isRTL ? 'الأداء' : 'Performance'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>{isRTL ? 'معدل الإكمال' : 'Completion Rate'}</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>{isRTL ? 'سرعة الاستجابة' : 'Response Time'}</span>
            <span className="font-medium">{responseTime}h avg</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-gold fill-gold" />
          <span className="font-medium">{rating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">
            {isRTL ? 'التقييم' : 'Rating'}
          </span>
        </div>
      </CardContent>
    </Card>
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

  const stats = [
    { 
      label: isRTL ? 'قيد الانتظار' : 'Pending', 
      value: pending, 
      icon: Clock, 
      color: 'text-yellow-500' 
    },
    { 
      label: isRTL ? 'قيد التنفيذ' : 'In Progress', 
      value: inProgress, 
      icon: Calendar, 
      color: 'text-blue-500' 
    },
    { 
      label: isRTL ? 'مكتملة' : 'Completed', 
      value: completed, 
      icon: CheckCircle, 
      color: 'text-green-500' 
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'font-arabic' : ''}`}>
          <Calendar className="h-5 w-5 text-primary" />
          {isRTL ? 'نظرة على الحجوزات' : 'Bookings Overview'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Clients Widget
export function ClientsWidget({ total = 0, returning = 0 }: { total?: number; returning?: number }) {
  const { isRTL } = useLanguage();

  return (
    <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'font-arabic' : ''}`}>
          <Users className="h-5 w-5 text-accent" />
          {isRTL ? 'العملاء' : 'Clients'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          <div className="text-center">
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'إجمالي' : 'Total'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{returning}</p>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'عائدون' : 'Returning'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
