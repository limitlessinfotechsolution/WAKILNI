import { useState } from 'react';
import { Plus, Package, MoreVertical, Edit, Trash2, Eye, EyeOff, DollarSign, Star, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/cards';
import { StatCard } from '@/components/cards';
import { FloatingActionButton } from '@/components/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DashboardLayout } from '@/components/layout';
import { ServiceForm } from '@/components/provider/ServiceForm';
import { useProviderServices, type Service, type ServiceType } from '@/hooks/useProviderServices';
import { useProvider } from '@/hooks/useProvider';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';

const serviceTypeConfig: Record<ServiceType, { icon: string; color: string }> = {
  umrah: { icon: '🕋', color: 'bg-primary/10 text-primary' },
  hajj: { icon: '🕌', color: 'bg-secondary/10 text-secondary' },
  ziyarat: { icon: '🌙', color: 'bg-accent/10 text-accent-foreground' },
};

export default function ServicesPage() {
  const { t, isRTL } = useLanguage();
  const { provider, isLoading: isProviderLoading } = useProvider();
  const { services, isLoading, addService, updateService, deleteService, toggleServiceActive, refetch } = useProviderServices();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats
  const stats = {
    total: services.length,
    active: services.filter(s => s.is_active).length,
    avgPrice: services.length > 0 ? Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length) : 0,
  };

  const handleOpenForm = (service?: Service) => {
    setEditingService(service || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingService(null);
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingService) {
        await updateService(editingService.id, data);
      } else {
        await addService(data);
      }
      handleCloseForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteService(deletingId);
      setDeletingId(null);
    }
  };

  const formatPrice = (price: number, currency: string | null) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: currency || 'SAR',
    }).format(price);
  };

  const serviceTypeLabels: Record<ServiceType, string> = {
    umrah: t.services.umrah,
    hajj: t.services.hajj,
    ziyarat: t.services.ziyarat,
  };

  // Check if provider is approved
  const isApproved = provider?.kyc_status === 'approved';

  if (isProviderLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-muted-foreground">{t.common.loading}</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isApproved) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {isRTL ? 'التحقق مطلوب' : 'Verification Required'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {isRTL 
                ? 'يجب إكمال التحقق من حسابك قبل إضافة الخدمات'
                : 'You need to complete account verification before adding services'}
            </p>
            <Button asChild>
              <a href="/provider/kyc">
                {isRTL ? 'إكمال التحقق' : 'Complete Verification'}
              </a>
            </Button>
          </GlassCard>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PullToRefresh onRefresh={() => { refetch(); return Promise.resolve(); }} className="h-full">
        <div className="p-4 md:p-6 space-y-5 md:space-y-6">
          {/* Header - Premium styling */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative p-3 md:p-4 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-xl shadow-amber-500/25">
                <Package className="h-6 w-6 md:h-7 md:w-7" />
                <div className="absolute inset-0 rounded-2xl bg-amber-500 blur-xl opacity-40 -z-10" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="text-[10px] h-5 px-2 font-bold border-0 text-white bg-gradient-to-r from-amber-500 to-orange-500">
                    <Star className="h-2.5 w-2.5 mr-1" />
                    {isRTL ? 'مقدم خدمة' : 'Provider'}
                  </Badge>
                </div>
                <h1 className={cn('text-xl md:text-2xl font-bold', isRTL && 'font-arabic')}>
                  {isRTL ? 'خدماتي' : 'My Services'}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {isRTL 
                    ? 'إدارة خدمات الحج والعمرة التي تقدمها'
                    : 'Manage your pilgrimage service offerings'}
                </p>
              </div>
            </div>
            
            {/* Desktop Add Button */}
            <Button onClick={() => handleOpenForm()} className="hidden md:flex gap-2 rounded-xl shadow-md">
              <Plus className="h-4 w-4" />
              {isRTL ? 'إضافة خدمة' : 'Add Service'}
            </Button>
          </div>

          {/* Stats - Enhanced design */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <GlassCard className="p-4 text-center">
              <div className="inline-flex p-2.5 rounded-xl bg-blue-500/10 mb-2">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl md:text-3xl font-bold">{stats.total}</p>
              <p className="text-[11px] text-muted-foreground font-medium">
                {isRTL ? 'إجمالي الخدمات' : 'Total Services'}
              </p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="inline-flex p-2.5 rounded-xl bg-emerald-500/10 mb-2">
                <Eye className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-emerald-600">{stats.active}</p>
              <p className="text-[11px] text-muted-foreground font-medium">
                {isRTL ? 'نشطة' : 'Active'}
              </p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="inline-flex p-2.5 rounded-xl bg-amber-500/10 mb-2">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-amber-600">{stats.avgPrice}</p>
              <p className="text-[11px] text-muted-foreground font-medium">
                {isRTL ? 'متوسط السعر' : 'Avg Price'} <span className="text-[9px]">SAR</span>
              </p>
            </GlassCard>
          </div>

          {/* Services List */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-1">
                {isRTL ? 'لا توجد خدمات' : 'No Services Yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isRTL ? 'أضف خدمتك الأولى للبدء' : 'Add your first service to get started'}
              </p>
              <Button onClick={() => handleOpenForm()} className="gap-2">
                <Plus className="h-4 w-4" />
                {isRTL ? 'إضافة خدمة' : 'Add Service'}
              </Button>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => {
                const config = serviceTypeConfig[service.service_type as ServiceType];
                
                return (
                  <GlassCard 
                    key={service.id} 
                    className={cn(
                      'hover:shadow-lg transition-all active:scale-[0.98]',
                      !service.is_active && 'opacity-60'
                    )}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn('text-3xl p-2 rounded-lg', config.color)}>
                            {config.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {isRTL ? service.title_ar || service.title : service.title}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {serviceTypeLabels[service.service_type as ServiceType]}
                            </Badge>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenForm(service)}>
                              <Edit className="h-4 w-4 me-2" />
                              {t.common.edit}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => toggleServiceActive(service.id, !service.is_active)}
                            >
                              {service.is_active ? (
                                <>
                                  <EyeOff className="h-4 w-4 me-2" />
                                  {isRTL ? 'إخفاء' : 'Deactivate'}
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 me-2" />
                                  {isRTL ? 'تفعيل' : 'Activate'}
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeletingId(service.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 me-2" />
                              {t.common.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {isRTL 
                          ? service.description_ar || service.description
                          : service.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            {formatPrice(service.price, service.currency)}
                          </p>
                          {service.duration_days && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {service.duration_days} {t.services.days}
                            </p>
                          )}
                        </div>
                        <Badge variant={service.is_active ? 'default' : 'secondary'}>
                          {service.is_active 
                            ? (isRTL ? 'نشط' : 'Active')
                            : (isRTL ? 'غير نشط' : 'Inactive')}
                        </Badge>
                      </div>
                    </CardContent>
                  </GlassCard>
                );
              })}
            </div>
          )}

          {/* FAB for mobile */}
          <FloatingActionButton
            icon={<Plus className="h-5 w-5" />}
            onClick={() => handleOpenForm()}
          />

          {/* Add/Edit Dialog */}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingService 
                    ? (isRTL ? 'تعديل الخدمة' : 'Edit Service')
                    : (isRTL ? 'إضافة خدمة جديدة' : 'Add New Service')}
                </DialogTitle>
                <DialogDescription>
                  {isRTL 
                    ? 'أدخل تفاصيل الخدمة التي تقدمها'
                    : 'Enter the details of your service offering'}
                </DialogDescription>
              </DialogHeader>
              <ServiceForm
                service={editingService}
                onSubmit={handleSubmit}
                onCancel={handleCloseForm}
                isSubmitting={isSubmitting}
              />
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation */}
          <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {isRTL ? 'هل أنت متأكد؟' : 'Are you sure?'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {isRTL 
                    ? 'سيتم حذف هذه الخدمة نهائياً. لا يمكن التراجع عن هذا الإجراء.'
                    : 'This service will be permanently deleted. This action cannot be undone.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete} 
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t.common.delete}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </PullToRefresh>
    </DashboardLayout>
  );
}
