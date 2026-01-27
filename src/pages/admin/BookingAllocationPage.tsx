import { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Star, 
  ArrowRight, 
  Shuffle, 
  UserCheck, 
  XCircle,
  Clock,
  CheckCircle,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { useBookingAllocations } from '@/hooks/useBookingAllocations';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function BookingAllocationPage() {
  const { isRTL } = useLanguage();
  const { 
    pendingBookings, 
    availableProviders, 
    isLoading, 
    assignToProvider, 
    autoRouteBooking,
    unassignBooking 
  } = useBookingAllocations();

  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [filter, setFilter] = useState<'all' | 'unassigned' | 'assigned'>('all');
  const [isAssigning, setIsAssigning] = useState(false);

  const filteredBookings = pendingBookings.filter(b => {
    if (filter === 'unassigned') return !b.provider;
    if (filter === 'assigned') return !!b.provider;
    return true;
  });

  const handleAssign = async () => {
    if (!selectedBooking || !selectedProvider) return;
    setIsAssigning(true);
    await assignToProvider(selectedBooking, selectedProvider, notes);
    setSelectedBooking(null);
    setSelectedProvider('');
    setNotes('');
    setIsAssigning(false);
  };

  const handleAutoRoute = async (bookingId: string) => {
    setIsAssigning(true);
    await autoRouteBooking(bookingId);
    setIsAssigning(false);
  };

  const getStatusBadge = (status: string | null, hasProvider: boolean) => {
    if (hasProvider) {
      return <Badge className="bg-green-500">{isRTL ? 'مُعيَّن' : 'Assigned'}</Badge>;
    }
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">{isRTL ? 'معلق' : 'Pending'}</Badge>;
      case 'accepted':
        return <Badge className="bg-blue-500">{isRTL ? 'مقبول' : 'Accepted'}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getServiceTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      umrah: 'bg-emerald-500',
      hajj: 'bg-amber-500',
      ziyarat: 'bg-purple-500',
    };
    return <Badge className={colors[type] || 'bg-gray-500'}>{type.toUpperCase()}</Badge>;
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
              {isRTL ? 'توزيع الحجوزات' : 'Booking Allocation'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'تعيين الحجوزات لمقدمي الخدمات' : 'Assign bookings to service providers'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 me-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                <SelectItem value="unassigned">{isRTL ? 'غير معيّن' : 'Unassigned'}</SelectItem>
                <SelectItem value="assigned">{isRTL ? 'معيّن' : 'Assigned'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي المعلقة' : 'Total Pending'}</p>
                  <p className="text-2xl font-bold">{pendingBookings.length}</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'غير معيّن' : 'Unassigned'}</p>
                  <p className="text-2xl font-bold">{pendingBookings.filter(b => !b.provider).length}</p>
                </div>
                <XCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'مقدمو الخدمات المتاحون' : 'Available Providers'}</p>
                  <p className="text-2xl font-bold">{availableProviders.length}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'الحجوزات المعلقة' : 'Pending Bookings'}</CardTitle>
            <CardDescription>
              {isRTL ? 'اختر حجزاً لتعيينه لمقدم خدمة' : 'Select a booking to assign to a provider'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="text-lg font-medium">{isRTL ? 'لا توجد حجوزات معلقة' : 'No pending bookings'}</p>
                <p className="text-muted-foreground">{isRTL ? 'جميع الحجوزات تم تعيينها' : 'All bookings have been assigned'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {booking.service && getServiceTypeBadge(booking.service.service_type)}
                        {getStatusBadge(booking.status, !!booking.provider)}
                      </div>
                      <h3 className="font-medium">
                        {isRTL ? booking.service?.title_ar || booking.service?.title : booking.service?.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'المستفيد:' : 'Beneficiary:'} {isRTL ? booking.beneficiary?.full_name_ar || booking.beneficiary?.full_name : booking.beneficiary?.full_name}
                      </p>
                      {booking.scheduled_date && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(booking.scheduled_date), 'PPP')}
                        </p>
                      )}
                      {booking.provider && (
                        <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                          <UserCheck className="h-3 w-3" />
                          {isRTL ? 'معيّن إلى:' : 'Assigned to:'} {booking.provider.company_name}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {booking.total_amount && (
                        <span className="text-lg font-semibold text-primary">
                          {booking.currency || 'SAR'} {booking.total_amount}
                        </span>
                      )}

                      {booking.provider ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => unassignBooking(booking.id)}
                        >
                          <XCircle className="h-4 w-4 me-1" />
                          {isRTL ? 'إلغاء التعيين' : 'Unassign'}
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAutoRoute(booking.id)}
                            disabled={isAssigning}
                          >
                            <Shuffle className="h-4 w-4 me-1" />
                            {isRTL ? 'توجيه تلقائي' : 'Auto-Route'}
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm"
                                onClick={() => setSelectedBooking(booking.id)}
                              >
                                <UserCheck className="h-4 w-4 me-1" />
                                {isRTL ? 'تعيين' : 'Assign'}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{isRTL ? 'تعيين مقدم خدمة' : 'Assign Provider'}</DialogTitle>
                                <DialogDescription>
                                  {isRTL 
                                    ? 'اختر مقدم خدمة لهذا الحجز'
                                    : 'Select a provider for this booking'}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>{isRTL ? 'مقدم الخدمة' : 'Provider'}</Label>
                                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                                    <SelectTrigger>
                                      <SelectValue placeholder={isRTL ? 'اختر مقدم خدمة' : 'Select provider'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableProviders.map((provider) => (
                                        <SelectItem key={provider.id} value={provider.id}>
                                          <div className="flex items-center gap-2">
                                            <span>{provider.company_name || 'Provider'}</span>
                                            {provider.rating && (
                                              <span className="flex items-center text-xs text-muted-foreground">
                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 me-1" />
                                                {provider.rating}
                                              </span>
                                            )}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>{isRTL ? 'ملاحظات' : 'Notes'}</Label>
                                  <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder={isRTL ? 'ملاحظات اختيارية...' : 'Optional notes...'}
                                  />
                                </div>
                                <Button 
                                  className="w-full" 
                                  onClick={handleAssign}
                                  disabled={!selectedProvider || isAssigning}
                                >
                                  <ArrowRight className="h-4 w-4 me-2" />
                                  {isRTL ? 'تأكيد التعيين' : 'Confirm Assignment'}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
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
