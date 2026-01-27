import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, MapPin, CheckCircle2, XCircle, Play, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/lib/i18n';
import { useProviderBookings, BookingStatus } from '@/hooks/useProviderBookings';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const { t, isRTL } = useLanguage();
  const { bookings, isLoading, updateBookingStatus } = useProviderBookings();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<typeof bookings[0] | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day offset for grid alignment
  const firstDayOffset = monthStart.getDay();
  const prefixDays = Array.from({ length: firstDayOffset }, (_, i) => null);

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const grouped: Record<string, typeof bookings> = {};
    bookings.forEach(booking => {
      if (booking.scheduled_date) {
        const dateKey = format(parseISO(booking.scheduled_date), 'yyyy-MM-dd');
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(booking);
      }
    });
    return grouped;
  }, [bookings]);

  const selectedDateBookings = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return bookingsByDate[dateKey] || [];
  }, [selectedDate, bookingsByDate]);

  const upcomingBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookings
      .filter(b => b.scheduled_date && parseISO(b.scheduled_date) >= today && b.status !== 'completed' && b.status !== 'cancelled')
      .slice(0, 5);
  }, [bookings]);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'pending': return 'bg-amber-500';
      case 'accepted': return 'bg-blue-500';
      case 'in_progress': return 'bg-purple-500';
      case 'completed': return 'bg-emerald-500';
      case 'cancelled': return 'bg-red-500';
      case 'disputed': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      accepted: 'default',
      in_progress: 'default',
      completed: 'default',
      cancelled: 'destructive',
      disputed: 'destructive',
    };
    return variants[status || 'pending'] || 'secondary';
  };

  const getStatusLabel = (status: string | null) => {
    const labels: Record<string, { en: string; ar: string }> = {
      pending: { en: 'Pending', ar: 'قيد الانتظار' },
      accepted: { en: 'Accepted', ar: 'مقبول' },
      in_progress: { en: 'In Progress', ar: 'قيد التنفيذ' },
      completed: { en: 'Completed', ar: 'مكتمل' },
      cancelled: { en: 'Cancelled', ar: 'ملغي' },
      disputed: { en: 'Disputed', ar: 'متنازع عليه' },
    };
    const label = labels[status || 'pending'];
    return isRTL ? label?.ar : label?.en;
  };

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    await updateBookingStatus(bookingId, newStatus);
    setSelectedBooking(null);
  };

  const dayNames = isRTL 
    ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className={cn('text-2xl font-bold mb-1', isRTL && 'font-arabic')}>
            {isRTL ? 'التقويم' : 'Booking Calendar'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'إدارة جدولك وحجوزاتك القادمة' : 'Manage your schedule and upcoming bookings'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <CardTitle className={cn('text-lg', isRTL && 'font-arabic')}>
                  {format(currentMonth, 'MMMM yyyy', { locale: isRTL ? ar : undefined })}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <>
                  {/* Day names */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {dayNames.map(day => (
                      <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {prefixDays.map((_, i) => (
                      <div key={`prefix-${i}`} className="h-20" />
                    ))}
                    {daysInMonth.map(day => {
                      const dateKey = format(day, 'yyyy-MM-dd');
                      const dayBookings = bookingsByDate[dateKey] || [];
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const hasBookings = dayBookings.length > 0;

                      return (
                        <button
                          key={dateKey}
                          onClick={() => setSelectedDate(day)}
                          className={cn(
                            'h-20 p-1 rounded-lg border text-start transition-all',
                            'hover:border-primary hover:bg-primary/5',
                            isToday(day) && 'border-primary bg-primary/10',
                            isSelected && 'ring-2 ring-primary border-primary',
                            !isSameMonth(day, currentMonth) && 'opacity-50'
                          )}
                        >
                          <div className={cn(
                            'text-sm font-medium mb-1',
                            isToday(day) && 'text-primary'
                          )}>
                            {format(day, 'd')}
                          </div>
                          {hasBookings && (
                            <div className="space-y-0.5">
                              {dayBookings.slice(0, 2).map(booking => (
                                <div
                                  key={booking.id}
                                  className={cn(
                                    'text-[10px] px-1 py-0.5 rounded truncate text-white',
                                    getStatusColor(booking.status)
                                  )}
                                >
                                  {booking.service?.service_type || 'Booking'}
                                </div>
                              ))}
                              {dayBookings.length > 2 && (
                                <div className="text-[10px] text-muted-foreground">
                                  +{dayBookings.length - 2} more
                                </div>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Selected Date Bookings */}
            {selectedDate && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className={cn('text-base', isRTL && 'font-arabic')}>
                    {format(selectedDate, 'EEEE, d MMMM', { locale: isRTL ? ar : undefined })}
                  </CardTitle>
                  <CardDescription>
                    {selectedDateBookings.length} {isRTL ? 'حجز' : 'booking(s)'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedDateBookings.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {isRTL ? 'لا توجد حجوزات' : 'No bookings for this date'}
                    </p>
                  ) : (
                    selectedDateBookings.map(booking => (
                      <Dialog key={booking.id}>
                        <DialogTrigger asChild>
                          <button
                            className="w-full p-3 rounded-lg border hover:border-primary transition-colors text-start"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className={cn('font-medium text-sm truncate', isRTL && 'font-arabic')}>
                                  {isRTL && booking.service?.title_ar 
                                    ? booking.service.title_ar 
                                    : booking.service?.title || 'Service'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {isRTL && booking.beneficiary?.full_name_ar 
                                    ? booking.beneficiary.full_name_ar 
                                    : booking.beneficiary?.full_name || 'Beneficiary'}
                                </p>
                              </div>
                              <Badge variant={getStatusBadge(booking.status)} className="shrink-0 text-xs">
                                {getStatusLabel(booking.status)}
                              </Badge>
                            </div>
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className={cn(isRTL && 'font-arabic')}>
                              {isRTL ? 'تفاصيل الحجز' : 'Booking Details'}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className={cn(isRTL && 'font-arabic')}>
                                  {isRTL && booking.service?.title_ar 
                                    ? booking.service.title_ar 
                                    : booking.service?.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className={cn(isRTL && 'font-arabic')}>
                                  {isRTL && booking.beneficiary?.full_name_ar 
                                    ? booking.beneficiary.full_name_ar 
                                    : booking.beneficiary?.full_name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {booking.scheduled_date 
                                    ? format(parseISO(booking.scheduled_date), 'PPP', { locale: isRTL ? ar : undefined })
                                    : 'Not scheduled'}
                                </span>
                              </div>
                            </div>

                            {booking.special_requests && (
                              <div>
                                <p className="text-sm font-medium mb-1">
                                  {isRTL ? 'طلبات خاصة' : 'Special Requests'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {booking.special_requests}
                                </p>
                              </div>
                            )}

                            <div>
                              <p className="text-sm font-medium mb-2">
                                {isRTL ? 'تحديث الحالة' : 'Update Status'}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {booking.status === 'pending' && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleStatusChange(booking.id, 'accepted')}
                                    className="gap-1"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                    {isRTL ? 'قبول' : 'Accept'}
                                  </Button>
                                )}
                                {booking.status === 'accepted' && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleStatusChange(booking.id, 'in_progress')}
                                    className="gap-1"
                                  >
                                    <Play className="h-4 w-4" />
                                    {isRTL ? 'بدء التنفيذ' : 'Start'}
                                  </Button>
                                )}
                                {booking.status === 'in_progress' && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleStatusChange(booking.id, 'completed')}
                                    className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                    {isRTL ? 'إكمال' : 'Complete'}
                                  </Button>
                                )}
                                {['pending', 'accepted'].includes(booking.status || '') && (
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleStatusChange(booking.id, 'cancelled')}
                                    className="gap-1"
                                  >
                                    <XCircle className="h-4 w-4" />
                                    {isRTL ? 'إلغاء' : 'Cancel'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            {/* Upcoming Bookings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className={cn('text-base flex items-center gap-2', isRTL && 'font-arabic')}>
                  <CalendarIcon className="h-4 w-4" />
                  {isRTL ? 'الحجوزات القادمة' : 'Upcoming Bookings'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : upcomingBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {isRTL ? 'لا توجد حجوزات قادمة' : 'No upcoming bookings'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {upcomingBookings.map(booking => (
                      <div 
                        key={booking.id} 
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                        onClick={() => {
                          if (booking.scheduled_date) {
                            setSelectedDate(parseISO(booking.scheduled_date));
                          }
                        }}
                      >
                        <div className={cn('w-2 h-2 rounded-full shrink-0', getStatusColor(booking.status))} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {booking.service?.service_type?.toUpperCase()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {booking.scheduled_date 
                              ? format(parseISO(booking.scheduled_date), 'MMM d', { locale: isRTL ? ar : undefined })
                              : 'TBD'}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
