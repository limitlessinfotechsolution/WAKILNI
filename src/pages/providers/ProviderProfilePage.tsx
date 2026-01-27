import { Link, useParams } from 'react-router-dom';
import { Star, MapPin, Clock, Shield, CheckCircle, Calendar, ChevronLeft } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/lib/i18n';
import { usePublicProvider } from '@/hooks/usePublicProvider';
import { useAuth } from '@/lib/auth';
import { FilterableReviewList } from '@/components/bookings/FilterableReviewList';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function ProviderProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const { provider, isLoading, error } = usePublicProvider(id);

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      umrah: { en: 'Umrah', ar: 'عمرة' },
      hajj: { en: 'Hajj', ar: 'حج' },
      ziyarat: { en: 'Ziyarat', ar: 'زيارة' },
    };
    return isRTL ? labels[type]?.ar : labels[type]?.en || type;
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'P';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8 space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                <Skeleton className="h-6 w-40 mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </CardContent>
            </Card>
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !provider) {
    return (
      <MainLayout>
        <div className="container py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">
              {isRTL ? 'مقدم الخدمة غير موجود' : 'Provider Not Found'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {isRTL 
                ? 'قد يكون مقدم الخدمة غير متوفر أو غير مفعل'
                : 'This provider may be unavailable or inactive'}
            </p>
            <Button asChild>
              <Link to="/services">
                <ChevronLeft className="me-2 h-4 w-4" />
                {isRTL ? 'العودة للخدمات' : 'Back to Services'}
              </Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const providerName = isRTL && provider.company_name_ar 
    ? provider.company_name_ar 
    : provider.company_name || 'Provider';

  const providerBio = isRTL && provider.bio_ar 
    ? provider.bio_ar 
    : provider.bio;

  return (
    <MainLayout>
      <div className="container py-6 space-y-6">
        {/* Back Button */}
        <Button variant="ghost" asChild className="gap-2">
          <Link to="/services">
            <ChevronLeft className="h-4 w-4" />
            {isRTL ? 'العودة للخدمات' : 'Back to Services'}
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Provider Info Card */}
          <Card className="lg:col-span-1 h-fit lg:sticky lg:top-20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials(provider.company_name)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h1 className={cn('text-xl font-bold', isRTL && 'font-arabic')}>
                    {providerName}
                  </h1>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      {isRTL ? 'موثق' : 'Verified'}
                    </Badge>
                    {provider.nationality && (
                      <Badge variant="outline">{provider.nationality}</Badge>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-bold">{provider.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? 'التقييم' : 'Rating'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">{provider.total_reviews || 0}</p>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? 'المراجعات' : 'Reviews'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold">{provider.total_bookings || 0}</p>
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? 'الحجوزات' : 'Bookings'}
                    </p>
                  </div>
                </div>

                {providerBio && (
                  <div className="pt-4 border-t">
                    <p className={cn('text-sm text-muted-foreground text-start', isRTL && 'font-arabic')}>
                      {providerBio}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="services">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="services" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  {isRTL ? 'الخدمات' : 'Services'} ({provider.services.length})
                </TabsTrigger>
                <TabsTrigger value="reviews" className="gap-2">
                  <Star className="h-4 w-4" />
                  {isRTL ? 'المراجعات' : 'Reviews'} ({provider.reviews.length})
                </TabsTrigger>
              </TabsList>

              {/* Services Tab */}
              <TabsContent value="services" className="mt-6 space-y-4">
                {provider.services.length === 0 ? (
                  <Card className="p-8">
                    <div className="text-center text-muted-foreground">
                      {isRTL ? 'لا توجد خدمات متاحة حالياً' : 'No services available at the moment'}
                    </div>
                  </Card>
                ) : (
                  provider.services.map(service => (
                    <Card key={service.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Badge variant="secondary" className="mb-2">
                              {getServiceTypeLabel(service.service_type)}
                            </Badge>
                            <CardTitle className={cn('text-lg', isRTL && 'font-arabic')}>
                              {isRTL && service.title_ar ? service.title_ar : service.title}
                            </CardTitle>
                          </div>
                          <div className="text-end">
                            <p className="text-2xl font-bold text-primary">
                              {service.currency || 'SAR'} {service.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className={cn('text-sm text-muted-foreground mb-4', isRTL && 'font-arabic')}>
                          {isRTL && service.description_ar ? service.description_ar : service.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          {service.duration_days && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {service.duration_days} {t.services.days}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {service.service_type === 'hajj' ? 'Makkah & Mina' : 'Makkah'}
                          </span>
                        </div>

                        {service.includes && Array.isArray(service.includes) && (service.includes as string[]).length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {(service.includes as string[]).map((item, i) => (
                              <Badge key={i} variant="outline" className="gap-1">
                                <CheckCircle className="h-3 w-3" />
                                {item}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <Button asChild className="w-full sm:w-auto">
                          <Link to={user ? `/bookings/new?service=${service.id}` : '/login'}>
                            {t.services.bookNow}
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="mt-6">
                {provider.reviews.length === 0 ? (
                  <Card className="p-8">
                    <div className="text-center text-muted-foreground">
                      {isRTL ? 'لا توجد مراجعات بعد' : 'No reviews yet'}
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {/* Rating Summary */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-primary">
                              {provider.rating?.toFixed(1) || '0.0'}
                            </div>
                            <div className="flex items-center justify-center gap-0.5 my-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    'h-4 w-4',
                                    i < Math.round(provider.rating || 0)
                                      ? 'fill-amber-500 text-amber-500'
                                      : 'text-muted-foreground'
                                  )}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {provider.total_reviews} {isRTL ? 'مراجعة' : 'reviews'}
                            </p>
                          </div>
                          <div className="flex-1">
                            {/* Rating breakdown would go here */}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {provider.reviews.map(review => (
                        <Card key={review.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {getInitials(review.reviewer_profile?.full_name || null)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium">
                                    {review.reviewer_profile?.full_name || (isRTL ? 'مستخدم' : 'User')}
                                  </p>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(review.created_at), { 
                                      addSuffix: true,
                                      locale: isRTL ? ar : undefined 
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-0.5 mb-2">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={cn(
                                        'h-3.5 w-3.5',
                                        i < review.rating
                                          ? 'fill-amber-500 text-amber-500'
                                          : 'text-muted-foreground'
                                      )}
                                    />
                                  ))}
                                </div>
                                {(review.comment || review.comment_ar) && (
                                  <p className={cn('text-sm text-muted-foreground', isRTL && 'font-arabic')}>
                                    {isRTL && review.comment_ar ? review.comment_ar : review.comment}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
