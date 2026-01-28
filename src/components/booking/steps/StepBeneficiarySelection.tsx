import { useState } from 'react';
import { Plus, User, Check, Heart, Sparkles, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { useBeneficiaries, type Beneficiary, type BeneficiaryStatus } from '@/hooks/useBeneficiaries';
import { BeneficiaryForm } from '@/components/beneficiaries/BeneficiaryForm';
import { format } from 'date-fns';

interface StepBeneficiarySelectionProps {
  selected: Beneficiary | null;
  onSelect: (beneficiary: Beneficiary) => void;
}

const statusConfig: Record<BeneficiaryStatus, { icon: string; bgColor: string; textColor: string }> = {
  deceased: { icon: '🕊️', bgColor: 'bg-slate-100 dark:bg-slate-800', textColor: 'text-slate-700 dark:text-slate-300' },
  sick: { icon: '🤲', bgColor: 'bg-rose-50 dark:bg-rose-900/20', textColor: 'text-rose-700 dark:text-rose-300' },
  elderly: { icon: '👴', bgColor: 'bg-amber-50 dark:bg-amber-900/20', textColor: 'text-amber-700 dark:text-amber-300' },
  disabled: { icon: '♿', bgColor: 'bg-blue-50 dark:bg-blue-900/20', textColor: 'text-blue-700 dark:text-blue-300' },
  other: { icon: '🙏', bgColor: 'bg-purple-50 dark:bg-purple-900/20', textColor: 'text-purple-700 dark:text-purple-300' },
};

export function StepBeneficiarySelection({ selected, onSelect }: StepBeneficiarySelectionProps) {
  const { t, isRTL } = useLanguage();
  const { beneficiaries, isLoading, addBeneficiary } = useBeneficiaries();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusLabels: Record<BeneficiaryStatus, string> = {
    deceased: t.beneficiaries.deceased,
    sick: t.beneficiaries.sick,
    elderly: t.beneficiaries.elderly,
    disabled: t.beneficiaries.disabled,
    other: t.beneficiaries.other,
  };

  const handleAddBeneficiary = async (data: any) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...data,
        date_of_birth: data.date_of_birth ? format(data.date_of_birth, 'yyyy-MM-dd') : null,
      };
      const newBeneficiary = await addBeneficiary(formattedData);
      if (newBeneficiary) {
        onSelect(newBeneficiary);
        setIsFormOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-primary">
          <Heart className="h-5 w-5" />
          <span className="text-sm font-medium">
            {isRTL ? 'الدعاء للميت ينفعه' : 'Supplication benefits the deceased'}
          </span>
        </div>
        <h2 className="text-2xl font-semibold">
          {isRTL ? 'اختر المستفيد' : 'Select Beneficiary'}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {isRTL 
            ? 'اختر الشخص الذي ستُؤدى المناسك نيابةً عنه'
            : 'Choose the person on whose behalf the pilgrimage will be performed'}
        </p>
      </div>

      <div className="space-y-4">
        {/* Existing Beneficiaries */}
        {beneficiaries.map((beneficiary) => {
          const status = beneficiary.status as BeneficiaryStatus;
          const config = statusConfig[status] || statusConfig.other;
          const displayName = isRTL && beneficiary.full_name_ar 
            ? beneficiary.full_name_ar 
            : beneficiary.full_name;

          return (
            <Card
              key={beneficiary.id}
              className={cn(
                'cursor-pointer transition-all duration-300 hover:shadow-lg overflow-hidden group',
                selected?.id === beneficiary.id
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'hover:border-primary/50'
              )}
              onClick={() => onSelect(beneficiary)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {/* Avatar with status icon */}
                  <div className={cn(
                    'relative p-3 rounded-full transition-colors',
                    selected?.id === beneficiary.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10 text-primary'
                  )}>
                    <User className="h-6 w-6" />
                    <span className="absolute -bottom-1 -end-1 text-lg">
                      {config.icon}
                    </span>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{displayName}</h3>
                      {selected?.id === beneficiary.id && (
                        <div className="bg-primary text-primary-foreground rounded-full p-1 shrink-0">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <Badge className={cn(config.bgColor, config.textColor, 'border-0')}>
                        {config.icon} {statusLabels[status]}
                      </Badge>
                      {beneficiary.nationality && (
                        <span className="text-sm text-muted-foreground">
                          {beneficiary.nationality}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Add New Beneficiary Card */}
        <Card
          className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/50 border-dashed group"
          onClick={() => setIsFormOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {t.beneficiaries.addNew}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? 'أضف مستفيد جديد للقائمة'
                    : 'Add a new beneficiary to your list'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {beneficiaries.length === 0 && (
          <div className="text-center py-8 space-y-3">
            <div className="text-5xl">🤲</div>
            <p className="text-muted-foreground">
              {isRTL 
                ? 'لم تقم بإضافة أي مستفيدين بعد'
                : 'You haven\'t added any beneficiaries yet'}
            </p>
            <Button onClick={() => setIsFormOpen(true)} variant="outline">
              <Plus className="h-4 w-4 me-2" />
              {t.beneficiaries.addNew}
            </Button>
          </div>
        )}
      </div>

      {/* Islamic reminder */}
      <div className="text-center pt-4">
        <p className={cn(
          'text-sm text-muted-foreground',
          isRTL && 'font-arabic'
        )}>
          {isRTL 
            ? '"إِذَا مَاتَ ابْنُ آدَمَ انْقَطَعَ عَمَلُهُ إِلَّا مِنْ ثَلَاثٍ: صَدَقَةٍ جَارِيَةٍ، أَوْ عِلْمٍ يُنْتَفَعُ بِهِ، أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ"'
            : '"When a person dies, their deeds are cut off except for three: ongoing charity, beneficial knowledge, or a righteous child who prays for them"'}
        </p>
      </div>

      {/* Add Beneficiary Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {t.beneficiaries.addNew}
            </DialogTitle>
            <DialogDescription>
              {isRTL 
                ? 'أدخل معلومات المستفيد الجديد'
                : 'Enter the details of the new beneficiary'}
            </DialogDescription>
          </DialogHeader>
          <BeneficiaryForm
            onSubmit={handleAddBeneficiary}
            onCancel={() => setIsFormOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
