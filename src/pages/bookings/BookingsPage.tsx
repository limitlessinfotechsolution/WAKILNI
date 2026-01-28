import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, Building2, Plus, Eye, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard, GlassCardContent } from '@/components/cards';
import { SwipeableTabs } from '@/components/navigation/SwipeableTabs';
import { FloatingActionButton } from '@/components/navigation/FloatingActionButton';
import { EmptyState } from '@/components/feedback';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useBookings, type BookingStatus } from '@/hooks/useBookings';
import { useLanguage } from '@/lib/i18n';
import { useDashboardRefresh } from '@/hooks/useDashboardRefresh';
import { cn } from '@/lib/utils';

const statusColors: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  disputed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const serviceTypeEmojis: Record<string, string> = {
  umrah: '🕋',
  hajj: '🕌',
  ziyarat: '🌙',
};

export default function BookingsPage() {
  const { t, isRTL } = useLanguage();
  const { bookings, isLoading } = useBookings();
  const { refresh } = useDashboardRefresh();
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

  const tabs = [
    { id: 'all', label: t.common.all, badge: bookings.length },
    { id: 'pending', label: t.bookings.pending, badge: bookings.filter(b => b.status === 'pending').length },
    { id: 'in_progress', label: isRTL ? 'جارٍ' : 'Active', badge: bookings.filter(b => b.status === 'in_progress' || b.status === 'accepted').length },
    { id: 'completed', label: t.bookings.completed, badge: bookings.filter(b => b.status === 'completed').length },
  ];

  const handleTabChange = (tabId: string) => {
    if (tabId === 'in_progress') {
      setStatusFilter('in_progress');
    } else {
      setStatusFilter(tabId);
    }
  };

  return (
    <DashboardLayout>
      <PullToRefresh onRefresh={refresh} className="h-full">
        <div className="p-4 md:p-6 pb-32">
          {/* Header */}
          <div className="mb-6">
            <h1 className={cn('text-2xl md:text-3xl font-bold mb-1', isRTL && 'font-arabic')}>
              {t.bookings.myBookings}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isRTL 
                ? 'تتبع وإدارة جميع حجوزاتك'
                : 'Track and manage all your bookings'}
            </p>
          </div>

          {/* Filter Tabs */}
          <SwipeableTabs
            tabs={tabs}
            activeTab={statusFilter === 'accepted' ? 'in_progress' : statusFilter}
            onTabChange={handleTabChange}
            variant="pills"
            size="sm"
            className="mb-6"
          />

          {/* Bookings List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title={t.bookings.noBookings}
              description={t.bookings.createFirst}
              action={{
                label: t.bookings.newBooking,
                onClick: () => window.location.href = '/bookings/new',
              }}
            />
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((booking, index) => (
                <Link key={booking.id} to={`/bookings/${booking.id}`}>
                  <GlassCard 
                    className={cn(
                      'animate-fade-in-up',
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <GlassCardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Service Type Emoji */}
                        <div className="text-3xl">
                          {booking.service?.service_type && serviceTypeEmojis[booking.service.service_type]}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-sm md:text-base line-clamp-1">
                              {booking.service && (isRTL 
                                ? booking.service.title_ar || booking.service.title 
                                : booking.service.title)}
                            </h3>
                            <Badge className={cn('text-xs shrink-0', statusColors[booking.status as BookingStatus])}>
                              {statusLabels[booking.status as BookingStatus]}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                            {booking.beneficiary && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span className="truncate max-w-[100px]">
                                  {isRTL 
                                    ? booking.beneficiary.full_name_ar || booking.beneficiary.full_name
                                    : booking.beneficiary.full_name}
                                </span>
                              </div>
                            )}
                            {booking.scheduled_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(booking.scheduled_date), 'MMM d')}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{format(new Date(booking.created_at), 'MMM d')}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-primary">
                              {formatPrice(booking.total_amount, booking.currency)}
                            </p>
                            <Button variant="ghost" size="sm" className="h-8 rounded-lg">
                              <Eye className="h-4 w-4 me-1" />
                              {t.common.view}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </GlassCardContent>
                  </GlassCard>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PullToRefresh>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon={<Plus className="h-6 w-6" />}
        onClick={() => window.location.href = '/bookings/new'}
      />
    </DashboardLayout>
  );
}
