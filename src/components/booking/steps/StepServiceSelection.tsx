import { Check, Sparkles, Moon, Star } from 'lucide-react';
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
    taglineEn: '"And perform Umrah for the sake of Allah"',
    taglineAr: '"وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ"',
    icon: '🕋',
    gradient: 'from-emerald-500/10 to-teal-500/10',
    borderActive: 'border-emerald-500',
  },
  {
    id: 'hajj' as const,
    titleEn: 'Hajj',
    titleAr: 'حج',
    descriptionEn: 'The major pilgrimage performed during Dhul Hijjah',
    descriptionAr: 'الحج الأكبر الذي يُؤدى في شهر ذي الحجة',
    taglineEn: '"Hajj is a duty that mankind owes to Allah"',
    taglineAr: '"وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ"',
    icon: '🕌',
    gradient: 'from-amber-500/10 to-orange-500/10',
    borderActive: 'border-amber-500',
  },
  {
    id: 'ziyarat' as const,
    titleEn: 'Ziyarat',
    titleAr: 'زيارة',
    descriptionEn: 'Visit to holy sites in Medina and surrounding areas',
    descriptionAr: 'زيارة المواقع المقدسة في المدينة المنورة والمناطق المحيطة',
    taglineEn: '"A prayer in my Masjid is worth a thousand prayers"',
    taglineAr: '"صَلاةٌ فِي مَسْجِدِي خَيْرٌ مِنْ أَلْفِ صَلاةٍ"',
    icon: '🌙',
    gradient: 'from-violet-500/10 to-purple-500/10',
    borderActive: 'border-violet-500',
  },
];

export function StepServiceSelection({ selected, onSelect }: StepServiceSelectionProps) {
  const { isRTL } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header with Islamic tagline */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-medium">
            {isRTL ? 'بسم الله الرحمن الرحيم' : 'In the name of Allah, the Most Gracious, the Most Merciful'}
          </span>
        </div>
        <h2 className="text-2xl font-semibold">
          {isRTL ? 'اختر نوع الخدمة' : 'Choose Service Type'}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {isRTL 
            ? 'حدد نوع المنسك الذي تريد أداءه نيابة عن أحبائك'
            : 'Select the type of pilgrimage to perform on behalf of your loved ones'}
        </p>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {serviceTypes.map((service) => (
          <Card
            key={service.id}
            className={cn(
              'cursor-pointer transition-all duration-300 hover:shadow-lg relative overflow-hidden group',
              selected === service.id
                ? `${service.borderActive} ring-2 ring-offset-2`
                : 'hover:border-primary/50'
            )}
            onClick={() => onSelect(service.id)}
          >
            {/* Gradient Background */}
            <div className={cn(
              'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300',
              service.gradient,
              selected === service.id && 'opacity-100',
              'group-hover:opacity-100'
            )} />
            
            {/* Selected Checkmark */}
            {selected === service.id && (
              <div className="absolute top-3 end-3 bg-primary text-primary-foreground rounded-full p-1 z-10">
                <Check className="h-4 w-4" />
              </div>
            )}
            
            <CardContent className="pt-8 pb-6 text-center relative z-10">
              {/* Icon */}
              <div className="text-5xl mb-4 transform transition-transform duration-300 group-hover:scale-110">
                {service.icon}
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-semibold mb-2">
                {isRTL ? service.titleAr : service.titleEn}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4">
                {isRTL ? service.descriptionAr : service.descriptionEn}
              </p>
              
              {/* Islamic Quote */}
              <div className={cn(
                'pt-4 border-t border-border/50',
                isRTL ? 'font-arabic' : 'italic'
              )}>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? service.taglineAr : service.taglineEn}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Quote */}
      <div className="text-center pt-4">
        <p className={cn(
          'text-sm text-muted-foreground',
          isRTL && 'font-arabic'
        )}>
          {isRTL 
            ? '"مَنْ حَجَّ فَلَمْ يَرْفُثْ وَلَمْ يَفْسُقْ رَجَعَ كَيَوْمِ وَلَدَتْهُ أُمُّهُ"'
            : '"Whoever performs Hajj and does not commit any obscenity or transgression will return as pure as the day he was born"'}
        </p>
      </div>
    </div>
  );
}
