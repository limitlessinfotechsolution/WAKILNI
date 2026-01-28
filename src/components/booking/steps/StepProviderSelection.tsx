import { Star, Check, Clock, BadgeCheck, Sparkles, MapPin, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { useServices, type Service, type ServiceType } from '@/hooks/useServices';

interface StepProviderSelectionProps {
  serviceType: ServiceType;
  selected: Service | null;
  onSelect: (service: Service) => void;
}

export function StepProviderSelection({ serviceType, selected, onSelect }: StepProviderSelectionProps) {
  const { t, isRTL } = useLanguage();
  const { services, isLoading } = useServices({ serviceType });

  const formatPrice = (price: number, currency: string | null) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency: currency || 'SAR',
    }).format(price);
  };

  const serviceTypeLabels = {
    umrah: { en: 'Umrah', ar: 'عمرة' },
    hajj: { en: 'Hajj', ar: 'حج' },
    ziyarat: { en: 'Ziyarat', ar: 'زيارة' },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="text-6xl">🔍</div>
        <h3 className="text-xl font-semibold">
          {isRTL ? 'لا توجد خدمات متاحة' : 'No Services Available'}
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {isRTL 
            ? `لا توجد خدمات ${serviceTypeLabels[serviceType].ar} متاحة حالياً. يرجى المحاولة لاحقاً`
            : `No ${serviceTypeLabels[serviceType].en} services are available at the moment. Please try again later`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-medium">
            {isRTL ? 'خير الناس أنفعهم للناس' : 'The best of people are those most beneficial to others'}
          </span>
        </div>
        <h2 className="text-2xl font-semibold">
          {isRTL ? 'اختر مقدم الخدمة' : 'Select a Provider'}
        </h2>
        <p className="text-muted-foreground">
          {isRTL 
            ? 'اختر من مقدمي الخدمات المعتمدين والموثوقين'
            : 'Choose from our verified and trusted service providers'}
        </p>
      </div>

      {/* Provider Cards */}
      <div className="space-y-4">
        {services.map((service) => (
          <Card
            key={service.id}
            className={cn(
              'cursor-pointer transition-all duration-300 hover:shadow-lg overflow-hidden group',
              selected?.id === service.id
                ? 'border-primary ring-2 ring-primary ring-offset-2'
                : 'hover:border-primary/50'
            )}
            onClick={() => onSelect(service)}
          >
            {/* Top accent bar for selected */}
            {selected?.id === service.id && (
              <div className="h-1 bg-gradient-to-r from-primary to-primary/50" />
            )}
            
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Title & Check */}
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {isRTL ? service.title_ar || service.title : service.title}
                    </h3>
                    {selected?.id === service.id && (
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>

                  {/* Provider Info */}
                  {service.provider && (
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <BadgeCheck className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {isRTL 
                            ? service.provider.company_name_ar || service.provider.company_name
                            : service.provider.company_name}
                        </span>
                      </div>
                      
                      {service.provider.rating && service.provider.rating > 0 && (
                        <div className="flex items-center gap-1 bg-secondary/10 px-2 py-0.5 rounded-full">
                          <Star className="h-3 w-3 fill-secondary text-secondary" />
                          <span className="font-medium">{service.provider.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">
                            ({service.provider.total_reviews || 0})
                          </span>
                        </div>
                      )}
                      
                      {service.provider.bio && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{isRTL ? 'مكة المكرمة' : 'Makkah'}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {isRTL 
                      ? service.description_ar || service.description
                      : service.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {service.duration_days && (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {service.duration_days} {isRTL ? 'أيام' : 'days'}
                      </Badge>
                    )}
                    {service.includes && (service.includes as string[]).length > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        {(service.includes as string[]).length} {isRTL ? 'خدمات' : 'services'}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="text-end shrink-0">
                  <div className={cn(
                    'px-4 py-2 rounded-lg transition-colors',
                    selected?.id === service.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/10'
                  )}>
                    <p className="text-xs text-current/70 mb-0.5">
                      {isRTL ? 'السعر' : 'Price'}
                    </p>
                    <p className="text-lg font-bold">
                      {formatPrice(service.price, service.currency)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trust indicators */}
      <div className="flex flex-wrap justify-center items-center gap-6 pt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-4 w-4 text-primary" />
          <span>{isRTL ? 'مقدمون معتمدون' : 'Verified Providers'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-secondary" />
          <span>{isRTL ? 'تقييمات حقيقية' : 'Real Reviews'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{isRTL ? 'استجابة سريعة' : 'Fast Response'}</span>
        </div>
      </div>
    </div>
  );
}
