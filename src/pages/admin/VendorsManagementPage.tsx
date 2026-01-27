import { useState } from 'react';
import { Search, Building2, Check, X, Ban, MoreHorizontal, Eye } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { useAdminVendors } from '@/hooks/useAdminVendors';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

type KycStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

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
  const { vendors, isLoading, updateKycStatus, suspendVendor, unsuspendVendor } = useAdminVendors(kycFilter);

  const filteredVendors = vendors.filter(vendor => {
    if (!searchQuery) return true;
    const name = vendor.company_name || vendor.company_name_ar || '';
    const email = vendor.contact_email || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getStatusBadge = (status: KycStatus | null, isSuspended: boolean | null) => {
    if (isSuspended) {
      return <Badge variant="destructive">{isRTL ? 'موقوف' : 'Suspended'}</Badge>;
    }
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">{isRTL ? 'معتمد' : 'Approved'}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{isRTL ? 'مرفوض' : 'Rejected'}</Badge>;
      case 'under_review':
        return <Badge variant="secondary">{isRTL ? 'قيد المراجعة' : 'Under Review'}</Badge>;
      default:
        return <Badge variant="outline">{isRTL ? 'معلق' : 'Pending'}</Badge>;
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

  return (
    <MainLayout>
      <div className="container py-8 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'إدارة الوكلاء' : 'Vendor Management'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isRTL ? 'إدارة وكالات السفر' : 'Manage travel agencies'}
            </p>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={isRTL ? 'البحث بالاسم أو البريد...' : 'Search by name or email...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="all">{isRTL ? 'الكل' : 'All'}</TabsTrigger>
            <TabsTrigger value="pending">{isRTL ? 'معلق' : 'Pending'}</TabsTrigger>
            <TabsTrigger value="under_review">{isRTL ? 'قيد المراجعة' : 'Under Review'}</TabsTrigger>
            <TabsTrigger value="approved">{isRTL ? 'معتمد' : 'Approved'}</TabsTrigger>
            <TabsTrigger value="rejected">{isRTL ? 'مرفوض' : 'Rejected'}</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
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
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Building2 className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">
                      {isRTL ? 'لا يوجد وكلاء' : 'No vendors found'}
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{isRTL ? 'اسم الشركة' : 'Company Name'}</TableHead>
                        <TableHead>{isRTL ? 'البريد' : 'Email'}</TableHead>
                        <TableHead>{isRTL ? 'الهاتف' : 'Phone'}</TableHead>
                        <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                        <TableHead>{isRTL ? 'الاشتراك' : 'Plan'}</TableHead>
                        <TableHead className="text-right">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVendors.map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell className="font-medium">
                            {vendor.company_name || vendor.company_name_ar || 'N/A'}
                          </TableCell>
                          <TableCell>{vendor.contact_email || 'N/A'}</TableCell>
                          <TableCell>{vendor.contact_phone || 'N/A'}</TableCell>
                          <TableCell>
                            {getStatusBadge(vendor.kyc_status, vendor.is_suspended)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{vendor.subscription_plan || 'basic'}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
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
                                      className="text-green-600"
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
    </MainLayout>
  );
}
