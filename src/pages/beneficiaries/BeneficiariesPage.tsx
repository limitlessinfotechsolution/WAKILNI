import { useState } from 'react';
import { Plus, Users, Search, Heart, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GlassCard, GlassCardContent, StatCard } from '@/components/cards';
import { BeneficiaryForm } from '@/components/beneficiaries/BeneficiaryForm';
import { BeneficiaryCard } from '@/components/beneficiaries/BeneficiaryCard';
import { FloatingActionButton } from '@/components/navigation/FloatingActionButton';
import { EmptyState } from '@/components/feedback';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useBeneficiaries, type Beneficiary } from '@/hooks/useBeneficiaries';
import { useLanguage } from '@/lib/i18n';
import { useDashboardRefresh } from '@/hooks/useDashboardRefresh';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function BeneficiariesPage() {
  const { t, isRTL } = useLanguage();
  const { beneficiaries, isLoading, addBeneficiary, updateBeneficiary, deleteBeneficiary } = useBeneficiaries();
  const { refresh } = useDashboardRefresh();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBeneficiaries = beneficiaries.filter(b => {
    const query = searchQuery.toLowerCase();
    return (
      b.full_name.toLowerCase().includes(query) ||
      b.full_name_ar?.toLowerCase().includes(query) ||
      b.nationality?.toLowerCase().includes(query)
    );
  });

  // Stats
  const deceasedCount = beneficiaries.filter(b => b.status === 'deceased').length;
  const livingCount = beneficiaries.filter(b => b.status !== 'deceased').length;

  const handleOpenForm = (beneficiary?: Beneficiary) => {
    setEditingBeneficiary(beneficiary || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBeneficiary(null);
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...data,
        date_of_birth: data.date_of_birth ? format(data.date_of_birth, 'yyyy-MM-dd') : null,
      };

      if (editingBeneficiary) {
        await updateBeneficiary(editingBeneficiary.id, formattedData);
      } else {
        await addBeneficiary(formattedData);
      }
      handleCloseForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteBeneficiary(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <PullToRefresh onRefresh={refresh} className="h-full">
        <div className="p-4 md:p-6 pb-32">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <h1 className={cn('text-2xl md:text-3xl font-bold', isRTL && 'font-arabic')}>
                  {t.beneficiaries.title}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {isRTL 
                    ? 'إدارة المستفيدين الذين ستُؤدى المناسك نيابةً عنهم'
                    : 'Manage people on whose behalf pilgrimages will be performed'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <StatCard
              title={isRTL ? 'الإجمالي' : 'Total'}
              value={beneficiaries.length}
              icon={Users}
              iconBgColor="bg-primary/10"
            />
            <StatCard
              title={isRTL ? 'أحياء' : 'Living'}
              value={livingCount}
              icon={UserCheck}
              iconBgColor="bg-emerald-500/10"
            />
            <StatCard
              title={isRTL ? 'متوفين' : 'Deceased'}
              value={deceasedCount}
              icon={UserX}
              iconBgColor="bg-purple-500/10"
            />
          </div>

          {/* Search */}
          <GlassCard className="mb-6">
            <GlassCardContent className="p-3">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isRTL ? 'البحث بالاسم أو الجنسية...' : 'Search by name or nationality...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-10 border-0 bg-transparent focus-visible:ring-0"
                />
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Content */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : filteredBeneficiaries.length === 0 ? (
            <EmptyState
              icon={Users}
              title={searchQuery 
                ? (isRTL ? 'لا توجد نتائج' : 'No results found') 
                : t.beneficiaries.noBeneficiaries}
              description={searchQuery 
                ? (isRTL ? 'جرب البحث بكلمات مختلفة' : 'Try a different search term')
                : t.beneficiaries.addFirst}
              action={!searchQuery ? {
                label: t.beneficiaries.addNew,
                onClick: () => handleOpenForm(),
              } : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBeneficiaries.map((beneficiary, index) => (
                <div
                  key={beneficiary.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <BeneficiaryCard
                    beneficiary={beneficiary}
                    onEdit={handleOpenForm}
                    onDelete={setDeletingId}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </PullToRefresh>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon={<Plus className="h-6 w-6" />}
        onClick={() => handleOpenForm()}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className={isRTL ? 'font-arabic' : ''}>
              {editingBeneficiary 
                ? (isRTL ? 'تعديل المستفيد' : 'Edit Beneficiary')
                : t.beneficiaries.addNew}
            </DialogTitle>
            <DialogDescription>
              {isRTL 
                ? 'أدخل معلومات المستفيد الذي ستُؤدى المناسك نيابةً عنه'
                : 'Enter details of the person on whose behalf pilgrimage will be performed'}
            </DialogDescription>
          </DialogHeader>
          <BeneficiaryForm
            beneficiary={editingBeneficiary}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className={isRTL ? 'font-arabic' : ''}>
              {isRTL ? 'هل أنت متأكد؟' : 'Are you sure?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isRTL 
                ? 'سيتم حذف هذا المستفيد نهائياً. لا يمكن التراجع عن هذا الإجراء.'
                : 'This beneficiary will be permanently deleted. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
