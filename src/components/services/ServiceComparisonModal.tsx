import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, MapPin, Check, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface Service {
  id: string;
  title: string;
  title_ar: string | null;
  service_type: string;
  price: number;
  currency: string | null;
  duration_days: number | null;
  description: string | null;
  includes: any;
  provider?: {
    id: string;
    company_name: string | null;
    company_name_ar: string | null;
    rating: number | null;
    total_reviews: number | null;
  } | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: Service[];
  onRemove: (id: string) => void;
}

export function ServiceComparisonModal({ open, onOpenChange, services, onRemove }: Props) {
  const { isRTL } = useLanguage();

  const rows: { label: string; labelAr: string; render: (s: Service) => React.ReactNode }[] = [
    {
      label: 'Price', labelAr: 'السعر',
      render: (s) => <span className="text-lg font-bold text-primary">{s.currency || 'SAR'} {s.price.toLocaleString()}</span>,
    },
    {
      label: 'Duration', labelAr: 'المدة',
      render: (s) => s.duration_days ? <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{s.duration_days} {isRTL ? 'يوم' : 'days'}</span> : '—',
    },
    {
      label: 'Provider', labelAr: 'مقدم الخدمة',
      render: (s) => s.provider?.company_name || '—',
    },
    {
      label: 'Rating', labelAr: 'التقييم',
      render: (s) => s.provider?.rating ? (
        <span className="flex items-center gap-1 text-amber-500">
          <Star className="h-4 w-4 fill-current" />
          {s.provider.rating.toFixed(1)}
          <span className="text-muted-foreground text-xs">({s.provider.total_reviews || 0})</span>
        </span>
      ) : '—',
    },
    {
      label: 'Type', labelAr: 'النوع',
      render: (s) => <Badge variant="outline" className="capitalize">{s.service_type}</Badge>,
    },
    {
      label: 'Includes', labelAr: 'يشمل',
      render: (s) => {
        const items = Array.isArray(s.includes) ? s.includes : [];
        return items.length > 0 ? (
          <ul className="space-y-1">
            {items.slice(0, 4).map((item: string, i: number) => (
              <li key={i} className="text-xs flex items-center gap-1">
                <Check className="h-3 w-3 text-emerald-500" />
                {item}
              </li>
            ))}
            {items.length > 4 && <li className="text-xs text-muted-foreground">+{items.length - 4} more</li>}
          </ul>
        ) : '—';
      },
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={cn(isRTL && 'font-arabic')}>
            {isRTL ? 'مقارنة الخدمات' : 'Compare Services'}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-start p-2 w-28" />
                {services.map(s => (
                  <th key={s.id} className="p-2 text-start min-w-[180px]">
                    <div className="space-y-1">
                      <p className={cn('font-semibold text-sm', isRTL && 'font-arabic')}>
                        {isRTL && s.title_ar ? s.title_ar : s.title}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-muted-foreground"
                        onClick={() => onRemove(s.id)}
                      >
                        <X className="h-3 w-3 me-1" />
                        {isRTL ? 'إزالة' : 'Remove'}
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={cn(i % 2 === 0 && 'bg-muted/30')}>
                  <td className="p-2 text-sm font-medium text-muted-foreground">
                    {isRTL ? row.labelAr : row.label}
                  </td>
                  {services.map(s => (
                    <td key={s.id} className="p-2 text-sm">
                      {row.render(s)}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Book Now row */}
              <tr>
                <td className="p-2" />
                {services.map(s => (
                  <td key={s.id} className="p-2">
                    <Button asChild size="sm" className="w-full">
                      <Link to={`/bookings/new?service=${s.id}`}>
                        {isRTL ? 'احجز الآن' : 'Book Now'}
                      </Link>
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
