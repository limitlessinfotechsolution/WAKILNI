import { useState, useMemo } from 'react';
import { Star, ArrowUpDown, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/lib/i18n';
import { ReviewDisplay, ReviewSummary } from './ReviewDisplay';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  comment_ar: string | null;
  created_at: string;
  reviewer_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface FilterableReviewListProps {
  reviews: Review[];
  stats: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  };
  showSummary?: boolean;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';
type FilterOption = 'all' | '5' | '4' | '3' | '2' | '1';

export function FilterableReviewList({
  reviews,
  stats,
  showSummary = true,
}: FilterableReviewListProps) {
  const { isRTL } = useLanguage();
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterRating, setFilterRating] = useState<FilterOption>('all');

  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];

    // Filter by rating
    if (filterRating !== 'all') {
      const ratingValue = parseInt(filterRating, 10);
      result = result.filter((r) => r.rating === ratingValue);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return result;
  }, [reviews, sortBy, filterRating]);

  const sortOptions: { value: SortOption; label: string; labelAr: string }[] = [
    { value: 'newest', label: 'Newest First', labelAr: 'الأحدث أولاً' },
    { value: 'oldest', label: 'Oldest First', labelAr: 'الأقدم أولاً' },
    { value: 'highest', label: 'Highest Rated', labelAr: 'الأعلى تقييماً' },
    { value: 'lowest', label: 'Lowest Rated', labelAr: 'الأقل تقييماً' },
  ];

  const filterOptions: { value: FilterOption; label: string; labelAr: string }[] = [
    { value: 'all', label: 'All Ratings', labelAr: 'جميع التقييمات' },
    { value: '5', label: '5 Stars', labelAr: '5 نجوم' },
    { value: '4', label: '4 Stars', labelAr: '4 نجوم' },
    { value: '3', label: '3 Stars', labelAr: '3 نجوم' },
    { value: '2', label: '2 Stars', labelAr: '2 نجوم' },
    { value: '1', label: '1 Star', labelAr: '1 نجمة' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      {showSummary && (
        <ReviewSummary
          averageRating={stats.averageRating}
          totalReviews={stats.totalReviews}
          ratingDistribution={stats.ratingDistribution}
        />
      )}

      {/* Filters and Sort */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg">
              {isRTL ? 'المراجعات' : 'Reviews'}
              <span className="text-muted-foreground font-normal ml-2">
                ({filteredAndSortedReviews.length})
              </span>
            </CardTitle>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filter by Rating */}
              <Select
                value={filterRating}
                onValueChange={(v) => setFilterRating(v as FilterOption)}
              >
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {isRTL ? opt.labelAr : opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as SortOption)}
              >
                <SelectTrigger className="w-[150px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {isRTL ? opt.labelAr : opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSortedReviews.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {filterRating !== 'all'
                ? isRTL
                  ? 'لا توجد مراجعات بهذا التقييم'
                  : 'No reviews with this rating'
                : isRTL
                ? 'لا توجد مراجعات بعد'
                : 'No reviews yet'}
            </div>
          ) : (
            <div className="divide-y">
              {filteredAndSortedReviews.map((review) => (
                <ReviewDisplay key={review.id} review={review} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
