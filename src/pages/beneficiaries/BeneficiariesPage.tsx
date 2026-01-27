import { useState } from 'react';
import { Plus, Users, Search } from 'lucide-react';
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
import { MainLayout } from '@/components/layout';
import { BeneficiaryForm } from '@/components/beneficiaries/BeneficiaryForm';
import { BeneficiaryCard } from '@/components/beneficiaries/BeneficiaryCard';
import { useBeneficiaries, type Beneficiary } from '@/hooks/useBeneficiaries';
import { useLanguage } from '@/lib/i18n';
import { format } from 'date-fns';

export default function BeneficiariesPage() {
  const { t, isRTL } = useLanguage();
  const { beneficiaries, isLoading, addBeneficiary, updateBeneficiary, deleteBeneficiary } = useBeneficiaries();
  
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
    <MainLayout>
      <div className="container py-8 px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isRTL ? 'font-arabic' : ''}`}>
              {t.beneficiaries.title}
            </h1>
            <p className="text-muted-foreground">
              {isRTL 
                ? 'إدارة المستفيدين الذين ستُؤدى المناسك نيابةً عنهم'
                : 'Manage people on whose behalf pilgrimages will be performed'}
            </p>
          </div>
          <Button onClick={() => handleOpenForm()} className="gap-2">
            <Plus className="h-4 w-4" />
            {t.beneficiaries.addNew}
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={isRTL ? 'البحث بالاسم أو الجنسية...' : 'Search by name or nationality...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-10"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredBeneficiaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">
              {searchQuery ? (isRTL ? 'لا توجد نتائج' : 'No results found') : t.beneficiaries.noBeneficiaries}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? (isRTL ? 'جرب البحث بكلمات مختلفة' : 'Try a different search term')
                : t.beneficiaries.addFirst}
            </p>
            {!searchQuery && (
              <Button onClick={() => handleOpenForm()} className="gap-2">
                <Plus className="h-4 w-4" />
                {t.beneficiaries.addNew}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBeneficiaries.map((beneficiary) => (
              <BeneficiaryCard
                key={beneficiary.id}
                beneficiary={beneficiary}
                onEdit={handleOpenForm}
                onDelete={setDeletingId}
              />
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
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
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isRTL ? 'هل أنت متأكد؟' : 'Are you sure?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isRTL 
                  ? 'سيتم حذف هذا المستفيد نهائياً. لا يمكن التراجع عن هذا الإجراء.'
                  : 'This beneficiary will be permanently deleted. This action cannot be undone.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t.common.delete}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
