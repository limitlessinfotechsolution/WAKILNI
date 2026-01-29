import { MapPin, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface GPSIndicatorProps {
  accuracy: number | null;
  isLoading?: boolean;
  hasLocation: boolean;
  isNearHaram?: boolean;
  error?: string | null;
  onRequestLocation?: () => void;
}

export function GPSIndicator({
  accuracy,
  isLoading = false,
  hasLocation,
  isNearHaram = false,
  error,
  onRequestLocation,
}: GPSIndicatorProps) {
  const { isRTL } = useLanguage();

  const getSignalStrength = (acc: number | null): { bars: number; label: string; labelAr: string; color: string } => {
    if (!acc) return { bars: 0, label: 'No Signal', labelAr: 'لا توجد إشارة', color: 'text-muted-foreground' };
    if (acc <= 10) return { bars: 5, label: 'Excellent', labelAr: 'ممتازة', color: 'text-emerald-500' };
    if (acc <= 25) return { bars: 4, label: 'Strong', labelAr: 'قوية', color: 'text-emerald-500' };
    if (acc <= 50) return { bars: 3, label: 'Good', labelAr: 'جيدة', color: 'text-amber-500' };
    if (acc <= 100) return { bars: 2, label: 'Moderate', labelAr: 'متوسطة', color: 'text-amber-500' };
    return { bars: 1, label: 'Weak', labelAr: 'ضعيفة', color: 'text-red-500' };
  };

  const signal = getSignalStrength(accuracy);

  return (
    <div className={cn(
      'p-4 rounded-xl border-2 transition-all',
      hasLocation 
        ? 'bg-gradient-to-r from-emerald-50/50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/30 border-emerald-200 dark:border-emerald-800'
        : error 
          ? 'bg-gradient-to-r from-red-50/50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/30 border-red-200 dark:border-red-800'
          : 'bg-muted/50 border-muted'
    )}>
      <div className="flex items-center justify-between gap-4">
        {/* Signal Bars */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : hasLocation ? (
              <Wifi className={cn('h-5 w-5', signal.color)} />
            ) : (
              <WifiOff className="h-5 w-5 text-muted-foreground" />
            )}
            
            {/* Signal Strength Bars */}
            <div className="flex items-end gap-0.5 h-5 ms-2">
              {[1, 2, 3, 4, 5].map((bar) => (
                <div
                  key={bar}
                  className={cn(
                    'w-1.5 rounded-sm transition-all',
                    bar <= signal.bars 
                      ? signal.color.replace('text-', 'bg-')
                      : 'bg-muted-foreground/20',
                    bar <= signal.bars && 'animate-[signal-bar_0.3s_ease-out]'
                  )}
                  style={{ 
                    height: `${bar * 4}px`,
                    animationDelay: `${bar * 50}ms`
                  }}
                />
              ))}
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className={cn('text-sm font-medium', signal.color)}>
              {isLoading 
                ? (isRTL ? 'جاري تحديد الموقع...' : 'Acquiring...')
                : isRTL ? signal.labelAr : signal.label
              }
            </span>
            {accuracy && (
              <span className="text-xs text-muted-foreground">
                {isRTL ? `دقة: ${accuracy.toFixed(0)} متر` : `Accuracy: ${accuracy.toFixed(0)}m`}
              </span>
            )}
          </div>
        </div>

        {/* Location Badge */}
        <div className="flex items-center gap-2">
          {isNearHaram && hasLocation && (
            <Badge 
              variant="secondary" 
              className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 animate-[gps-pulse_2s_ease-in-out_infinite]"
            >
              <MapPin className="h-3 w-3 me-1" />
              {isRTL ? 'قرب الحرم' : 'Near Haram'}
            </Badge>
          )}
          
          {!hasLocation && !isLoading && onRequestLocation && (
            <button
              onClick={onRequestLocation}
              className="text-xs text-primary hover:underline transition-colors"
            >
              {isRTL ? 'تفعيل الموقع' : 'Enable Location'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
