import { useState, useEffect } from 'react';
import { format, isBefore, startOfDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CalendarDays, Clock, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { usePublicProviderAvailability } from '@/hooks/usePublicProviderAvailability';
import type { Service } from '@/hooks/useServices';

interface StepDateSelectionProps {
  service: Service;
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
}

export function StepDateSelection({ service, selectedDate, onSelectDate }: StepDateSelectionProps) {
  const { isRTL } = useLanguage();
  const { 
    isLoading, 
    isDateAvailable, 
    getRemainingSlots,
    getNextAvailableDate 
  } = usePublicProviderAvailability(service.provider_id);
  
  const [month, setMonth] = useState<Date>(new Date());

  // Auto-select next available date on mount if no date selected
  useEffect(() => {
    if (!selectedDate && !isLoading) {
      const nextAvailable = getNextAvailableDate();
      if (nextAvailable) {
        onSelectDate(nextAvailable);
      }
    }
  }, [isLoading]);

  const handleAutoBook = () => {
    const nextAvailable = getNextAvailableDate();
    if (nextAvailable) {
      onSelectDate(nextAvailable);
    }
  };

  const isDateDisabled = (date: Date): boolean => {
    const today = startOfDay(new Date());
    if (isBefore(date, today)) return true;
    return !isDateAvailable(date);
  };


  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded w-1/2 mx-auto" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  const nextAvailable = getNextAvailableDate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-medium">
            {isRTL ? 'بارك الله في وقتك' : 'May Allah bless your time'}
          </span>
        </div>
        <h2 className="text-2xl font-semibold">
          {isRTL ? 'اختر موعد أداء المناسك' : 'Select Service Date'}
        </h2>
        <p className="text-muted-foreground">
          {isRTL 
            ? 'اختر التاريخ المناسب من الأيام المتاحة'
            : 'Choose an available date for the service'}
        </p>
      </div>

      {/* Auto-book suggestion */}
      {nextAvailable && !selectedDate && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">
                    {isRTL ? 'أقرب موعد متاح' : 'Next Available Slot'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(nextAvailable, 'EEEE, d MMMM yyyy', { locale: isRTL ? ar : undefined })}
                  </p>
                </div>
              </div>
              <Button onClick={handleAutoBook} size="sm" className="shrink-0">
                {isRTL ? 'احجز الآن' : 'Book Now'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected date confirmation */}
      {selectedDate && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary text-primary-foreground">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-primary">
                  {isRTL ? 'التاريخ المحدد' : 'Selected Date'}
                </p>
                <p className="text-lg font-semibold">
                  {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: isRTL ? ar : undefined })}
                </p>
                {getRemainingSlots(selectedDate) <= 2 && (
                  <Badge variant="outline" className="mt-1 text-orange-600 border-orange-300">
                    <Clock className="h-3 w-3 me-1" />
                    {isRTL 
                      ? `${getRemainingSlots(selectedDate)} أماكن متبقية فقط`
                      : `Only ${getRemainingSlots(selectedDate)} slots left`}
                  </Badge>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onSelectDate(null)}
              >
                {isRTL ? 'تغيير' : 'Change'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar */}
      <Card>
        <CardContent className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate || undefined}
            onSelect={(date) => onSelectDate(date || null)}
            month={month}
            onMonthChange={setMonth}
            disabled={isDateDisabled}
            className="mx-auto"
            classNames={{
              day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
            }}
          />
          
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary/10 border border-primary/30" />
              <span className="text-muted-foreground">
                {isRTL ? 'متاح' : 'Available'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-100 border border-orange-300 dark:bg-orange-900/30" />
              <span className="text-muted-foreground">
                {isRTL ? 'أماكن محدودة' : 'Limited Slots'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted border" />
              <span className="text-muted-foreground">
                {isRTL ? 'غير متاح' : 'Unavailable'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* No availability warning */}
      {!nextAvailable && (
        <Card className="border-orange-300 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  {isRTL ? 'لا توجد مواعيد متاحة' : 'No Available Dates'}
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  {isRTL 
                    ? 'يرجى اختيار مقدم خدمة آخر أو المحاولة لاحقاً'
                    : 'Please select a different provider or try again later'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
