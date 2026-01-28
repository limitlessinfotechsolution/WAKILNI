import { useState } from 'react';
import { Star, Download, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { useProvider } from '@/hooks/useProvider';
import { useProviderReviews } from '@/hooks/useReviews';
import { FilterableReviewList } from '@/components/bookings/FilterableReviewList';
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/cards/GlassCard';
import { RingChart, MultiRingChart } from '@/components/data-display/RingChart';
import { cn } from '@/lib/utils';

export default function ReviewsPage() {
  const { isRTL } = useLanguage();
  const { provider, isLoading: providerLoading } = useProvider();
  const { reviews, stats, isLoading: reviewsLoading } = useProviderReviews(provider?.id);

  const isLoading = providerLoading || reviewsLoading;

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 
      : 0
  }));

  const ratingColors: Record<number, string> = {
    5: 'hsl(147 76% 48%)',
    4: 'hsl(167 76% 48%)',
    3: 'hsl(45 93% 47%)',
    2: 'hsl(25 95% 53%)',
    1: 'hsl(0 84% 60%)',
  };

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
          <GlassCard>
            <GlassCardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {isRTL ? 'لم يتم العثور على ملف مقدم الخدمة' : 'Provider profile not found'}
              </p>
            </GlassCardContent>
          </GlassCard>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 me-2" />
            {isRTL ? 'تصدير' : 'Export'}
          </Button>
        </div>

        {/* Rating Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Overall Rating */}
          <GlassCard className="lg:col-span-1">
            <GlassCardHeader>
              <h3 className={cn('font-semibold', isRTL && 'font-arabic')}>
                {isRTL ? 'التقييم العام' : 'Overall Rating'}
              </h3>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="flex flex-col items-center py-4">
                <div className="relative">
                  <RingChart
                    value={stats?.averageRating || 0}
                    max={5}
                    size={120}
                    strokeWidth={12}
                    color="hsl(45 93% 47%)"
                    valueFormatter={(v) => v.toFixed(1)}
                  />
                </div>
                <div className="flex items-center gap-1 mt-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-5 w-5',
                        star <= Math.round(stats?.averageRating || 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-muted-foreground'
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {isRTL 
                    ? `بناءً على ${stats?.totalReviews || 0} تقييم`
                    : `Based on ${stats?.totalReviews || 0} reviews`}
                </p>
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Rating Distribution */}
          <GlassCard className="lg:col-span-2">
            <GlassCardHeader>
              <h3 className={cn('font-semibold', isRTL && 'font-arabic')}>
                {isRTL ? 'توزيع التقييمات' : 'Rating Distribution'}
              </h3>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="space-y-3">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: ratingColors[rating]
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-end">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Star className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? 'إجمالي التقييمات' : 'Total Reviews'}</p>
                <p className="text-xl font-bold">{stats?.totalReviews || 0}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? 'تقييمات 5 نجوم' : '5-Star Reviews'}</p>
                <p className="text-xl font-bold">{ratingDistribution.find(r => r.rating === 5)?.count || 0}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Star className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? 'متوسط التقييم' : 'Avg Rating'}</p>
                <p className="text-xl font-bold">{(stats?.averageRating || 0).toFixed(1)}</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Star className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{isRTL ? 'هذا الشهر' : 'This Month'}</p>
                <p className="text-xl font-bold">
                  {reviews.filter(r => {
                    const date = new Date(r.created_at);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Filterable Reviews */}
        <FilterableReviewList reviews={reviews} stats={stats} />
      </div>
    </DashboardLayout>
  );
}
