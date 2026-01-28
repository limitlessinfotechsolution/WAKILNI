import { useState } from 'react';
import { Heart, DollarSign, Users, TrendingUp, Check, X, ArrowRight, Download } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useDonations } from '@/hooks/useDonations';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StatCard } from '@/components/cards/StatCard';
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/cards/GlassCard';
import { RingChart } from '@/components/data-display/RingChart';
import { cn } from '@/lib/utils';

export default function DonationsPage() {
  const { isRTL } = useLanguage();
  const { 
    donations, 
    charityRequests, 
    isLoading, 
    totalDonated, 
    totalAllocated, 
    availableFunds,
    approveRequest,
    rejectRequest,
    allocateFunds,
  } = useDonations();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [allocateAmount, setAllocateAmount] = useState('');
  const [selectedDonation, setSelectedDonation] = useState('');

  const pendingCount = charityRequests.filter(r => r.status === 'pending').length;
  const allocationPercentage = totalDonated > 0 ? (totalAllocated / totalDonated) * 100 : 0;

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-blue-500">{isRTL ? 'معتمد' : 'Approved'}</Badge>;
      case 'funded':
        return <Badge className="bg-green-500">{isRTL ? 'ممول' : 'Funded'}</Badge>;
      case 'completed':
        return <Badge className="bg-purple-500">{isRTL ? 'مكتمل' : 'Completed'}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{isRTL ? 'مرفوض' : 'Rejected'}</Badge>;
      default:
        return <Badge variant="outline">{isRTL ? 'معلق' : 'Pending'}</Badge>;
    }
  };

  const handleApprove = async () => {
    if (selectedRequest && approvedAmount) {
      await approveRequest(selectedRequest.id, parseFloat(approvedAmount));
      setApproveDialogOpen(false);
      setSelectedRequest(null);
      setApprovedAmount('');
    }
  };

  const handleReject = async () => {
    if (selectedRequest && rejectNotes) {
      await rejectRequest(selectedRequest.id, rejectNotes);
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectNotes('');
    }
  };

  const handleAllocate = async () => {
    if (selectedRequest && selectedDonation && allocateAmount) {
      await allocateFunds(selectedRequest.id, selectedDonation, parseFloat(allocateAmount));
      setAllocateDialogOpen(false);
      setSelectedRequest(null);
      setAllocateAmount('');
      setSelectedDonation('');
    }
  };

  const openApproveDialog = (request: any) => {
    setSelectedRequest(request);
    setApprovedAmount(request.requested_amount.toString());
    setApproveDialogOpen(true);
  };

  const openRejectDialog = (request: any) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  const openAllocateDialog = (request: any) => {
    setSelectedRequest(request);
    setAllocateAmount(request.approved_amount?.toString() || '');
    setAllocateDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <h1 className={cn('text-xl md:text-2xl font-bold', isRTL && 'font-arabic')}>
                {isRTL ? 'التبرعات والصدقات' : 'Donations & Charity'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'إدارة التبرعات وطلبات الصدقة' : 'Manage donations and charity requests'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 me-2" />
            {isRTL ? 'تصدير' : 'Export'}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            title={isRTL ? 'إجمالي التبرعات' : 'Total Donated'}
            value={isLoading ? '...' : `SAR ${totalDonated.toLocaleString()}`}
            icon={DollarSign}
            iconBgColor="bg-emerald-500/10"
          />
          <StatCard
            title={isRTL ? 'المخصص' : 'Allocated'}
            value={isLoading ? '...' : `SAR ${totalAllocated.toLocaleString()}`}
            icon={TrendingUp}
            iconBgColor="bg-blue-500/10"
          />
          <StatCard
            title={isRTL ? 'المتاح' : 'Available'}
            value={isLoading ? '...' : `SAR ${availableFunds.toLocaleString()}`}
            icon={Heart}
            iconBgColor="bg-rose-500/10"
          />
          <StatCard
            title={isRTL ? 'الطلبات المعلقة' : 'Pending Requests'}
            value={isLoading ? '...' : pendingCount.toString()}
            icon={Users}
            iconBgColor="bg-amber-500/10"
          />
        </div>

        {/* Impact Visualization */}
        <GlassCard variant="gradient" className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <RingChart
              value={allocationPercentage}
              size={100}
              strokeWidth={10}
              color="hsl(var(--primary))"
              label={isRTL ? 'مخصص' : 'Allocated'}
            />
            <div className="flex-1 text-center md:text-start">
              <h3 className={cn('text-lg font-semibold mb-2', isRTL && 'font-arabic')}>
                {isRTL ? 'تأثير التبرعات' : 'Donation Impact'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isRTL 
                  ? `تم تخصيص ${allocationPercentage.toFixed(1)}% من التبرعات لمساعدة المحتاجين`
                  : `${allocationPercentage.toFixed(1)}% of donations have been allocated to help those in need`}
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                <div>
                  <span className="text-muted-foreground">{isRTL ? 'عدد المتبرعين:' : 'Total Donors:'}</span>
                  <span className="font-semibold ms-2">{donations.length}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{isRTL ? 'الطلبات المموّلة:' : 'Funded Requests:'}</span>
                  <span className="font-semibold ms-2">
                    {charityRequests.filter(r => r.status === 'funded' || r.status === 'completed').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">{isRTL ? 'نظرة عامة' : 'Overview'}</TabsTrigger>
            <TabsTrigger value="donations">{isRTL ? 'التبرعات' : 'Donations'}</TabsTrigger>
            <TabsTrigger value="requests">{isRTL ? 'الطلبات' : 'Requests'}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard>
                <GlassCardHeader>
                  <h3 className={cn('text-lg font-semibold', isRTL && 'font-arabic')}>
                    {isRTL ? 'أحدث التبرعات' : 'Recent Donations'}
                  </h3>
                </GlassCardHeader>
                <GlassCardContent>
                  {donations.slice(0, 5).map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">
                          {donation.is_anonymous 
                            ? (isRTL ? 'متبرع مجهول' : 'Anonymous Donor')
                            : (donation.donor_name || 'N/A')
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(donation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="font-bold text-emerald-600">
                        SAR {donation.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {donations.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      {isRTL ? 'لا توجد تبرعات بعد' : 'No donations yet'}
                    </p>
                  )}
                </GlassCardContent>
              </GlassCard>

              <GlassCard>
                <GlassCardHeader>
                  <h3 className={cn('text-lg font-semibold', isRTL && 'font-arabic')}>
                    {isRTL ? 'طلبات معلقة' : 'Pending Requests'}
                  </h3>
                </GlassCardHeader>
                <GlassCardContent>
                  {charityRequests.filter(r => r.status === 'pending').slice(0, 5).map((request) => (
                    <div key={request.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">
                          {request.beneficiary?.full_name || request.beneficiary?.full_name_ar || 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {request.service_type} - SAR {request.requested_amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openApproveDialog(request)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openRejectDialog(request)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {charityRequests.filter(r => r.status === 'pending').length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      {isRTL ? 'لا توجد طلبات معلقة' : 'No pending requests'}
                    </p>
                  )}
                </GlassCardContent>
              </GlassCard>
            </div>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations">
            <GlassCard>
              <GlassCardHeader>
                <div className="flex items-center justify-between">
                  <h3 className={cn('text-lg font-semibold', isRTL && 'font-arabic')}>
                    {isRTL ? 'قائمة التبرعات' : 'Donations List'}
                  </h3>
                  <Badge variant="secondary">
                    {isRTL ? `${donations.length} تبرع` : `${donations.length} donations`}
                  </Badge>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isRTL ? 'المتبرع' : 'Donor'}</TableHead>
                      <TableHead>{isRTL ? 'المبلغ' : 'Amount'}</TableHead>
                      <TableHead>{isRTL ? 'المخصص' : 'Allocated'}</TableHead>
                      <TableHead>{isRTL ? 'المتبقي' : 'Remaining'}</TableHead>
                      <TableHead>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donations.map((donation) => (
                      <TableRow key={donation.id} className="group hover:bg-muted/50">
                        <TableCell>
                          {donation.is_anonymous 
                            ? (isRTL ? 'متبرع مجهول' : 'Anonymous')
                            : (donation.donor_name || donation.donor_email || 'N/A')
                          }
                        </TableCell>
                        <TableCell className="font-medium">
                          SAR {donation.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          SAR {(donation.allocated_amount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          SAR {(donation.amount - (donation.allocated_amount || 0)).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(donation.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </GlassCardContent>
            </GlassCard>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests">
            <GlassCard>
              <GlassCardHeader>
                <div className="flex items-center justify-between">
                  <h3 className={cn('text-lg font-semibold', isRTL && 'font-arabic')}>
                    {isRTL ? 'طلبات الصدقة' : 'Charity Requests'}
                  </h3>
                  <Badge variant="secondary">
                    {isRTL ? `${charityRequests.length} طلب` : `${charityRequests.length} requests`}
                  </Badge>
                </div>
              </GlassCardHeader>
              <GlassCardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isRTL ? 'المستفيد' : 'Beneficiary'}</TableHead>
                      <TableHead>{isRTL ? 'نوع الخدمة' : 'Service'}</TableHead>
                      <TableHead>{isRTL ? 'المبلغ المطلوب' : 'Requested'}</TableHead>
                      <TableHead>{isRTL ? 'المعتمد' : 'Approved'}</TableHead>
                      <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead className="text-right">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {charityRequests.map((request) => (
                      <TableRow key={request.id} className="group hover:bg-muted/50">
                        <TableCell>
                          {request.beneficiary?.full_name || request.beneficiary?.full_name_ar || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.service_type}</Badge>
                        </TableCell>
                        <TableCell>SAR {request.requested_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          {request.approved_amount 
                            ? `SAR ${request.approved_amount.toLocaleString()}`
                            : '-'
                          }
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          {request.status === 'pending' && (
                            <div className="flex gap-2 justify-end">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openApproveDialog(request)}
                              >
                                <Check className="h-4 w-4 me-1" />
                                {isRTL ? 'اعتماد' : 'Approve'}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openRejectDialog(request)}
                              >
                                <X className="h-4 w-4 me-1" />
                                {isRTL ? 'رفض' : 'Reject'}
                              </Button>
                            </div>
                          )}
                          {request.status === 'approved' && (
                            <Button 
                              size="sm"
                              onClick={() => openAllocateDialog(request)}
                            >
                              <ArrowRight className="h-4 w-4 me-1" />
                              {isRTL ? 'تخصيص' : 'Allocate'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </GlassCardContent>
            </GlassCard>
          </TabsContent>
        </Tabs>

        {/* Approve Dialog */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isRTL ? 'اعتماد الطلب' : 'Approve Request'}</DialogTitle>
              <DialogDescription>
                {isRTL ? 'حدد المبلغ المعتمد' : 'Specify the approved amount'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'المبلغ المعتمد (SAR)' : 'Approved Amount (SAR)'}</Label>
                <Input
                  type="number"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleApprove} disabled={!approvedAmount}>
                {isRTL ? 'اعتماد' : 'Approve'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isRTL ? 'رفض الطلب' : 'Reject Request'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'سبب الرفض' : 'Rejection Reason'}</Label>
                <Textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder={isRTL ? 'أدخل سبب الرفض...' : 'Enter rejection reason...'}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={!rejectNotes}>
                {isRTL ? 'رفض' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Allocate Dialog */}
        <Dialog open={allocateDialogOpen} onOpenChange={setAllocateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isRTL ? 'تخصيص الأموال' : 'Allocate Funds'}</DialogTitle>
              <DialogDescription>
                {isRTL ? 'حدد التبرع ومبلغ التخصيص' : 'Select the donation and allocation amount'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'التبرع' : 'Donation'}</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedDonation}
                  onChange={(e) => setSelectedDonation(e.target.value)}
                >
                  <option value="">{isRTL ? 'اختر تبرعاً...' : 'Select a donation...'}</option>
                  {donations.filter(d => (d.amount - (d.allocated_amount || 0)) > 0).map(d => (
                    <option key={d.id} value={d.id}>
                      {d.donor_name || (isRTL ? 'مجهول' : 'Anonymous')} - 
                      SAR {(d.amount - (d.allocated_amount || 0)).toLocaleString()} {isRTL ? 'متاح' : 'available'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'المبلغ (SAR)' : 'Amount (SAR)'}</Label>
                <Input
                  type="number"
                  value={allocateAmount}
                  onChange={(e) => setAllocateAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAllocateDialogOpen(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleAllocate} disabled={!selectedDonation || !allocateAmount}>
                {isRTL ? 'تخصيص' : 'Allocate'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
