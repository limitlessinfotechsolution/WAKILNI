import { DashboardLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/lib/i18n';
import { useProvider } from '@/hooks/useProvider';
import { useProviderReviews } from '@/hooks/useReviews';
import { FilterableReviewList } from '@/components/bookings/FilterableReviewList';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ReviewsPage() {
  const { isRTL } = useLanguage();
  const { provider, isLoading: providerLoading } = useProvider();
  const { reviews, stats, isLoading: reviewsLoading } = useProviderReviews(provider?.id);

  const isLoading = providerLoading || reviewsLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!provider) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {isRTL ? 'لم يتم العثور على ملف مقدم الخدمة' : 'Provider profile not found'}
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 text-white shadow-lg">
            <Star className="h-5 w-5" />
          </div>
          <div>
            <h1 className={cn('text-xl md:text-2xl font-bold', isRTL && 'font-arabic')}>
              {isRTL ? 'التقييمات والمراجعات' : 'Reviews & Ratings'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isRTL ? 'عرض وإدارة تقييمات العملاء' : 'View and manage customer reviews'}
            </p>
          </div>
        </div>

        {/* Filterable Reviews */}
        <FilterableReviewList reviews={reviews} stats={stats} />
      </div>
    </DashboardLayout>
  );
}
