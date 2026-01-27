import { useState } from 'react';
import { Heart, DollarSign, Users, TrendingUp, Check, X, ArrowRight } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { useDonations } from '@/hooks/useDonations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

  const stats = [
    {
      title: isRTL ? 'إجمالي التبرعات' : 'Total Donated',
      value: `SAR ${totalDonated.toLocaleString()}`,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: isRTL ? 'المخصص' : 'Allocated',
      value: `SAR ${totalAllocated.toLocaleString()}`,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: isRTL ? 'المتاح' : 'Available',
      value: `SAR ${availableFunds.toLocaleString()}`,
      icon: <Heart className="h-5 w-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: isRTL ? 'الطلبات المعلقة' : 'Pending Requests',
      value: charityRequests.filter(r => r.status === 'pending').length.toString(),
      icon: <Users className="h-5 w-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

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
    <MainLayout>
      <div className="container py-8 px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${isRTL ? 'font-arabic' : ''}`}>
            {isRTL ? 'التبرعات والصدقات' : 'Donations & Charity'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isRTL ? 'إدارة التبرعات وطلبات الصدقة' : 'Manage donations and charity requests'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                  <div className={`p-1.5 rounded-lg ${stat.bgColor} ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
                <p className="text-xl font-bold">{isLoading ? '...' : stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

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
              <Card>
                <CardHeader>
                  <CardTitle>{isRTL ? 'أحدث التبرعات' : 'Recent Donations'}</CardTitle>
                </CardHeader>
                <CardContent>
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
                      <p className="font-bold text-green-600">
                        SAR {donation.amount.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{isRTL ? 'طلبات معلقة' : 'Pending Requests'}</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations">
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? 'قائمة التبرعات' : 'Donations List'}</CardTitle>
                <CardDescription>
                  {isRTL ? `إجمالي: ${donations.length} تبرع` : `Total: ${donations.length} donations`}
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                      <TableRow key={donation.id}>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>{isRTL ? 'طلبات الصدقة' : 'Charity Requests'}</CardTitle>
                <CardDescription>
                  {isRTL ? `إجمالي: ${charityRequests.length} طلب` : `Total: ${charityRequests.length} requests`}
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                      <TableRow key={request.id}>
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
                                <Check className="h-4 w-4 mr-1" />
                                {isRTL ? 'اعتماد' : 'Approve'}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openRejectDialog(request)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                {isRTL ? 'رفض' : 'Reject'}
                              </Button>
                            </div>
                          )}
                          {request.status === 'approved' && (
                            <Button 
                              size="sm"
                              onClick={() => openAllocateDialog(request)}
                            >
                              <ArrowRight className="h-4 w-4 mr-1" />
                              {isRTL ? 'تخصيص' : 'Allocate'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
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
                {isRTL ? 'اختر تبرعًا لتخصيص الأموال منه' : 'Select a donation to allocate funds from'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'اختر التبرع' : 'Select Donation'}</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={selectedDonation}
                  onChange={(e) => setSelectedDonation(e.target.value)}
                >
                  <option value="">{isRTL ? 'اختر تبرعًا' : 'Select a donation'}</option>
                  {donations
                    .filter(d => (d.amount - (d.allocated_amount || 0)) > 0)
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.donor_name || 'Anonymous'} - SAR {(d.amount - (d.allocated_amount || 0)).toLocaleString()} available
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
    </MainLayout>
  );
}
