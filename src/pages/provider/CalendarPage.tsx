import { useState } from 'react';
import { Calendar, Maximize2, Minimize2, Info } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BookingCalendarView } from '@/components/provider/BookingCalendarView';
import { useLanguage } from '@/lib/i18n';
import { useProviderBookings } from '@/hooks/useProviderBookings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard, GlassCardContent } from '@/components/cards/GlassCard';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const { isRTL } = useLanguage();
  const { bookings } = useProviderBookings();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Calculate quick stats
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const acceptedCount = bookings.filter(b => b.status === 'accepted').length;
  const inProgressCount = bookings.filter(b => b.status === 'in_progress').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  const CalendarContent = () => (
    <div className={cn('space-y-4', isFullscreen && 'h-full')}>
      <BookingCalendarView />
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className={cn('text-xl font-bold flex items-center gap-2', isRTL && 'font-arabic')}>
            <Calendar className="h-5 w-5 text-primary" />
            {isRTL ? 'التقويم' : 'Calendar'}
          </h1>
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(false)}>
            <Minimize2 className="h-4 w-4 me-2" />
            {isRTL ? 'إنهاء وضع ملء الشاشة' : 'Exit Fullscreen'}
          </Button>
        </div>
        <div className="h-[calc(100vh-80px)]">
          <CalendarContent />
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h1 className={cn('text-xl md:text-2xl font-bold', isRTL && 'font-arabic')}>
                {isRTL ? 'تقويم الحجوزات' : 'Booking Calendar'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'عرض وإدارة جدولك الزمني' : 'View and manage your schedule'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)}>
            <Maximize2 className="h-4 w-4 me-2" />
            {isRTL ? 'ملء الشاشة' : 'Fullscreen'}
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <GlassCard className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{isRTL ? 'معلقة' : 'Pending'}</span>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                {pendingCount}
              </Badge>
            </div>
          </GlassCard>
          <GlassCard className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{isRTL ? 'مقبولة' : 'Accepted'}</span>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                {acceptedCount}
              </Badge>
            </div>
          </GlassCard>
          <GlassCard className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{isRTL ? 'قيد التنفيذ' : 'In Progress'}</span>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/30">
                {inProgressCount}
              </Badge>
            </div>
          </GlassCard>
          <GlassCard className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{isRTL ? 'مكتملة' : 'Completed'}</span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                {completedCount}
              </Badge>
            </div>
          </GlassCard>
        </div>

        {/* Status Legend */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{isRTL ? 'دليل الحالات' : 'Status Legend'}</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span>{isRTL ? 'معلق' : 'Pending'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>{isRTL ? 'مقبول' : 'Accepted'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span>{isRTL ? 'قيد التنفيذ' : 'In Progress'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>{isRTL ? 'مكتمل' : 'Completed'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>{isRTL ? 'ملغي' : 'Cancelled'}</span>
            </div>
          </div>
        </GlassCard>

        {/* Calendar */}
        <CalendarContent />
      </div>
    </DashboardLayout>
  );
}
