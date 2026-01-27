import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, Building2, Plus, Eye, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MainLayout } from '@/components/layout';
import { useBookings, type BookingStatus } from '@/hooks/useBookings';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const statusColors: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  disputed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const serviceTypeIcons: Record<string, string> = {
  umrah: '🕋',
  hajj: '🕌',
  ziyarat: '🌙',
};

export default function BookingsPage() {
  const { t, isRTL } = useLanguage();
  const { bookings, isLoading } = useBookings();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredBookings = bookings.filter(booking => {
    if (statusFilter === 'all') return true;
    return booking.status === statusFilter;
  });

  const formatPrice = (amount: number | null, currency: string | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: currency || 'SAR',
    }).format(amount);
  };

  const statusLabels: Record<BookingStatus, string> = {
    pending: t.bookings.pending,
    accepted: t.bookings.accepted,
    in_progress: t.bookings.inProgress,
    completed: t.bookings.completed,
    cancelled: t.bookings.cancelled,
    disputed: t.bookings.disputed,
  };

  return (
    <MainLayout>
      <div className="container py-8 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isRTL ? 'font-arabic' : ''}`}>
              {t.bookings.myBookings}
            </h1>
            <p className="text-muted-foreground">
              {isRTL 
                ? 'تتبع وإدارة جميع حجوزاتك'
                : 'Track and manage all your bookings'}
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/bookings/new">
              <Plus className="h-4 w-4" />
              {t.bookings.newBooking}
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {isRTL ? 'تصفية حسب:' : 'Filter by:'}
            </span>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.common.all}</SelectItem>
              <SelectItem value="pending">{t.bookings.pending}</SelectItem>
              <SelectItem value="accepted">{t.bookings.accepted}</SelectItem>
              <SelectItem value="in_progress">{t.bookings.inProgress}</SelectItem>
              <SelectItem value="completed">{t.bookings.completed}</SelectItem>
              <SelectItem value="cancelled">{t.bookings.cancelled}</SelectItem>
              <SelectItem value="disputed">{t.bookings.disputed}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-1">{t.bookings.noBookings}</h3>
            <p className="text-muted-foreground mb-4">{t.bookings.createFirst}</p>
            <Button asChild>
              <Link to="/bookings/new">
                <Plus className="me-2 h-4 w-4" />
                {t.bookings.newBooking}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">
                        {booking.service?.service_type && serviceTypeIcons[booking.service.service_type]}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {booking.service && (isRTL 
                              ? booking.service.title_ar || booking.service.title 
                              : booking.service.title)}
                          </h3>
                          <Badge className={cn('text-xs', statusColors[booking.status as BookingStatus])}>
                            {statusLabels[booking.status as BookingStatus]}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {booking.beneficiary && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>
                                {isRTL 
                                  ? booking.beneficiary.full_name_ar || booking.beneficiary.full_name
                                  : booking.beneficiary.full_name}
                              </span>
                            </div>
                          )}
                          {booking.provider && (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              <span>
                                {isRTL 
                                  ? booking.provider.company_name_ar || booking.provider.company_name
                                  : booking.provider.company_name}
                              </span>
                            </div>
                          )}
                          {booking.scheduled_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(booking.scheduled_date), 'PP')}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{format(new Date(booking.created_at), 'PP')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-end">
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? 'الإجمالي' : 'Total'}
                        </p>
                        <p className="font-semibold text-primary">
                          {formatPrice(booking.total_amount, booking.currency)}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/bookings/${booking.id}`}>
                          <Eye className="me-2 h-4 w-4" />
                          {t.common.view}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
