import { useState } from 'react';
import { format } from 'date-fns';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Building2, 
  FileText,
  Eye,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAdminProviders } from '@/hooks/useAdminProviders';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type KycStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

const statusConfig: Record<KycStatus, { icon: any; color: string; bgColor: string; label: string; labelAr: string }> = {
  pending: { 
    icon: Clock, 
    color: 'text-muted-foreground', 
    bgColor: 'bg-muted',
    label: 'Pending',
    labelAr: 'معلق'
  },
  under_review: { 
    icon: AlertCircle, 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    label: 'Under Review',
    labelAr: 'قيد المراجعة'
  },
  approved: { 
    icon: CheckCircle, 
    color: 'text-green-600', 
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    label: 'Approved',
    labelAr: 'معتمد'
  },
  rejected: { 
    icon: XCircle, 
    color: 'text-red-600', 
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    label: 'Rejected',
    labelAr: 'مرفوض'
  },
};

export default function KycQueuePage() {
  const { t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('under_review');
  const { providers, isLoading, updateKycStatus } = useAdminProviders(
    activeTab === 'all' ? undefined : activeTab as KycStatus
  );
  
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const handleApprove = async (providerId: string) => {
    setIsApproving(true);
    await updateKycStatus(providerId, 'approved');
    setIsApproving(false);
    setSelectedProvider(null);
  };

  const handleReject = async () => {
    if (!selectedProvider) return;
    setIsRejecting(true);
    await updateKycStatus(selectedProvider.id, 'rejected', rejectionNotes);
    setIsRejecting(false);
    setShowRejectDialog(false);
    setSelectedProvider(null);
    setRejectionNotes('');
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'P';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isRTL ? 'font-arabic' : ''}`}>
            {t.admin.kycQueue}
          </h1>
          <p className="text-muted-foreground">
            {isRTL 
              ? 'مراجعة والموافقة على طلبات التحقق من مقدمي الخدمات'
              : 'Review and approve provider verification applications'}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(['pending', 'under_review', 'approved', 'rejected'] as KycStatus[]).map((status) => {
            const config = statusConfig[status];
            const StatusIcon = config.icon;
            const count = providers.filter(p => p.kyc_status === status).length;
            
            return (
              <Card 
                key={status} 
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  activeTab === status && 'ring-2 ring-primary'
                )}
                onClick={() => setActiveTab(status)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? config.labelAr : config.label}
                      </p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                    <div className={cn('p-2 rounded-full', config.bgColor)}>
                      <StatusIcon className={cn('h-5 w-5', config.color)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="under_review">
              {isRTL ? 'قيد المراجعة' : 'Under Review'}
            </TabsTrigger>
            <TabsTrigger value="pending">
              {isRTL ? 'معلق' : 'Pending'}
            </TabsTrigger>
            <TabsTrigger value="approved">
              {isRTL ? 'معتمد' : 'Approved'}
            </TabsTrigger>
            <TabsTrigger value="rejected">
              {isRTL ? 'مرفوض' : 'Rejected'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : providers.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-1">
                  {isRTL ? 'لا توجد طلبات' : 'No Applications'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? 'لا توجد طلبات في هذه الفئة حالياً'
                    : 'No applications in this category at the moment'}
                </p>
              </div>
            ) : (
              providers.map((provider) => {
                const config = statusConfig[provider.kyc_status as KycStatus];
                const StatusIcon = config.icon;
                const displayName = isRTL 
                  ? provider.company_name_ar || provider.company_name
                  : provider.company_name;
                const ownerName = isRTL
                  ? provider.profile?.full_name_ar || provider.profile?.full_name
                  : provider.profile?.full_name;

                return (
                  <Card key={provider.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={provider.profile?.avatar_url || undefined} />
                            <AvatarFallback>
                              {getInitials(displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{displayName || 'Unnamed Provider'}</h3>
                              <Badge className={cn('text-xs', config.bgColor, config.color)}>
                                {isRTL ? config.labelAr : config.label}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              {ownerName && (
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  <span>{ownerName}</span>
                                </div>
                              )}
                              {provider.kyc_submitted_at && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    {isRTL ? 'تقديم: ' : 'Submitted: '}
                                    {format(new Date(provider.kyc_submitted_at), 'PP')}
                                  </span>
                                </div>
                              )}
                            </div>

                            {provider.bio && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                {isRTL ? provider.bio_ar || provider.bio : provider.bio}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedProvider(provider)}
                          >
                            <Eye className="me-2 h-4 w-4" />
                            {t.common.view}
                          </Button>
                          
                          {provider.kyc_status === 'under_review' && (
                            <>
                              <Button 
                                size="sm"
                                onClick={() => handleApprove(provider.id)}
                                disabled={isApproving}
                              >
                                <CheckCircle className="me-2 h-4 w-4" />
                                {isRTL ? 'موافقة' : 'Approve'}
                              </Button>
                              <Button 
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedProvider(provider);
                                  setShowRejectDialog(true);
                                }}
                              >
                                <XCircle className="me-2 h-4 w-4" />
                                {isRTL ? 'رفض' : 'Reject'}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {provider.kyc_notes && provider.kyc_status === 'rejected' && (
                        <div className="mt-4 p-3 bg-destructive/10 rounded-lg text-sm">
                          <span className="font-medium text-destructive">
                            {isRTL ? 'سبب الرفض: ' : 'Rejection reason: '}
                          </span>
                          {provider.kyc_notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        {/* Provider Detail Dialog */}
        <Dialog open={!!selectedProvider && !showRejectDialog} onOpenChange={() => setSelectedProvider(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'تفاصيل مقدم الخدمة' : 'Provider Details'}
              </DialogTitle>
            </DialogHeader>
            {selectedProvider && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'اسم الشركة (إنجليزي)' : 'Company Name (English)'}
                    </p>
                    <p className="font-medium">{selectedProvider.company_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'اسم الشركة (عربي)' : 'Company Name (Arabic)'}
                    </p>
                    <p className="font-medium font-arabic" dir="rtl">
                      {selectedProvider.company_name_ar || '-'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {isRTL ? 'نبذة' : 'Bio'}
                  </p>
                  <p className="text-sm">{selectedProvider.bio || '-'}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {isRTL ? 'الشهادات' : 'Certifications'}
                  </p>
                  {Array.isArray(selectedProvider.certifications) && selectedProvider.certifications.length > 0 ? (
                    <div className="space-y-2">
                      {selectedProvider.certifications.map((cert: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 p-2 border rounded">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{cert.name || `Certificate ${idx + 1}`}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'لا توجد شهادات مرفوعة' : 'No certifications uploaded'}
                    </p>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedProvider(null)}>
                {t.common.close}
              </Button>
              {selectedProvider?.kyc_status === 'under_review' && (
                <>
                  <Button onClick={() => handleApprove(selectedProvider.id)} disabled={isApproving}>
                    <CheckCircle className="me-2 h-4 w-4" />
                    {isRTL ? 'موافقة' : 'Approve'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <XCircle className="me-2 h-4 w-4" />
                    {isRTL ? 'رفض' : 'Reject'}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'رفض الطلب' : 'Reject Application'}
              </DialogTitle>
              <DialogDescription>
                {isRTL 
                  ? 'أدخل سبب الرفض ليتم إرساله إلى مقدم الخدمة'
                  : 'Enter the rejection reason to be sent to the provider'}
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder={isRTL ? 'سبب الرفض...' : 'Rejection reason...'}
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              rows={4}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                {t.common.cancel}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={isRejecting || !rejectionNotes.trim()}
              >
                {isRTL ? 'تأكيد الرفض' : 'Confirm Rejection'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
