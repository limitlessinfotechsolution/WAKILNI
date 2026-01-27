import { User, Calendar, MapPin, Edit, Trash2, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/lib/i18n';
import type { Beneficiary, BeneficiaryStatus } from '@/hooks/useBeneficiaries';

interface BeneficiaryCardProps {
  beneficiary: Beneficiary;
  onEdit: (beneficiary: Beneficiary) => void;
  onDelete: (id: string) => void;
}

const statusColors: Record<BeneficiaryStatus, string> = {
  deceased: 'bg-muted text-muted-foreground',
  sick: 'bg-destructive/10 text-destructive',
  elderly: 'bg-secondary/50 text-secondary-foreground',
  disabled: 'bg-accent/50 text-accent-foreground',
  other: 'bg-primary/10 text-primary',
};

export function BeneficiaryCard({ beneficiary, onEdit, onDelete }: BeneficiaryCardProps) {
  const { t, isRTL } = useLanguage();

  const statusLabels: Record<BeneficiaryStatus, string> = {
    deceased: t.beneficiaries.deceased,
    sick: t.beneficiaries.sick,
    elderly: t.beneficiaries.elderly,
    disabled: t.beneficiaries.disabled,
    other: t.beneficiaries.other,
  };

  const displayName = isRTL && beneficiary.full_name_ar 
    ? beneficiary.full_name_ar 
    : beneficiary.full_name;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <User className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">{displayName}</h3>
              {isRTL && beneficiary.full_name && (
                <p className="text-sm text-muted-foreground">{beneficiary.full_name}</p>
              )}
              {!isRTL && beneficiary.full_name_ar && (
                <p className="text-sm text-muted-foreground font-arabic" dir="rtl">
                  {beneficiary.full_name_ar}
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(beneficiary)}>
                <Edit className="h-4 w-4 me-2" />
                {t.common.edit}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(beneficiary.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 me-2" />
                {t.common.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge className={statusColors[beneficiary.status as BeneficiaryStatus]}>
            {statusLabels[beneficiary.status as BeneficiaryStatus]}
          </Badge>
        </div>

        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          {beneficiary.date_of_birth && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(beneficiary.date_of_birth), 'PP')}</span>
            </div>
          )}
          {beneficiary.nationality && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{beneficiary.nationality}</span>
            </div>
          )}
        </div>

        {beneficiary.status_notes && (
          <p className="mt-3 text-sm text-muted-foreground border-t pt-3">
            {beneficiary.status_notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
