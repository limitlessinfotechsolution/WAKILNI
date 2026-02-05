import { Star, Clock, Check, MapPin } from 'lucide-react';
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
  umrah: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  hajj: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  ziyarat: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

export function ServiceCard({ 
  service, 
  variant = 'grid', 
  onBook, 
  onViewDetails,
  className 
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
          "hover:shadow-md transition-all duration-200 cursor-pointer",
          className
        )}
        onClick={() => onViewDetails?.(service)}
      >
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
            {heroImage ? (
              <img src={heroImage} alt={title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">{serviceTypeIcons[service.service_type]}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{title}</h3>
            <p className="text-sm text-muted-foreground">{providerName}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-primary">
              {formatPrice(service.price, service.currency)}
            </p>
            {service.provider?.rating && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
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
        "group overflow-hidden hover:shadow-lg transition-all duration-300",
        "hover:border-primary/30",
        className
      )}
    >
      {/* Hero Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
        {heroImage ? (
          <img 
            src={heroImage} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-50">{serviceTypeIcons[service.service_type]}</span>
          </div>
        )}
        
        {/* Service Type Badge */}
        <Badge 
          className={cn(
            "absolute top-3 left-3 border",
            serviceTypeColors[service.service_type]
          )}
        >
          {serviceTypeIcons[service.service_type]} {service.service_type.charAt(0).toUpperCase() + service.service_type.slice(1)}
        </Badge>
        
        {/* Duration Badge */}
        {service.duration_days && (
          <Badge variant="secondary" className="absolute top-3 right-3">
            <Clock className="h-3 w-3 mr-1" />
            {service.duration_days} {isRTL ? 'يوم' : 'days'}
          </Badge>
        )}
      </div>

      <CardContent className="p-5">
        {/* Provider Info */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {providerName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{providerName}</span>
          {service.provider?.rating && (
            <div className="flex items-center gap-1 ml-auto">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">{service.provider.rating.toFixed(1)}</span>
              {service.provider.total_reviews && (
                <span className="text-xs text-muted-foreground">
                  ({service.provider.total_reviews})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Title & Description */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{description}</p>

        {/* Includes Preview */}
        {includes && includes.length > 0 && (
          <div className="space-y-1.5 mb-4">
            {includes.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="truncate">{isRTL && item.ar ? item.ar : item.en}</span>
              </div>
            ))}
            {includes.length > 3 && (
              <p className="text-xs text-muted-foreground pl-6">
                +{includes.length - 3} {isRTL ? 'المزيد' : 'more'}
              </p>
            )}
          </div>
        )}

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground">{isRTL ? 'السعر' : 'Price'}</p>
            <p className="text-xl font-bold text-primary">
              {formatPrice(service.price, service.currency)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewDetails?.(service)}
            >
              {isRTL ? 'التفاصيل' : 'Details'}
            </Button>
            <Button 
              size="sm"
              onClick={() => onBook?.(service)}
            >
              {isRTL ? 'احجز الآن' : 'Book Now'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
