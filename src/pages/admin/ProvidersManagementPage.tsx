import { useState } from 'react';
import { Search, UserCheck, Check, X, Ban, MoreHorizontal, Eye, Star, Users, ShieldCheck, Clock, UserX } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { useAdminProviders } from '@/hooks/useAdminProviders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/cards';
import { StatCard } from '@/components/cards';
import { SwipeableTabs } from '@/components/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';

type KycStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

const STATUS_TABS = [
  { id: 'all', label: { en: 'All', ar: 'الكل' } },
  { id: 'pending', label: { en: 'Pending', ar: 'معلق' } },
  { id: 'under_review', label: { en: 'Under Review', ar: 'قيد المراجعة' } },
  { id: 'approved', label: { en: 'Approved', ar: 'معتمد' } },
  { id: 'rejected', label: { en: 'Rejected', ar: 'مرفوض' } },
];

export default function ProvidersManagementPage() {
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<KycStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [notes, setNotes] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');

  const kycFilter = activeTab === 'all' ? undefined : activeTab;
  const { providers, isLoading, updateKycStatus, refetch } = useAdminProviders(kycFilter);

  const filteredProviders = providers.filter(provider => {
    if (!searchQuery) return true;
    const name = provider.company_name || provider.company_name_ar || '';
    const profileName = provider.profile?.full_name || provider.profile?.full_name_ar || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           profileName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Stats
  const stats = {
    total: providers.length,
    verified: providers.filter(p => p.kyc_status === 'approved').length,
    pending: providers.filter(p => p.kyc_status === 'pending' || p.kyc_status === 'under_review').length,
    suspended: providers.filter(p => p.is_suspended).length,
  };

  const getStatusBadge = (status: KycStatus | null, isSuspended: boolean | null) => {
    if (isSuspended) {
      return <Badge variant="destructive">{isRTL ? 'موقوف' : 'Suspended'}</Badge>;
    }
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500">{isRTL ? 'معتمد' : 'Approved'}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{isRTL ? 'مرفوض' : 'Rejected'}</Badge>;
      case 'under_review':
        return <Badge variant="secondary">{isRTL ? 'قيد المراجعة' : 'Under Review'}</Badge>;
      default:
        return <Badge variant="outline">{isRTL ? 'معلق' : 'Pending'}</Badge>;
    }
  };

  const handleAction = async () => {
    if (selectedProvider) {
      await updateKycStatus(
        selectedProvider.id, 
        actionType === 'approve' ? 'approved' : 'rejected',
        notes
      );
      setActionDialogOpen(false);
      setSelectedProvider(null);
      setNotes('');
    }
  };

  const handleSuspend = async () => {
    if (selectedProvider) {
      try {
        const { error } = await supabase
          .from('providers')
          .update({
            is_suspended: true,
            suspension_reason: suspensionReason,
            is_active: false,
          })
          .eq('id', selectedProvider.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Provider suspended successfully',
        });

        await refetch();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to suspend provider',
          variant: 'destructive',
        });
      }
      setSuspendDialogOpen(false);
      setSelectedProvider(null);
      setSuspensionReason('');
    }
  };

  const handleUnsuspend = async (provider: any) => {
    try {
      const { error } = await supabase
        .from('providers')
        .update({
          is_suspended: false,
          suspension_reason: null,
          is_active: true,
        })
        .eq('id', provider.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Provider unsuspended successfully',
      });

      await refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unsuspend provider',
        variant: 'destructive',
      });
    }
  };

  const openActionDialog = (provider: any, type: 'approve' | 'reject') => {
    setSelectedProvider(provider);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const openSuspendDialog = (provider: any) => {
    setSelectedProvider(provider);
    setSuspendDialogOpen(true);
  };

  const tabLabels = STATUS_TABS.map(tab => isRTL ? tab.label.ar : tab.label.en);

  return (
    <DashboardLayout>
      <PullToRefresh onRefresh={refetch} className="h-full">
        <div className="p-4 md:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h1 className={cn('text-xl md:text-2xl font-bold', isRTL && 'font-arabic')}>
                  {isRTL ? 'إدارة مقدمي الخدمات' : 'Provider Management'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'إدارة مقدمي خدمات الحج والعمرة' : 'Manage Hajj & Umrah service providers'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              title={isRTL ? 'إجمالي المقدمين' : 'Total Providers'}
              value={stats.total}
              icon={Users}
              className="bg-gradient-to-br from-blue-500/10 to-blue-500/5"
            />
            <StatCard
              title={isRTL ? 'موثقين' : 'Verified'}
              value={stats.verified}
              icon={ShieldCheck}
              trend={{ value: 0, isPositive: true }}
              className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5"
            />
            <StatCard
              title={isRTL ? 'قيد الانتظار' : 'Pending'}
              value={stats.pending}
              icon={Clock}
              className="bg-gradient-to-br from-amber-500/10 to-amber-500/5"
            />
            <StatCard
              title={isRTL ? 'موقوفين' : 'Suspended'}
              value={stats.suspended}
              icon={UserX}
              className="bg-gradient-to-br from-red-500/10 to-red-500/5"
            />
          </div>

          {/* Search */}
          <GlassCard className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={isRTL ? 'البحث بالاسم...' : 'Search by name...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </GlassCard>

          {/* Tabs */}
          <SwipeableTabs
            tabs={STATUS_TABS.map(tab => ({ id: tab.id, label: isRTL ? tab.label.ar : tab.label.en }))}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as any)}
          />

          {/* Providers Table */}
          <GlassCard>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCheck className="h-5 w-5" />
                {isRTL ? 'قائمة مقدمي الخدمات' : 'Providers List'}
              </CardTitle>
              <CardDescription>
                {isRTL ? `إجمالي: ${filteredProviders.length} مقدم خدمة` : `Total: ${filteredProviders.length} providers`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-pulse text-muted-foreground">
                    {isRTL ? 'جاري التحميل...' : 'Loading...'}
                  </div>
                </div>
              ) : filteredProviders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <UserCheck className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">{isRTL ? 'لا يوجد مقدمو خدمات' : 'No providers found'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6 px-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{isRTL ? 'الاسم' : 'Name'}</TableHead>
                        <TableHead className="hidden md:table-cell">{isRTL ? 'الشركة' : 'Company'}</TableHead>
                        <TableHead className="hidden sm:table-cell">{isRTL ? 'التقييم' : 'Rating'}</TableHead>
                        <TableHead className="hidden sm:table-cell">{isRTL ? 'الحجوزات' : 'Bookings'}</TableHead>
                        <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                        <TableHead className="text-right">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProviders.map((provider) => (
                        <TableRow key={provider.id} className="group">
                          <TableCell className="font-medium">
                            <div>
                              <p>{provider.profile?.full_name || provider.profile?.full_name_ar || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground md:hidden">
                                {provider.company_name || '-'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {provider.company_name || provider.company_name_ar || '-'}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              {provider.rating || 0}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{provider.total_bookings || 0}</TableCell>
                          <TableCell>
                            {getStatusBadge(provider.kyc_status, provider.is_suspended)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  {isRTL ? 'عرض التفاصيل' : 'View Details'}
                                </DropdownMenuItem>
                                {(provider.kyc_status === 'pending' || provider.kyc_status === 'under_review') && (
                                  <>
                                    <DropdownMenuItem 
                                      onClick={() => openActionDialog(provider, 'approve')}
                                      className="text-emerald-600"
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      {isRTL ? 'اعتماد' : 'Approve'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => openActionDialog(provider, 'reject')}
                                      className="text-destructive"
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      {isRTL ? 'رفض' : 'Reject'}
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                {provider.is_suspended ? (
                                  <DropdownMenuItem onClick={() => handleUnsuspend(provider)}>
                                    <Check className="h-4 w-4 mr-2" />
                                    {isRTL ? 'إلغاء الإيقاف' : 'Unsuspend'}
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    onClick={() => openSuspendDialog(provider)}
                                    className="text-destructive"
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    {isRTL ? 'إيقاف' : 'Suspend'}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </GlassCard>

          {/* Action Dialog */}
          <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {actionType === 'approve' 
                    ? (isRTL ? 'اعتماد مقدم الخدمة' : 'Approve Provider')
                    : (isRTL ? 'رفض مقدم الخدمة' : 'Reject Provider')
                  }
                </DialogTitle>
                <DialogDescription>
                  {selectedProvider?.profile?.full_name || selectedProvider?.company_name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'ملاحظات' : 'Notes'}</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={isRTL ? 'أضف ملاحظات...' : 'Add notes...'}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button 
                  variant={actionType === 'approve' ? 'default' : 'destructive'}
                  onClick={handleAction}
                >
                  {actionType === 'approve' 
                    ? (isRTL ? 'اعتماد' : 'Approve')
                    : (isRTL ? 'رفض' : 'Reject')
                  }
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Suspend Dialog */}
          <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isRTL ? 'إيقاف مقدم الخدمة' : 'Suspend Provider'}</DialogTitle>
                <DialogDescription>
                  {isRTL 
                    ? 'سيتم إيقاف مقدم الخدمة ولن يتمكن من استقبال حجوزات جديدة.'
                    : 'This provider will be suspended and won\'t receive new bookings.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{isRTL ? 'سبب الإيقاف' : 'Suspension Reason'}</Label>
                  <Textarea
                    value={suspensionReason}
                    onChange={(e) => setSuspensionReason(e.target.value)}
                    placeholder={isRTL ? 'أدخل سبب الإيقاف...' : 'Enter suspension reason...'}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button variant="destructive" onClick={handleSuspend} disabled={!suspensionReason}>
                  {isRTL ? 'إيقاف' : 'Suspend'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PullToRefresh>
    </DashboardLayout>
  );
}
