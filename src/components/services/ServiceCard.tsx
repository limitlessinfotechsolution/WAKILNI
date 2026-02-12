import { Star, Clock, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { ServiceWithProvider } from '@/api/services/services.service';

interface ServiceCardProps {
  service: ServiceWithProvider;
  variant?: 'grid' | 'compact' | 'detailed';
  onBook?: (service: ServiceWithProvider) => void;
  onViewDetails?: (service: ServiceWithProvider) => void;
  className?: string;
}

const serviceTypeIcons: Record<string, string> = {
  umrah: '🕋',
  hajj: '🏔️',
  ziyarat: '🕌',
};

const serviceTypeColors: Record<string, string> = {
  umrah: 'bg-primary/10 text-primary border-primary/20',
  hajj: 'bg-secondary/10 text-secondary border-secondary/20',
  ziyarat: 'bg-info/10 text-info border-info/20',
};

export function ServiceCard({ 
  service, variant = 'grid', onBook, onViewDetails, className 
}: ServiceCardProps) {
  const { isRTL } = useLanguage();
  
  const title = isRTL && service.title_ar ? service.title_ar : service.title;
  const description = isRTL && service.description_ar ? service.description_ar : service.description;
  const providerName = isRTL && service.provider?.company_name_ar 
    ? service.provider.company_name_ar 
    : service.provider?.company_name || 'Provider';
  
  const includes = service.includes as { en: string; ar: string }[] | null;
  const heroImage = (service as any).hero_image_url;
  
  const formatPrice = (price: number, currency: string | null) => {
    const curr = currency || 'SAR';
    const symbols: Record<string, string> = { SAR: 'ر.س', USD: '$', EUR: '€', GBP: '£' };
    return `${symbols[curr] || curr} ${price.toLocaleString()}`;
  };

  if (variant === 'compact') {
    return (
      <Card 
        className={cn(
          "hover:shadow-medium transition-all duration-200 cursor-pointer active:scale-[0.98]",
          className
        )}
        onClick={() => onViewDetails?.(service)}
      >
        <CardContent className="p-3 md:p-4 flex items-center gap-3">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0">
            {heroImage ? (
              <img src={heroImage} alt={title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl md:text-2xl">{serviceTypeIcons[service.service_type]}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{title}</h3>
            <p className="text-xs text-muted-foreground truncate">{providerName}</p>
          </div>
          <div className="text-end shrink-0">
            <p className="font-semibold text-sm text-primary">
              {formatPrice(service.price, service.currency)}
            </p>
            {service.provider?.rating && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                <Star className="h-3 w-3 fill-secondary text-secondary" />
                {service.provider.rating.toFixed(1)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "group overflow-hidden border-border/50",
        "hover:shadow-medium hover:border-primary/20",
        "transition-all duration-300 active:scale-[0.98]",
        className
      )}
    >
      {/* Hero Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/15 to-primary/5">
        {heroImage ? (
          <img 
            src={heroImage} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl md:text-5xl opacity-40">{serviceTypeIcons[service.service_type]}</span>
          </div>
        )}
        
        {/* Badges */}
        <Badge className={cn("absolute top-2.5 left-2.5 border text-xs", serviceTypeColors[service.service_type])}>
          {serviceTypeIcons[service.service_type]} {service.service_type.charAt(0).toUpperCase() + service.service_type.slice(1)}
        </Badge>
        
        {service.duration_days && (
          <Badge variant="secondary" className="absolute top-2.5 right-2.5 text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {service.duration_days} {isRTL ? 'يوم' : 'days'}
          </Badge>
        )}
      </div>

      <CardContent className="p-4 md:p-5">
        {/* Provider */}
        <div className="flex items-center gap-2 mb-2.5">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {providerName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate flex-1">{providerName}</span>
          {service.provider?.rating && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
              <span className="text-xs font-medium">{service.provider.rating.toFixed(1)}</span>
              {service.provider.total_reviews && (
                <span className="text-[10px] text-muted-foreground">({service.provider.total_reviews})</span>
              )}
            </div>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="font-semibold text-base mb-1.5 line-clamp-1">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{description}</p>

        {/* Includes */}
        {includes && includes.length > 0 && (
          <div className="space-y-1 mb-3">
            {includes.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <Check className="h-3.5 w-3.5 text-success shrink-0" />
                <span className="truncate">{isRTL && item.ar ? item.ar : item.en}</span>
              </div>
            ))}
            {includes.length > 2 && (
              <p className="text-[11px] text-muted-foreground ps-5">
                +{includes.length - 2} {isRTL ? 'المزيد' : 'more'}
              </p>
            )}
          </div>
        )}

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{isRTL ? 'السعر' : 'Price'}</p>
            <p className="text-lg font-bold text-primary">
              {formatPrice(service.price, service.currency)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl text-xs h-8" onClick={() => onViewDetails?.(service)}>
              {isRTL ? 'التفاصيل' : 'Details'}
            </Button>
            <Button size="sm" className="rounded-xl text-xs h-8" onClick={() => onBook?.(service)}>
              {isRTL ? 'احجز' : 'Book'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
