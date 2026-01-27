import { Star, Check, Clock, BadgeCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {isRTL 
            ? 'لا توجد خدمات متاحة حالياً لهذا النوع'
            : 'No services available for this type at the moment'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">
          {isRTL ? 'اختر مقدم الخدمة' : 'Select a Provider'}
        </h2>
        <p className="text-muted-foreground">
          {isRTL 
            ? 'اختر من مقدمي الخدمات المعتمدين'
            : 'Choose from verified service providers'}
        </p>
      </div>

      <div className="space-y-4">
        {services.map((service) => (
          <Card
            key={service.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              selected?.id === service.id
                ? 'border-primary ring-2 ring-primary ring-offset-2'
                : 'hover:border-primary/50'
            )}
            onClick={() => onSelect(service)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">
                      {isRTL ? service.title_ar || service.title : service.title}
                    </h3>
                    {selected?.id === service.id && (
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>

                  {service.provider && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                      <BadgeCheck className="h-4 w-4 text-primary" />
                      <span>
                        {isRTL 
                          ? service.provider.company_name_ar || service.provider.company_name
                          : service.provider.company_name}
                      </span>
                      {service.provider.rating && service.provider.rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-secondary text-secondary" />
                          {service.provider.rating.toFixed(1)}
                          <span className="text-xs">
                            ({service.provider.total_reviews})
                          </span>
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {isRTL 
                      ? service.description_ar || service.description
                      : service.description}
                  </p>

                  {service.duration_days && (
                    <div className="flex items-center gap-1 mt-3 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {service.duration_days} {isRTL ? 'أيام' : 'days'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-end">
                  <Badge variant="secondary" className="text-lg font-semibold px-3 py-1">
                    {formatPrice(service.price, service.currency)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
