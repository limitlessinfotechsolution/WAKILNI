import { Star, Clock, Check, X, Share2, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/lib/i18n';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { ServiceWithProvider } from '@/api/services/services.service';

interface ServiceDetailDialogProps {
  service: ServiceWithProvider | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBook?: (service: ServiceWithProvider) => void;
}

const serviceTypeLabels: Record<string, { en: string; ar: string }> = {
  umrah: { en: 'Umrah', ar: 'عمرة' },
  hajj: { en: 'Hajj', ar: 'حج' },
  ziyarat: { en: 'Ziyarat', ar: 'زيارة' },
};

const serviceTypeIcons: Record<string, string> = {
  umrah: '🕋',
  hajj: '🏔️',
  ziyarat: '🕌',
};

export function ServiceDetailDialog({
  service,
  open,
  onOpenChange,
  onBook,
}: ServiceDetailDialogProps) {
  const { isRTL } = useLanguage();
  const { toast } = useToast();

  if (!service) return null;

  const title = isRTL && service.title_ar ? service.title_ar : service.title;
  const description = isRTL && service.description_ar ? service.description_ar : service.description;
  const providerName = isRTL && service.provider?.company_name_ar 
    ? service.provider.company_name_ar 
    : service.provider?.company_name || 'Provider';
  const providerBio = isRTL && service.provider?.bio_ar
    ? service.provider.bio_ar
    : service.provider?.bio;
  
  const includes = service.includes as { en: string; ar: string }[] | null;
  const heroImage = (service as any).hero_image_url;
  const galleryUrls = (service as any).gallery_urls as string[] | null;

  const formatPrice = (price: number, currency: string | null) => {
    const curr = currency || 'SAR';
    const symbols: Record<string, string> = { SAR: 'ر.س', USD: '$', EUR: '€', GBP: '£' };
    return `${symbols[curr] || curr} ${price.toLocaleString()}`;
  };

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: `Check out this ${service.service_type} service: ${title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: isRTL ? 'تم النسخ' : 'Link Copied',
          description: isRTL ? 'تم نسخ الرابط إلى الحافظة' : 'Link copied to clipboard',
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        {/* Hero Section */}
        <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5">
          {heroImage ? (
            <img 
              src={heroImage} 
              alt={title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-7xl opacity-30">{serviceTypeIcons[service.service_type]}</span>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className="bg-background/80 backdrop-blur-sm">
              {serviceTypeIcons[service.service_type]} {serviceTypeLabels[service.service_type]?.[isRTL ? 'ar' : 'en']}
            </Badge>
            {service.duration_days && (
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                <Clock className="h-3 w-3 mr-1" />
                {service.duration_days} {isRTL ? 'يوم' : 'days'}
              </Badge>
            )}
          </div>

          {/* Share Button */}
          <Button 
            size="icon" 
            variant="secondary" 
            className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="max-h-[calc(90vh-16rem)]">
          <div className="p-6 space-y-6">
            {/* Title & Price */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">{isRTL ? 'السعر' : 'Price'}</p>
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(service.price, service.currency)}
                </p>
              </div>
            </div>

            {/* Provider Card */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {providerName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{providerName}</p>
                {providerBio && (
                  <p className="text-sm text-muted-foreground line-clamp-1">{providerBio}</p>
                )}
              </div>
              {service.provider?.rating && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{service.provider.rating.toFixed(1)}</span>
                  {service.provider.total_reviews && (
                    <span className="text-sm text-muted-foreground">
                      ({service.provider.total_reviews})
                    </span>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">{isRTL ? 'الوصف' : 'Description'}</h3>
              <p className="text-muted-foreground leading-relaxed">{description}</p>
            </div>

            {/* What's Included */}
            {includes && includes.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">
                    {isRTL ? 'ما يشمله العرض' : "What's Included"}
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {includes.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3 text-emerald-500" />
                        </div>
                        <span className="text-sm">{isRTL && item.ar ? item.ar : item.en}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Gallery */}
            {galleryUrls && galleryUrls.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">{isRTL ? 'معرض الصور' : 'Gallery'}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {galleryUrls.map((url, idx) => (
                      <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                        <img 
                          src={url} 
                          alt={`Gallery ${idx + 1}`} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Sticky Footer */}
        <div className="p-4 border-t bg-background">
          <Button 
            className="w-full h-12 text-lg" 
            onClick={() => {
              onBook?.(service);
              onOpenChange(false);
            }}
          >
            {isRTL ? 'احجز الآن' : 'Book Now'} • {formatPrice(service.price, service.currency)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
