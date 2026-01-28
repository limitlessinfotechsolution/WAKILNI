import { useState, useEffect } from 'react';
import { 
  Shield, CheckCircle, XCircle, Clock, Eye, User, FileCheck,
  Video, Camera, Calendar, AlertTriangle, Loader2, Search,
  ChevronDown, ChevronUp, Star, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { PilgrimStatus } from '@/hooks/usePilgrimCertification';

interface PilgrimApplication {
  id: string;
  provider_id: string;
  status: PilgrimStatus;
  government_id_url: string | null;
  government_id_verified: boolean;
  photo_verification_url: string | null;
  photo_verified: boolean;
  has_completed_own_umrah: boolean;
  own_umrah_date: string | null;
  has_completed_own_hajj: boolean;
  own_hajj_date: string | null;
  video_oath_url: string | null;
  video_oath_verified: boolean;
  video_oath_transcript: string | null;
  scholar_approved: boolean;
  scholar_notes: string | null;
  trust_score: number;
  violation_count: number;
  submitted_at: string | null;
  created_at: string;
  provider: {
    id: string;
    user_id: string;
    company_name: string | null;
    bio: string | null;
    rating: number | null;
    total_bookings: number | null;
    profile?: {
      full_name: string | null;
      phone: string | null;
    };
  };
}

const statusColors: Record<PilgrimStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  under_review: 'bg-amber-100 text-amber-700',
  verified: 'bg-emerald-100 text-emerald-700',
  suspended: 'bg-red-100 text-red-700',
  inactive: 'bg-gray-100 text-gray-600',
};

