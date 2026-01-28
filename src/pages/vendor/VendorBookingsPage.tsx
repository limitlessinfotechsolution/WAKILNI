import { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Eye, Filter, DollarSign, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/layout';
import { GlassCard } from '@/components/cards';
import { StatCard } from '@/components/cards';
import { SwipeableTabs } from '@/components/navigation';
import { useLanguage } from '@/lib/i18n';
import { useVendor } from '@/hooks/useVendor';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const STATUS_TABS = [
  { id: 'all', label: { en: 'All', ar: 'الكل' } },
  { id: 'pending', label: { en: 'Pending', ar: 'معلق' } },
  { id: 'in_progress', label: { en: 'Active', ar: 'نشط' } },
  { id: 'completed', label: { en: 'Done', ar: 'مكتمل' } },
];

export default function VendorBookingsPage() {
  const { isRTL } = useLanguage();
  const { bookings, isLoading, refetch } = useVendor();
  const [activeTab, setActiveTab] = useState(0);

  const statusFilter = STATUS_TABS[activeTab].id;
  const filteredBookings = statusFilter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === statusFilter);

  // Stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    inProgress: bookings.filter(b => b.status === 'in_progress').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    totalRevenue: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.total_amount || 0), 0),
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-500">{isRTL ? 'مكتمل' : 'Completed'}</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">{isRTL ? 'قيد التنفيذ' : 'In Progress'}</Badge>;
      case 'accepted':
        return <Badge className="bg-primary">{isRTL ? 'مقبول' : 'Accepted'}</Badge>;
      case 'pending':
        return <Badge variant="secondary">{isRTL ? 'معلق' : 'Pending'}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{isRTL ? 'ملغي' : 'Cancelled'}</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  const tabLabels = STATUS_TABS.map(tab => isRTL ? tab.label.ar : tab.label.en);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6 flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PullToRefresh onRefresh={refetch} className="h-full">
        <div className="p-4 md:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h1 className={cn('text-xl md:text-2xl font-bold', isRTL && 'font-arabic')}>
                {isRTL ? 'إدارة الحجوزات' : 'Booking Management'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'عرض وإدارة جميع الحجوزات' : 'View and manage all bookings'}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              title={isRTL ? 'إجمالي الحجوزات' : 'Total'}
              value={stats.total}
              icon={Calendar}
              className="bg-gradient-to-br from-blue-500/10 to-blue-500/5"
            />
            <StatCard
              title={isRTL ? 'معلق' : 'Pending'}
              value={stats.pending}
              icon={Clock}
              className="bg-gradient-to-br from-amber-500/10 to-amber-500/5"
            />
            <StatCard
              title={isRTL ? 'قيد التنفيذ' : 'In Progress'}
              value={stats.inProgress}
              icon={TrendingUp}
              className="bg-gradient-to-br from-blue-500/10 to-blue-500/5"
            />
            <StatCard
              title={isRTL ? 'الإيرادات' : 'Revenue'}
              value={`${stats.totalRevenue.toLocaleString()}`}
              subtitle="SAR"
              icon={DollarSign}
              className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5"
            />
          </div>

          {/* Tabs */}
          <SwipeableTabs
            tabs={STATUS_TABS.map(tab => ({ id: tab.id, label: isRTL ? tab.label.ar : tab.label.en }))}
            activeTab={STATUS_TABS[activeTab].id}
            onTabChange={(tabId) => setActiveTab(STATUS_TABS.findIndex(t => t.id === tabId))}
          />

          {/* Bookings List */}
          <GlassCard>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{isRTL ? 'الحجوزات' : 'Bookings'}</CardTitle>
              <CardDescription>
                {filteredBookings.length} {isRTL ? 'حجز' : 'booking(s)'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">{isRTL ? 'لا توجد حجوزات' : 'No bookings found'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredBookings.map((booking) => (
                    <Card 
                      key={booking.id} 
                      className="overflow-hidden hover:shadow-md transition-shadow active:scale-[0.99]"
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {getStatusBadge(booking.status)}
                              <Badge variant="outline">
                                {booking.service?.service_type?.toUpperCase() || 'Service'}
                              </Badge>
                            </div>
                            <h3 className="font-medium truncate">
                              {isRTL ? booking.service?.title_ar || booking.service?.title : booking.service?.title || 'Service'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {isRTL ? 'المستفيد:' : 'Beneficiary:'} {isRTL 
                                ? booking.beneficiary?.full_name_ar || booking.beneficiary?.full_name 
                                : booking.beneficiary?.full_name || 'N/A'}
                            </p>
                            {booking.scheduled_date && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(booking.scheduled_date), 'PPP')}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            {booking.total_amount && (
                              <div className="text-end">
                                <p className="text-lg font-bold text-primary">SAR {booking.total_amount.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(booking.created_at), 'PP')}
                                </p>
                              </div>
                            )}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 me-1" />
                                  {isRTL ? 'عرض' : 'View'}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{isRTL ? 'تفاصيل الحجز' : 'Booking Details'}</DialogTitle>
                                  <DialogDescription>
                                    {isRTL ? 'معلومات الحجز الكاملة' : 'Full booking information'}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-muted-foreground">{isRTL ? 'الحالة' : 'Status'}</p>
                                      {getStatusBadge(booking.status)}
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">{isRTL ? 'نوع الخدمة' : 'Service Type'}</p>
                                      <p className="font-medium">{booking.service?.service_type?.toUpperCase()}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">{isRTL ? 'المستفيد' : 'Beneficiary'}</p>
                                      <p className="font-medium">{booking.beneficiary?.full_name}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">{isRTL ? 'المبلغ' : 'Amount'}</p>
                                      <p className="font-medium">SAR {booking.total_amount || 0}</p>
                                    </div>
                                    {booking.scheduled_date && (
                                      <div className="col-span-2">
                                        <p className="text-sm text-muted-foreground">{isRTL ? 'التاريخ المحدد' : 'Scheduled Date'}</p>
                                        <p className="font-medium">{format(new Date(booking.scheduled_date), 'PPP')}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </GlassCard>
        </div>
      </PullToRefresh>
    </DashboardLayout>
  );
}
