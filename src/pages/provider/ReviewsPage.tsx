import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/lib/i18n';
import { useProvider } from '@/hooks/useProvider';
import { useProviderReviews } from '@/hooks/useReviews';
import { FilterableReviewList } from '@/components/bookings/FilterableReviewList';
import { Star } from 'lucide-react';

export default function ReviewsPage() {
  const { isRTL } = useLanguage();
  const { provider, isLoading: providerLoading } = useProvider();
  const { reviews, stats, isLoading: reviewsLoading } = useProviderReviews(provider?.id);

  const isLoading = providerLoading || reviewsLoading;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!provider) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {isRTL ? 'لم يتم العثور على ملف مقدم الخدمة' : 'Provider profile not found'}
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Star className="h-6 w-6 text-yellow-500" />
          <h1 className="text-2xl font-bold">
            {isRTL ? 'التقييمات والمراجعات' : 'Reviews & Ratings'}
          </h1>
        </div>

        {/* Filterable Reviews */}
        <FilterableReviewList reviews={reviews} stats={stats} />
      </div>
    </MainLayout>
  );
}