export default function ScholarVerificationPage() {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [applications, setApplications] = useState<PilgrimApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('under_review');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<PilgrimApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('pilgrim_certifications')
        .select(`
          *,
          provider:providers!pilgrim_certifications_provider_id_fkey (
            id,
            user_id,
            company_name,
            bio,
            rating,
            total_bookings
          )
        `)
        .order('submitted_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter as PilgrimStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setApplications((data as PilgrimApplication[]) || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch applications',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleApprove = async (app: PilgrimApplication) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('pilgrim_certifications')
        .update({
          status: 'verified',
          scholar_approved: true,
          scholar_id: user?.id,
          scholar_approval_date: new Date().toISOString(),
          scholar_notes: reviewNotes || null,
          verified_at: new Date().toISOString(),
          trust_score: 50, // Starting trust score
        })
        .eq('id', app.id);

      if (error) throw error;

      toast({
        title: isRTL ? 'تمت الموافقة' : 'Approved',
        description: isRTL ? 'تم اعتماد المعتمر بنجاح' : 'Pilgrim has been verified successfully',
      });
      
      setSelectedApp(null);
      setReviewNotes('');
      fetchApplications();
    } catch (error) {
      console.error('Error approving:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve application',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (app: PilgrimApplication) => {
    if (!reviewNotes.trim()) {
      toast({
        title: isRTL ? 'ملاحظات مطلوبة' : 'Notes Required',
        description: isRTL ? 'يرجى إدخال سبب الرفض' : 'Please enter a rejection reason',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('pilgrim_certifications')
        .update({
          status: 'pending',
          scholar_notes: reviewNotes,
        })
        .eq('id', app.id);

      if (error) throw error;

      toast({
        title: isRTL ? 'تم الإرجاع' : 'Returned',
        description: isRTL ? 'تم إرجاع الطلب للمراجعة' : 'Application returned for revision',
      });
      
      setSelectedApp(null);
      setReviewNotes('');
      fetchApplications();
    } catch (error) {
      console.error('Error rejecting:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject application',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuspend = async (app: PilgrimApplication) => {
    if (!reviewNotes.trim()) {
      toast({
        title: isRTL ? 'ملاحظات مطلوبة' : 'Notes Required',
        description: isRTL ? 'يرجى إدخال سبب التعليق' : 'Please enter a suspension reason',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('pilgrim_certifications')
        .update({
          status: 'suspended',
          suspended_at: new Date().toISOString(),
          suspension_reason: reviewNotes,
        })
        .eq('id', app.id);

      if (error) throw error;

      toast({
        title: isRTL ? 'تم التعليق' : 'Suspended',
        description: isRTL ? 'تم تعليق شهادة المعتمر' : 'Pilgrim certification suspended',
      });
      
      setSelectedApp(null);
      setReviewNotes('');
      fetchApplications();
    } catch (error) {
      console.error('Error suspending:', error);
      toast({
        title: 'Error',
        description: 'Failed to suspend',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      app.provider?.company_name?.toLowerCase().includes(searchLower) ||
      app.id.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    pending: applications.filter(a => a.status === 'pending').length,
    under_review: applications.filter(a => a.status === 'under_review').length,
    verified: applications.filter(a => a.status === 'verified').length,
    suspended: applications.filter(a => a.status === 'suspended').length,
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className={cn("text-2xl font-bold", isRTL && "font-arabic")}>
                {isRTL ? 'طابور التحقق من المعتمرين' : 'Scholar Verification Queue'}
              </h1>
              <p className="text-muted-foreground text-sm">
                {isRTL ? 'مراجعة واعتماد طلبات شهادات المعتمرين' : 'Review and approve pilgrim certification applications'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="cursor-pointer hover:border-amber-300 transition-colors" onClick={() => setStatusFilter('under_review')}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <Clock className="h-8 w-8 text-amber-500" />
                <div className="text-right">
                  <div className="text-2xl font-bold">{stats.under_review}</div>
                  <div className="text-xs text-muted-foreground">{isRTL ? 'قيد المراجعة' : 'Under Review'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-muted-foreground transition-colors" onClick={() => setStatusFilter('pending')}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                <div className="text-right">
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <div className="text-xs text-muted-foreground">{isRTL ? 'معلق' : 'Pending'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => setStatusFilter('verified')}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
                <div className="text-right">
                  <div className="text-2xl font-bold">{stats.verified}</div>
                  <div className="text-xs text-muted-foreground">{isRTL ? 'معتمد' : 'Verified'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-red-300 transition-colors" onClick={() => setStatusFilter('suspended')}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <XCircle className="h-8 w-8 text-red-500" />
                <div className="text-right">
                  <div className="text-2xl font-bold">{stats.suspended}</div>
                  <div className="text-xs text-muted-foreground">{isRTL ? 'موقوف' : 'Suspended'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isRTL ? 'بحث...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={isRTL ? 'تصفية بالحالة' : 'Filter by status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                  <SelectItem value="under_review">{isRTL ? 'قيد المراجعة' : 'Under Review'}</SelectItem>
                  <SelectItem value="pending">{isRTL ? 'معلق' : 'Pending'}</SelectItem>
                  <SelectItem value="verified">{isRTL ? 'معتمد' : 'Verified'}</SelectItem>
                  <SelectItem value="suspended">{isRTL ? 'موقوف' : 'Suspended'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {isRTL ? 'لا توجد طلبات' : 'No applications found'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {app.provider?.company_name || (isRTL ? 'مقدم خدمة' : 'Provider')}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>ID: {app.id.slice(0, 8)}</span>
                          {app.provider?.rating && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 me-1" />
                              {app.provider.rating.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Verification Badges */}
                      <Badge variant="outline" className={app.government_id_url ? 'border-emerald-500 text-emerald-600' : ''}>
                        <FileCheck className="h-3 w-3 me-1" />
                        {isRTL ? 'هوية' : 'ID'}
                      </Badge>
                      <Badge variant="outline" className={app.photo_verification_url ? 'border-emerald-500 text-emerald-600' : ''}>
                        <Camera className="h-3 w-3 me-1" />
                        {isRTL ? 'صورة' : 'Photo'}
                      </Badge>
                      <Badge variant="outline" className={app.video_oath_url ? 'border-emerald-500 text-emerald-600' : ''}>
                        <Video className="h-3 w-3 me-1" />
                        {isRTL ? 'فيديو' : 'Video'}
                      </Badge>
                      <Badge variant="outline" className={app.has_completed_own_umrah ? 'border-emerald-500 text-emerald-600' : ''}>
                        <CheckCircle className="h-3 w-3 me-1" />
                        {isRTL ? 'عمرة' : 'Umrah'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[app.status]}>
                        {app.status === 'pending' && (isRTL ? 'معلق' : 'Pending')}
                        {app.status === 'under_review' && (isRTL ? 'قيد المراجعة' : 'Under Review')}
                        {app.status === 'verified' && (isRTL ? 'معتمد' : 'Verified')}
                        {app.status === 'suspended' && (isRTL ? 'موقوف' : 'Suspended')}
                        {app.status === 'inactive' && (isRTL ? 'غير نشط' : 'Inactive')}
                      </Badge>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedApp(app);
                              setReviewNotes('');
                            }}
                          >
                            <Eye className="h-4 w-4 me-1" />
                            {isRTL ? 'مراجعة' : 'Review'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              {isRTL ? 'مراجعة طلب الاعتماد' : 'Review Certification Application'}
                            </DialogTitle>
                            <DialogDescription>
                              {app.provider?.company_name || 'Provider'} - {app.id.slice(0, 8)}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-6 py-4">
                            {/* Documents Section */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h4 className="font-medium flex items-center gap-2">
                                  <FileCheck className="h-4 w-4" />
                                  {isRTL ? 'الهوية الحكومية' : 'Government ID'}
                                </h4>
                                {app.government_id_url ? (
                                  <Badge className="bg-emerald-100 text-emerald-700">
                                    <CheckCircle className="h-3 w-3 me-1" />
                                    {isRTL ? 'تم الرفع' : 'Uploaded'}
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">{isRTL ? 'غير مرفق' : 'Not uploaded'}</Badge>
                                )}
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium flex items-center gap-2">
                                  <Video className="h-4 w-4" />
                                  {isRTL ? 'فيديو النية' : 'Video Oath'}
                                </h4>
                                {app.video_oath_url ? (
                                  <Badge className="bg-emerald-100 text-emerald-700">
                                    <CheckCircle className="h-3 w-3 me-1" />
                                    {isRTL ? 'تم الرفع' : 'Uploaded'}
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">{isRTL ? 'غير مرفق' : 'Not uploaded'}</Badge>
                                )}
                              </div>
                            </div>

                            <Separator />

                            {/* Religious Qualifications */}
                            <div className="space-y-3">
                              <h4 className="font-medium">{isRTL ? 'المؤهلات الدينية' : 'Religious Qualifications'}</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  {app.has_completed_own_umrah ? (
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  <span>{isRTL ? 'أدى العمرة لنفسه' : 'Completed own Umrah'}</span>
                                </div>
                                {app.own_umrah_date && (
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>{new Date(app.own_umrah_date).toLocaleDateString()}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  {app.has_completed_own_hajj ? (
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span>{isRTL ? 'أدى الحج لنفسه' : 'Completed own Hajj'}</span>
                                </div>
                              </div>
                            </div>

                            {app.video_oath_transcript && (
                              <>
                                <Separator />
                                <div className="space-y-2">
                                  <h4 className="font-medium">{isRTL ? 'نص النية' : 'Oath Transcript'}</h4>
                                  <p className="text-sm p-3 bg-muted rounded-lg font-arabic" dir="rtl">
                                    {app.video_oath_transcript}
                                  </p>
                                </div>
                              </>
                            )}

                            <Separator />

                            {/* Review Notes */}
                            <div className="space-y-2">
                              <h4 className="font-medium">{isRTL ? 'ملاحظات المراجعة' : 'Review Notes'}</h4>
                              <Textarea
                                placeholder={isRTL 
                                  ? 'أضف ملاحظاتك هنا (مطلوب للرفض أو التعليق)...'
                                  : 'Add your notes here (required for rejection or suspension)...'}
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                rows={3}
                              />
                            </div>
                          </div>

                          <DialogFooter className="flex-col sm:flex-row gap-2">
                            {app.status !== 'suspended' && (
                              <Button 
                                variant="destructive" 
                                onClick={() => handleSuspend(app)}
                                disabled={isProcessing}
                              >
                                <XCircle className="h-4 w-4 me-2" />
                                {isRTL ? 'تعليق' : 'Suspend'}
                              </Button>
                            )}
                            {(app.status === 'under_review' || app.status === 'pending') && (
                              <>
                                <Button 
                                  variant="outline" 
                                  onClick={() => handleReject(app)}
                                  disabled={isProcessing}
                                >
                                  {isRTL ? 'إرجاع للمراجعة' : 'Return for Revision'}
                                </Button>
                                <Button 
                                  onClick={() => handleApprove(app)}
                                  disabled={isProcessing}
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                  {isProcessing ? (
                                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 me-2" />
                                  )}
                                  {isRTL ? 'اعتماد' : 'Approve'}
                                </Button>
                              </>
                            )}
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {app.submitted_at && (
                    <p className="text-xs text-muted-foreground mt-3">
                      {isRTL ? 'تم التقديم: ' : 'Submitted: '}
                      {new Date(app.submitted_at).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
