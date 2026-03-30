import { useState } from 'react';
import { Calendar, Clock, CheckCircle, Eye, DollarSign, TrendingUp, UserCheck, Users, Plus, Trash2 } from 'lucide-react';
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
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const STATUS_TABS = [
  { id: 'all', label: { en: 'All', ar: 'الكل' } },
  { id: 'assigned_to_vendor', label: { en: 'Needs Assignment', ar: 'يحتاج تعيين' } },
  { id: 'assigned_to_provider', label: { en: 'Assigned', ar: 'معيّن' } },
  { id: 'in_progress', label: { en: 'Active', ar: 'نشط' } },
  { id: 'completed', label: { en: 'Done', ar: 'مكتمل' } },
];

export default function VendorBookingsPage() {
  const { isRTL } = useLanguage();
  const { bookings, isLoading, refetch, vendorProviders, allProviders, assignToProvider, linkProvider, unlinkProvider } = useVendor();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [linkProviderId, setLinkProviderId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const statusFilter = STATUS_TABS[activeTab].id;
  const filteredBookings = statusFilter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === statusFilter);

  const stats = {
    total: bookings.length,
    needsAssignment: bookings.filter(b => b.status === 'assigned_to_vendor').length,
    inProgress: bookings.filter(b => b.status === 'in_progress').length,
    totalRevenue: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.total_amount || 0), 0),
  };

  const handleAssignToProvider = async (bookingId: string) => {
    if (!selectedProvider) return;
    setIsAssigning(true);
    await assignToProvider(bookingId, selectedProvider);
    setSelectedProvider('');
    setIsAssigning(false);
  };

  const handleLinkProvider = async () => {
    if (!linkProviderId) return;
    await linkProvider(linkProviderId);
    setLinkProviderId('');
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-500">{isRTL ? 'مكتمل' : 'Completed'}</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">{isRTL ? 'قيد التنفيذ' : 'In Progress'}</Badge>;
      case 'assigned_to_provider':
        return <Badge className="bg-primary">{isRTL ? 'معيّن للمزود' : 'Assigned to Provider'}</Badge>;
      case 'assigned_to_vendor':
        return <Badge variant="secondary">{isRTL ? 'يحتاج تعيين مزود' : 'Needs Provider'}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{isRTL ? 'ملغي' : 'Cancelled'}</Badge>;
      default:
        return <Badge variant="outline">{status || 'Unknown'}</Badge>;
    }
  };

  // Providers not yet linked
  const unlinkableProviders = allProviders.filter(
    p => !vendorProviders.some(vp => vp.provider_id === p.id)
  );

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
                {isRTL ? 'تعيين الحجوزات لمقدمي الخدمات التابعين لك' : 'Assign bookings to your linked providers'}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title={isRTL ? 'إجمالي' : 'Total'} value={stats.total} icon={Calendar} className="bg-gradient-to-br from-blue-500/10 to-blue-500/5" />
            <StatCard title={isRTL ? 'يحتاج تعيين' : 'Needs Assignment'} value={stats.needsAssignment} icon={Clock} className="bg-gradient-to-br from-amber-500/10 to-amber-500/5" />
            <StatCard title={isRTL ? 'قيد التنفيذ' : 'In Progress'} value={stats.inProgress} icon={TrendingUp} className="bg-gradient-to-br from-blue-500/10 to-blue-500/5" />
            <StatCard title={isRTL ? 'الإيرادات' : 'Revenue'} value={`${stats.totalRevenue.toLocaleString()}`} subtitle="SAR" icon={DollarSign} className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5" />
          </div>

          {/* My Providers */}
          <GlassCard>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {isRTL ? 'مقدمو الخدمات' : 'My Providers'} ({vendorProviders.length})
                </CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 me-1" />
                      {isRTL ? 'ربط مزود' : 'Link Provider'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{isRTL ? 'ربط مقدم خدمة' : 'Link a Provider'}</DialogTitle>
                      <DialogDescription>{isRTL ? 'اختر مزوداً لربطه بمؤسستك' : 'Select a provider to link to your organization'}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Select value={linkProviderId} onValueChange={setLinkProviderId}>
                        <SelectTrigger>
                          <SelectValue placeholder={isRTL ? 'اختر مزوداً' : 'Select provider'} />
                        </SelectTrigger>
                        <SelectContent>
                          {unlinkableProviders.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.company_name || 'Provider'}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button className="w-full" onClick={handleLinkProvider} disabled={!linkProviderId}>
                        <Plus className="h-4 w-4 me-2" />
                        {isRTL ? 'ربط' : 'Link'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {vendorProviders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {isRTL ? 'لم يتم ربط أي مزود بعد' : 'No providers linked yet'}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {vendorProviders.map(vp => (
                    <Badge key={vp.id} variant="outline" className="px-3 py-1.5 flex items-center gap-2">
                      <span>{vp.company_name || 'Provider'}</span>
                      <button onClick={() => unlinkProvider(vp.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </GlassCard>

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
              <CardDescription>{filteredBookings.length} {isRTL ? 'حجز' : 'booking(s)'}</CardDescription>
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
                    <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {getStatusBadge(booking.status)}
                              <Badge variant="outline">{booking.service?.service_type?.toUpperCase() || 'Service'}</Badge>
                            </div>
                            <h3 className="font-medium truncate">
                              {isRTL ? booking.service?.title_ar || booking.service?.title : booking.service?.title || 'Service'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {isRTL ? 'المستفيد:' : 'Beneficiary:'} {isRTL ? booking.beneficiary?.full_name_ar || booking.beneficiary?.full_name : booking.beneficiary?.full_name || 'N/A'}
                            </p>
                            {booking.provider && (
                              <p className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
                                <UserCheck className="h-3 w-3" />
                                {isRTL ? 'المزود:' : 'Provider:'} {booking.provider.company_name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {booking.total_amount && (
                              <div className="text-end">
                                <p className="text-lg font-bold text-primary">SAR {booking.total_amount.toLocaleString()}</p>
                              </div>
                            )}
                            {/* Assign to Provider button for bookings assigned_to_vendor */}
                            {booking.status === 'assigned_to_vendor' && vendorProviders.length > 0 && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm">
                                    <UserCheck className="h-4 w-4 me-1" />
                                    {isRTL ? 'تعيين مزود' : 'Assign Provider'}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>{isRTL ? 'تعيين مقدم خدمة' : 'Assign to Provider'}</DialogTitle>
                                    <DialogDescription>{isRTL ? 'اختر مقدم خدمة من فريقك' : 'Select a provider from your team'}</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <Label>{isRTL ? 'مقدم الخدمة' : 'Provider'}</Label>
                                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                                      <SelectTrigger>
                                        <SelectValue placeholder={isRTL ? 'اختر' : 'Select'} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {vendorProviders.filter(vp => vp.is_active).map(vp => (
                                          <SelectItem key={vp.provider_id} value={vp.provider_id}>
                                            {vp.company_name || 'Provider'}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Button className="w-full" onClick={() => handleAssignToProvider(booking.id)} disabled={!selectedProvider || isAssigning}>
                                      {isRTL ? 'تأكيد' : 'Confirm'}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
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
