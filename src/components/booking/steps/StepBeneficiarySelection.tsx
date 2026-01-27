import { useState } from 'react';
import { Plus, User, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const statusColors: Record<BeneficiaryStatus, string> = {
  deceased: 'bg-muted text-muted-foreground',
  sick: 'bg-destructive/10 text-destructive',
  elderly: 'bg-secondary/50 text-secondary-foreground',
  disabled: 'bg-accent/50 text-accent-foreground',
  other: 'bg-primary/10 text-primary',
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
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">
          {isRTL ? 'اختر المستفيد' : 'Select Beneficiary'}
        </h2>
        <p className="text-muted-foreground">
          {isRTL 
            ? 'اختر الشخص الذي ستُؤدى المناسك نيابةً عنه'
            : 'Choose the person on whose behalf the pilgrimage will be performed'}
        </p>
      </div>

      <div className="space-y-4">
        {beneficiaries.map((beneficiary) => {
          const displayName = isRTL && beneficiary.full_name_ar 
            ? beneficiary.full_name_ar 
            : beneficiary.full_name;

          return (
            <Card
              key={beneficiary.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                selected?.id === beneficiary.id
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'hover:border-primary/50'
              )}
              onClick={() => onSelect(beneficiary)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{displayName}</h3>
                      {selected?.id === beneficiary.id && (
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={statusColors[beneficiary.status as BeneficiaryStatus]}>
                        {statusLabels[beneficiary.status as BeneficiaryStatus]}
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

        {/* Add New Beneficiary */}
        <Card
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 border-dashed"
          onClick={() => setIsFormOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-muted text-muted-foreground">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{t.beneficiaries.addNew}</h3>
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? 'أضف مستفيد جديد للقائمة'
                    : 'Add a new beneficiary to your list'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Beneficiary Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t.beneficiaries.addNew}</DialogTitle>
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
