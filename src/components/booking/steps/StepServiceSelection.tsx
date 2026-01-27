import { Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

interface StepServiceSelectionProps {
  selected: 'umrah' | 'hajj' | 'ziyarat' | null;
  onSelect: (type: 'umrah' | 'hajj' | 'ziyarat') => void;
}

const serviceTypes = [
  {
    id: 'umrah' as const,
    titleEn: 'Umrah',
    titleAr: 'عمرة',
    descriptionEn: 'The lesser pilgrimage that can be performed at any time of year',
    descriptionAr: 'العمرة التي يمكن أداؤها في أي وقت من السنة',
    icon: '🕋',
  },
  {
    id: 'hajj' as const,
    titleEn: 'Hajj',
    titleAr: 'حج',
    descriptionEn: 'The major pilgrimage performed during Dhul Hijjah',
    descriptionAr: 'الحج الأكبر الذي يُؤدى في شهر ذي الحجة',
    icon: '🕌',
  },
  {
    id: 'ziyarat' as const,
    titleEn: 'Ziyarat',
    titleAr: 'زيارة',
    descriptionEn: 'Visit to holy sites in Medina and surrounding areas',
    descriptionAr: 'زيارة المواقع المقدسة في المدينة المنورة والمناطق المحيطة',
    icon: '🌙',
  },
];

export function StepServiceSelection({ selected, onSelect }: StepServiceSelectionProps) {
  const { t, isRTL } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">
          {isRTL ? 'اختر نوع الخدمة' : 'Choose Service Type'}
        </h2>
        <p className="text-muted-foreground">
          {isRTL 
            ? 'حدد نوع المنسك الذي تريد حجزه'
            : 'Select the type of pilgrimage you want to book'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {serviceTypes.map((service) => (
          <Card
            key={service.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-lg relative overflow-hidden',
              selected === service.id
                ? 'border-primary ring-2 ring-primary ring-offset-2'
                : 'hover:border-primary/50'
            )}
            onClick={() => onSelect(service.id)}
          >
            {selected === service.id && (
              <div className="absolute top-3 end-3 bg-primary text-primary-foreground rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}
            <CardContent className="pt-8 pb-6 text-center">
              <div className="text-5xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-2">
                {isRTL ? service.titleAr : service.titleEn}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isRTL ? service.descriptionAr : service.descriptionEn}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
