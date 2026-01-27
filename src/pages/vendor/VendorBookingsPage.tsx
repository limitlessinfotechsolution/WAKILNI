import { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Eye, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { useVendor } from '@/hooks/useVendor';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function VendorBookingsPage() {
  const { isRTL } = useLanguage();
  const { bookings, isLoading } = useVendor();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredBookings = statusFilter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === statusFilter);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">{isRTL ? 'مكتمل' : 'Completed'}</Badge>;
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

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'إدارة الحجوزات' : 'Booking Management'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'عرض وإدارة جميع الحجوزات المخصصة لك' : 'View and manage all bookings assigned to you'}
            </p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 me-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? 'جميع الحالات' : 'All Status'}</SelectItem>
              <SelectItem value="pending">{isRTL ? 'معلق' : 'Pending'}</SelectItem>
              <SelectItem value="accepted">{isRTL ? 'مقبول' : 'Accepted'}</SelectItem>
              <SelectItem value="in_progress">{isRTL ? 'قيد التنفيذ' : 'In Progress'}</SelectItem>
              <SelectItem value="completed">{isRTL ? 'مكتمل' : 'Completed'}</SelectItem>
              <SelectItem value="cancelled">{isRTL ? 'ملغي' : 'Cancelled'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{bookings.length}</p>
              <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي الحجوزات' : 'Total'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
              <p className="text-sm text-muted-foreground">{isRTL ? 'معلق' : 'Pending'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {bookings.filter(b => b.status === 'in_progress').length}
              </p>
              <p className="text-sm text-muted-foreground">{isRTL ? 'قيد التنفيذ' : 'In Progress'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {bookings.filter(b => b.status === 'completed').length}
              </p>
              <p className="text-sm text-muted-foreground">{isRTL ? 'مكتمل' : 'Completed'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'الحجوزات' : 'Bookings'}</CardTitle>
            <CardDescription>
              {filteredBookings.length} {isRTL ? 'حجز' : 'booking(s)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">{isRTL ? 'لا توجد حجوزات' : 'No bookings found'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(booking.status)}
                        <Badge variant="outline">
                          {booking.service?.service_type?.toUpperCase() || 'Service'}
                        </Badge>
                      </div>
                      <h3 className="font-medium">
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
                          <p className="text-lg font-bold text-primary">SAR {booking.total_amount}</p>
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
