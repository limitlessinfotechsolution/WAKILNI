import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/lib/i18n';
import { useProvider } from '@/hooks/useProvider';
import { useProviderReviews } from '@/hooks/useReviews';
import { ReviewDisplay, ReviewSummary } from '@/components/bookings/ReviewDisplay';
import { Star, MessageSquare } from 'lucide-react';

export default function ReviewsPage() {
  const { t, isRTL } = useLanguage();
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

        {/* Rating Summary */}
        <ReviewSummary
          averageRating={stats.averageRating}
          totalReviews={stats.totalReviews}
          ratingDistribution={stats.ratingDistribution}
        />

        {/* Reviews List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5" />
              {isRTL ? 'جميع المراجعات' : 'All Reviews'}
              <span className="text-muted-foreground font-normal">
                ({stats.totalReviews})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                {isRTL
                  ? 'لا توجد مراجعات بعد. أكمل الحجوزات للحصول على تقييمات من المسافرين.'
                  : 'No reviews yet. Complete bookings to receive ratings from travelers.'}
              </div>
            ) : (
              <div className="divide-y">
                {reviews.map((review) => (
                  <ReviewDisplay key={review.id} review={review} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
