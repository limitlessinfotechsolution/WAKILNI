import { useState } from 'react';
import { Search, Building2, Check, X, Ban, MoreHorizontal, Eye, Users, ShieldCheck, Clock, CreditCard } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { useAdminVendors } from '@/hooks/useAdminVendors';
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

export default function VendorsManagementPage() {
  const { isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<KycStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [notes, setNotes] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');

  const kycFilter = activeTab === 'all' ? undefined : activeTab;
  const { vendors, isLoading, updateKycStatus, suspendVendor, unsuspendVendor, refetch } = useAdminVendors(kycFilter);

  const filteredVendors = vendors.filter(vendor => {
    if (!searchQuery) return true;
    const name = vendor.company_name || vendor.company_name_ar || '';
    const email = vendor.contact_email || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Stats
  const stats = {
    total: vendors.length,
    verified: vendors.filter(v => v.kyc_status === 'approved').length,
    pending: vendors.filter(v => v.kyc_status === 'pending' || v.kyc_status === 'under_review').length,
    premium: vendors.filter(v => v.subscription_plan === 'pro' || v.subscription_plan === 'enterprise').length,
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

  const getPlanBadge = (plan: string | null) => {
    switch (plan) {
      case 'enterprise':
        return <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">Enterprise</Badge>;
      case 'pro':
        return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">Pro</Badge>;
      default:
        return <Badge variant="outline">Basic</Badge>;
    }
  };

  const handleAction = async () => {
    if (selectedVendor) {
      await updateKycStatus(
        selectedVendor.id, 
        actionType === 'approve' ? 'approved' : 'rejected',
        notes
      );
      setActionDialogOpen(false);
      setSelectedVendor(null);
      setNotes('');
    }
  };

  const handleSuspend = async () => {
    if (selectedVendor) {
      await suspendVendor(selectedVendor.id, suspensionReason);
      setSuspendDialogOpen(false);
      setSelectedVendor(null);
      setSuspensionReason('');
    }
  };

  const handleUnsuspend = async (vendor: any) => {
    await unsuspendVendor(vendor.id);
  };

  const openActionDialog = (vendor: any, type: 'approve' | 'reject') => {
    setSelectedVendor(vendor);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const openSuspendDialog = (vendor: any) => {
    setSelectedVendor(vendor);
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
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className={cn('text-xl md:text-2xl font-bold', isRTL && 'font-arabic')}>
                  {isRTL ? 'إدارة الوكلاء' : 'Vendor Management'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'إدارة وكالات السفر' : 'Manage travel agencies'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              title={isRTL ? 'إجمالي الوكلاء' : 'Total Vendors'}
              value={stats.total}
              icon={Building2}
              className="bg-gradient-to-br from-blue-500/10 to-blue-500/5"
            />
            <StatCard
              title={isRTL ? 'موثقين' : 'Verified'}
              value={stats.verified}
              icon={ShieldCheck}
              className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5"
            />
            <StatCard
              title={isRTL ? 'قيد الانتظار' : 'Pending'}
              value={stats.pending}
              icon={Clock}
              className="bg-gradient-to-br from-amber-500/10 to-amber-500/5"
            />
            <StatCard
              title={isRTL ? 'اشتراك مميز' : 'Premium'}
              value={stats.premium}
              icon={CreditCard}
              className="bg-gradient-to-br from-purple-500/10 to-purple-500/5"
            />
          </div>

          {/* Search */}
          <GlassCard className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={isRTL ? 'البحث بالاسم أو البريد...' : 'Search by name or email...'}
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

          {/* Vendors Table */}
          <GlassCard>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                {isRTL ? 'قائمة الوكلاء' : 'Vendors List'}
              </CardTitle>
              <CardDescription>
                {isRTL ? `إجمالي: ${filteredVendors.length} وكيل` : `Total: ${filteredVendors.length} vendors`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-pulse text-muted-foreground">
                    {isRTL ? 'جاري التحميل...' : 'Loading...'}
                  </div>
                </div>
              ) : filteredVendors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">{isRTL ? 'لا يوجد وكلاء' : 'No vendors found'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6 px-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{isRTL ? 'اسم الشركة' : 'Company Name'}</TableHead>
                        <TableHead className="hidden md:table-cell">{isRTL ? 'البريد' : 'Email'}</TableHead>
                        <TableHead className="hidden sm:table-cell">{isRTL ? 'الهاتف' : 'Phone'}</TableHead>
                        <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                        <TableHead className="hidden sm:table-cell">{isRTL ? 'الاشتراك' : 'Plan'}</TableHead>
                        <TableHead className="text-right">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVendors.map((vendor) => (
                        <TableRow key={vendor.id} className="group">
                          <TableCell className="font-medium">
                            <div>
                              <p>{vendor.company_name || vendor.company_name_ar || 'N/A'}</p>
                              <p className="text-xs text-muted-foreground md:hidden">
                                {vendor.contact_email || '-'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{vendor.contact_email || 'N/A'}</TableCell>
                          <TableCell className="hidden sm:table-cell">{vendor.contact_phone || 'N/A'}</TableCell>
                          <TableCell>
                            {getStatusBadge(vendor.kyc_status, vendor.is_suspended)}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {getPlanBadge(vendor.subscription_plan)}
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
                                {vendor.kyc_status === 'pending' || vendor.kyc_status === 'under_review' ? (
                                  <>
                                    <DropdownMenuItem 
                                      onClick={() => openActionDialog(vendor, 'approve')}
                                      className="text-emerald-600"
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      {isRTL ? 'اعتماد' : 'Approve'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => openActionDialog(vendor, 'reject')}
                                      className="text-destructive"
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      {isRTL ? 'رفض' : 'Reject'}
                                    </DropdownMenuItem>
                                  </>
                                ) : null}
                                <DropdownMenuSeparator />
                                {vendor.is_suspended ? (
                                  <DropdownMenuItem onClick={() => handleUnsuspend(vendor)}>
                                    <Check className="h-4 w-4 mr-2" />
                                    {isRTL ? 'إلغاء الإيقاف' : 'Unsuspend'}
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem 
                                    onClick={() => openSuspendDialog(vendor)}
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
                    ? (isRTL ? 'اعتماد الوكيل' : 'Approve Vendor')
                    : (isRTL ? 'رفض الوكيل' : 'Reject Vendor')
                  }
                </DialogTitle>
                <DialogDescription>
                  {selectedVendor?.company_name}
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
                <DialogTitle>{isRTL ? 'إيقاف الوكيل' : 'Suspend Vendor'}</DialogTitle>
                <DialogDescription>
                  {isRTL 
                    ? 'سيتم إيقاف هذا الوكيل ولن يتمكن من استخدام المنصة.'
                    : 'This vendor will be suspended and won\'t be able to use the platform.'}
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
