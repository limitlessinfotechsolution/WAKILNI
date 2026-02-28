import { useState, useEffect } from 'react';
import { Shield, Check, X, Loader2, Search, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/cards/GlassCard';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface PendingService {
  id: string;
  title: string;
  title_ar: string | null;
  service_type: string;
  price: number;
  currency: string | null;
  description: string | null;
  created_at: string;
  moderation_status: string | null;
  provider: { company_name: string | null } | null;
}

export default function ServiceModerationPage() {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<PendingService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; serviceId: string | null }>({ open: false, serviceId: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPendingServices = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('id, title, title_ar, service_type, price, currency, description, created_at, moderation_status, provider:providers(company_name)')
      .eq('moderation_status', 'pending')
      .order('created_at', { ascending: true });

    if (!error && data) {
      setServices(data as unknown as PendingService[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPendingServices();
  }, []);

  const handleApprove = async (serviceId: string) => {
    setActionLoading(serviceId);
    const { error } = await supabase
      .from('services')
      .update({
        moderation_status: 'approved',
        moderated_by: user?.id,
        moderated_at: new Date().toISOString(),
      })
      .eq('id', serviceId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to approve service', variant: 'destructive' });
    } else {
      toast({ title: isRTL ? 'تمت الموافقة' : 'Approved', description: isRTL ? 'تمت الموافقة على الخدمة' : 'Service has been approved' });
      await fetchPendingServices();
    }
    setActionLoading(null);
  };

  const handleReject = async () => {
    if (!rejectDialog.serviceId) return;
    setActionLoading(rejectDialog.serviceId);
    const { error } = await supabase
      .from('services')
      .update({
        moderation_status: 'rejected',
        moderated_by: user?.id,
        moderated_at: new Date().toISOString(),
        rejection_reason: rejectionReason || null,
      })
      .eq('id', rejectDialog.serviceId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to reject service', variant: 'destructive' });
    } else {
      toast({ title: isRTL ? 'تم الرفض' : 'Rejected', description: isRTL ? 'تم رفض الخدمة' : 'Service has been rejected' });
      await fetchPendingServices();
    }
    setActionLoading(null);
    setRejectDialog({ open: false, serviceId: null });
    setRejectionReason('');
  };

  const filtered = services.filter(s =>
    !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.provider?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-4 pb-32">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={cn('text-2xl font-bold flex items-center gap-2', isRTL && 'font-arabic')}>
              <Shield className="h-6 w-6 text-primary" />
              {isRTL ? 'مراجعة الخدمات' : 'Service Moderation'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isRTL ? `${services.length} خدمة بانتظار المراجعة` : `${services.length} services pending review`}
            </p>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isRTL ? 'بحث...' : 'Search services...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="ps-10"
          />
        </div>

        <GlassCard>
          <GlassCardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">{isRTL ? 'لا توجد خدمات بانتظار المراجعة' : 'No services pending moderation'}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? 'الخدمة' : 'Service'}</TableHead>
                    <TableHead>{isRTL ? 'مقدم الخدمة' : 'Provider'}</TableHead>
                    <TableHead>{isRTL ? 'النوع' : 'Type'}</TableHead>
                    <TableHead>{isRTL ? 'السعر' : 'Price'}</TableHead>
                    <TableHead>{isRTL ? 'التاريخ' : 'Submitted'}</TableHead>
                    <TableHead className="text-end">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(service => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{isRTL && service.title_ar ? service.title_ar : service.title}</p>
                          {service.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{service.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{service.provider?.company_name || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-xs">{service.service_type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {service.currency || 'SAR'} {service.price.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(service.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="gap-1"
                            disabled={actionLoading === service.id}
                            onClick={() => handleApprove(service.id)}
                          >
                            {actionLoading === service.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                            {isRTL ? 'قبول' : 'Approve'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1"
                            disabled={actionLoading === service.id}
                            onClick={() => setRejectDialog({ open: true, serviceId: service.id })}
                          >
                            <X className="h-3 w-3" />
                            {isRTL ? 'رفض' : 'Reject'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </GlassCardContent>
        </GlassCard>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={open => { if (!open) setRejectDialog({ open: false, serviceId: null }); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'سبب الرفض' : 'Rejection Reason'}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder={isRTL ? 'اكتب سبب رفض الخدمة...' : 'Enter the reason for rejecting this service...'}
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, serviceId: null })}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!!actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : null}
              {isRTL ? 'تأكيد الرفض' : 'Confirm Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
