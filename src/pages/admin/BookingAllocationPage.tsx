import { useState } from 'react';
import { 
  Users, Calendar, Star, ArrowRight, UserCheck, XCircle,
  Clock, CheckCircle, Filter, Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { useBookingAllocations } from '@/hooks/useBookingAllocations';
import { format } from 'date-fns';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function BookingAllocationPage() {
  const { isRTL } = useLanguage();
  const { 
    pendingBookings, availableProviders, availableVendors,
    isLoading, isSuperAdmin, assignToVendor, assignToProvider, unassignBooking 
  } = useBookingAllocations();

  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [notes, setNotes] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'assigned_to_vendor' | 'assigned_to_provider'>('all');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignMode, setAssignMode] = useState<'vendor' | 'provider'>('vendor');

  const filteredBookings = pendingBookings.filter(b => {
    if (filter === 'pending') return b.status === 'pending';
    if (filter === 'assigned_to_vendor') return b.status === 'assigned_to_vendor';
    if (filter === 'assigned_to_provider') return b.status === 'assigned_to_provider';
    return true;
  });

  const handleAssignToVendor = async () => {
    if (!selectedBooking || !selectedVendor) return;
    setIsAssigning(true);
    await assignToVendor(selectedBooking, selectedVendor, notes);
    setSelectedBooking(null);
    setSelectedVendor('');
    setNotes('');
    setIsAssigning(false);
  };

  const handleAssignToProvider = async () => {
    if (!selectedBooking || !selectedProvider) return;
    setIsAssigning(true);
    await assignToProvider(selectedBooking, selectedProvider, notes);
    setSelectedBooking(null);
    setSelectedProvider('');
    setNotes('');
    setIsAssigning(false);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">{isRTL ? 'بانتظار الموافقة' : 'Pending Approval'}</Badge>;
      case 'assigned_to_vendor':
        return <Badge className="bg-blue-500">{isRTL ? 'مُعيَّن للوكيل' : 'Assigned to Vendor'}</Badge>;
      case 'assigned_to_provider':
        return <Badge className="bg-emerald-500">{isRTL ? 'مُعيَّن لمقدم الخدمة' : 'Assigned to Provider'}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getServiceTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      umrah: 'bg-emerald-500', hajj: 'bg-amber-500', ziyarat: 'bg-purple-500',
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'توزيع الحجوزات' : 'Booking Allocation'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'تعيين الحجوزات للوكلاء ومقدمي الخدمات' : 'Assign bookings to vendors and providers'}
            </p>
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 me-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
              <SelectItem value="pending">{isRTL ? 'معلق' : 'Pending'}</SelectItem>
              <SelectItem value="assigned_to_vendor">{isRTL ? 'معيّن للوكيل' : 'Assigned to Vendor'}</SelectItem>
              <SelectItem value="assigned_to_provider">{isRTL ? 'معيّن للمزود' : 'Assigned to Provider'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'معلق' : 'Pending'}</p>
                  <p className="text-2xl font-bold">{pendingBookings.filter(b => b.status === 'pending').length}</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'لدى الوكلاء' : 'With Vendors'}</p>
                  <p className="text-2xl font-bold">{pendingBookings.filter(b => b.status === 'assigned_to_vendor').length}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'لدى المزودين' : 'With Providers'}</p>
                  <p className="text-2xl font-bold">{pendingBookings.filter(b => b.status === 'assigned_to_provider').length}</p>
                </div>
                <UserCheck className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{isRTL ? 'الوكلاء المتاحون' : 'Available Vendors'}</p>
                  <p className="text-2xl font-bold">{availableVendors.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
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
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="text-lg font-medium">{isRTL ? 'لا توجد حجوزات' : 'No bookings to show'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {booking.service && getServiceTypeBadge(booking.service.service_type)}
                        {getStatusBadge(booking.status)}
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
                      {booking.vendor && (
                        <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                          <Building2 className="h-3 w-3" />
                          {isRTL ? 'الوكيل:' : 'Vendor:'} {booking.vendor.company_name}
                        </p>
                      )}
                      {booking.provider && (
                        <p className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
                          <UserCheck className="h-3 w-3" />
                          {isRTL ? 'المزود:' : 'Provider:'} {booking.provider.company_name}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {booking.total_amount && (
                        <span className="text-lg font-semibold text-primary">
                          {booking.currency || 'SAR'} {booking.total_amount}
                        </span>
                      )}

                      {/* Unassign button */}
                      {(booking.status === 'assigned_to_vendor' || booking.status === 'assigned_to_provider') && (
                        <Button variant="outline" size="sm" onClick={() => unassignBooking(booking.id)}>
                          <XCircle className="h-4 w-4 me-1" />
                          {isRTL ? 'إلغاء' : 'Unassign'}
                        </Button>
                      )}

                      {/* Assign to Vendor (for pending bookings) */}
                      {booking.status === 'pending' && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => { setSelectedBooking(booking.id); setAssignMode('vendor'); }}>
                              <Building2 className="h-4 w-4 me-1" />
                              {isRTL ? 'تعيين لوكيل' : 'Assign to Vendor'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{isRTL ? 'تعيين وكيل' : 'Assign to Vendor'}</DialogTitle>
                              <DialogDescription>
                                {isRTL ? 'اختر وكيلاً لهذا الحجز' : 'Select a vendor for this booking'}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>{isRTL ? 'الوكيل' : 'Vendor'}</Label>
                                <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                                  <SelectTrigger>
                                    <SelectValue placeholder={isRTL ? 'اختر وكيلاً' : 'Select vendor'} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableVendors.map((v) => (
                                      <SelectItem key={v.id} value={v.id}>
                                        {isRTL ? v.company_name_ar || v.company_name : v.company_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>{isRTL ? 'ملاحظات' : 'Notes'}</Label>
                                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={isRTL ? 'ملاحظات اختيارية...' : 'Optional notes...'} />
                              </div>
                              <Button className="w-full" onClick={handleAssignToVendor} disabled={!selectedVendor || isAssigning}>
                                <ArrowRight className="h-4 w-4 me-2" />
                                {isRTL ? 'تأكيد التعيين' : 'Confirm Assignment'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {/* Super Admin: Direct assign to provider (bypass vendor) */}
                      {isSuperAdmin && (booking.status === 'pending' || booking.status === 'assigned_to_vendor') && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => { setSelectedBooking(booking.id); setAssignMode('provider'); }}>
                              <UserCheck className="h-4 w-4 me-1" />
                              {isRTL ? 'تعيين مباشر' : 'Direct Assign'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{isRTL ? 'تعيين مقدم خدمة مباشرة' : 'Direct Assign to Provider'}</DialogTitle>
                              <DialogDescription>
                                {isRTL ? 'تعيين مباشر متاح فقط للمدير العام' : 'Super Admin direct assignment — bypasses vendor step'}
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
                                    {availableProviders.map((p) => (
                                      <SelectItem key={p.id} value={p.id}>
                                        <div className="flex items-center gap-2">
                                          <span>{p.company_name || 'Provider'}</span>
                                          {p.rating ? (
                                            <span className="flex items-center text-xs text-muted-foreground">
                                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 me-1" />
                                              {p.rating}
                                            </span>
                                          ) : null}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>{isRTL ? 'ملاحظات' : 'Notes'}</Label>
                                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
                              </div>
                              <Button className="w-full" onClick={handleAssignToProvider} disabled={!selectedProvider || isAssigning}>
                                <ArrowRight className="h-4 w-4 me-2" />
                                {isRTL ? 'تأكيد' : 'Confirm'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
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
