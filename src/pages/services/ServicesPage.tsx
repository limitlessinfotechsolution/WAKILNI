import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Star, Clock, MapPin, Grid3X3, List, Plus, Check, Sparkles, Compass, Moon, Heart } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/lib/i18n';
import { useServices, ServiceType } from '@/hooks/useServices';
import { useAuth } from '@/lib/auth';
import { useHaptics } from '@/hooks/useHaptics';
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/cards/GlassCard';
import { FloatingActionButton } from '@/components/navigation/FloatingActionButton';
import { cn } from '@/lib/utils';

type SortOption = 'price_asc' | 'price_desc' | 'rating' | 'reviews' | 'duration';
type ViewMode = 'grid' | 'list';

export default function ServicesPage() {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const haptics = useHaptics();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [minRating, setMinRating] = useState(0);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  // Get service type from URL params
  const typeParam = searchParams.get('type') as ServiceType | null;
  const [serviceType, setServiceType] = useState<ServiceType | undefined>(typeParam || undefined);
  
  // Fetch services
  const { services, isLoading } = useServices({ serviceType });

  // Filter and sort services
  const filteredServices = useMemo(() => {
    let result = [...services];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.title.toLowerCase().includes(query) ||
        s.title_ar?.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query) ||
        s.provider?.company_name?.toLowerCase().includes(query)
      );
    }

    // Price filter
    result = result.filter(s => s.price >= priceRange[0] && s.price <= priceRange[1]);

    // Rating filter
    if (minRating > 0) {
      result = result.filter(s => (s.provider?.rating || 0) >= minRating);
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.provider?.rating || 0) - (a.provider?.rating || 0));
        break;
      case 'reviews':
        result.sort((a, b) => (b.provider?.total_reviews || 0) - (a.provider?.total_reviews || 0));
        break;
      case 'duration':
        result.sort((a, b) => (a.duration_days || 0) - (b.duration_days || 0));
        break;
    }

    return result;
  }, [services, searchQuery, sortBy, priceRange, minRating]);

  const handleTypeChange = (type: string) => {
    if (type === 'all') {
      setServiceType(undefined);
      searchParams.delete('type');
    } else {
      setServiceType(type as ServiceType);
      searchParams.set('type', type);
    }
    setSearchParams(searchParams);
  };

  const toggleCompare = (serviceId: string) => {
    haptics.selection();
    if (compareList.includes(serviceId)) {
      setCompareList(prev => prev.filter(id => id !== serviceId));
    } else if (compareList.length < 3) {
      setCompareList(prev => [...prev, serviceId]);
    }
  };

  const toggleWishlist = (serviceId: string) => {
    haptics.light();
    if (wishlist.includes(serviceId)) {
      setWishlist(prev => prev.filter(id => id !== serviceId));
    } else {
      setWishlist(prev => [...prev, serviceId]);
    }
  };

  const getServiceTypeLabel = (type: ServiceType) => {
    const labels = {
      umrah: { en: 'Umrah', ar: 'عمرة' },
      hajj: { en: 'Hajj', ar: 'حج' },
      ziyarat: { en: 'Ziyarat', ar: 'زيارة' },
    };
    return isRTL ? labels[type].ar : labels[type].en;
  };

  const getServiceTypeBadgeColor = (type: ServiceType) => {
    switch (type) {
      case 'umrah':
        return 'bg-emerald-500 text-white';
      case 'hajj':
        return 'bg-amber-500 text-white';
      case 'ziyarat':
        return 'bg-purple-500 text-white';
      default:
        return '';
    }
  };

  const ServiceCard = ({ service, isCompareSelected }: { service: typeof services[0]; isCompareSelected: boolean }) => {
    const isWishlisted = wishlist.includes(service.id);

    return (
      <GlassCard 
        className={cn(
          'overflow-hidden transition-all group',
          isCompareSelected && 'ring-2 ring-primary border-primary'
        )}
        glow={isCompareSelected}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Badge className={cn('mb-2', getServiceTypeBadgeColor(service.service_type))}>
                {getServiceTypeLabel(service.service_type)}
              </Badge>
              <CardTitle className={cn('line-clamp-2 text-base md:text-lg', isRTL && 'font-arabic')}>
                {isRTL && service.title_ar ? service.title_ar : service.title}
              </CardTitle>
            </div>
            <div className="flex gap-1">
              {/* Wishlist Button */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'shrink-0 h-8 w-8 transition-all',
                  isWishlisted && 'text-red-500'
                )}
                onClick={() => toggleWishlist(service.id)}
              >
                <Heart className={cn('h-4 w-4', isWishlisted && 'fill-current')} />
              </Button>
              {/* Compare Button */}
              <Button
                variant={isCompareSelected ? 'default' : 'outline'}
                size="icon"
                className="shrink-0 h-8 w-8"
                onClick={() => toggleCompare(service.id)}
              >
                {isCompareSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {service.provider && (
            <CardDescription className="flex items-center gap-2 mt-2">
              <Link 
                to={`/providers/${service.provider.id}`}
                className={cn('hover:underline hover:text-primary transition-colors', isRTL && 'font-arabic')}
              >
                {isRTL && service.provider.company_name_ar 
                  ? service.provider.company_name_ar 
                  : service.provider.company_name
                }
              </Link>
              {service.provider.rating && (
                <span className="flex items-center gap-1 text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {service.provider.rating.toFixed(1)}
                  <span className="text-muted-foreground">
                    ({service.provider.total_reviews || 0})
                  </span>
                </span>
              )}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pb-3">
          <p className={cn('text-sm text-muted-foreground line-clamp-2', isRTL && 'font-arabic')}>
            {isRTL && service.description_ar ? service.description_ar : service.description}
          </p>
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
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
        </CardContent>
        <CardFooter className="flex items-center justify-between pt-3 border-t">
          <div>
            <span className="text-xl md:text-2xl font-bold text-primary">
              {service.currency || 'SAR'} {service.price.toLocaleString()}
            </span>
          </div>
          <Button asChild size="sm" className="active:scale-95 transition-transform">
            <Link to={user ? `/bookings/new?service=${service.id}` : '/login'}>
              {t.services.bookNow}
            </Link>
          </Button>
        </CardFooter>
      </GlassCard>
    );
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-4">
        <Label className={cn(isRTL && 'font-arabic')}>
          {isRTL ? 'نطاق السعر' : 'Price Range'}
        </Label>
        <Slider
          min={0}
          max={50000}
          step={500}
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          className="mt-2"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>SAR {priceRange[0].toLocaleString()}</span>
          <span>SAR {priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="space-y-4">
        <Label className={cn(isRTL && 'font-arabic')}>
          {isRTL ? 'الحد الأدنى للتقييم' : 'Minimum Rating'}
        </Label>
        <div className="flex flex-wrap items-center gap-2">
          {[0, 3, 3.5, 4, 4.5].map((rating) => (
            <Button
              key={rating}
              variant={minRating === rating ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMinRating(rating)}
              className="flex items-center gap-1"
            >
              {rating === 0 ? (isRTL ? 'الكل' : 'All') : (
                <>
                  <Star className="h-3 w-3 fill-current" />
                  {rating}+
                </>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <GlassCard className="p-8 md:p-12">
      <div className="text-center max-w-md mx-auto">
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
          <div className="absolute inset-2 bg-primary/20 rounded-full flex items-center justify-center">
            <Moon className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h3 className={cn('text-xl font-bold mb-3', isRTL && 'font-arabic')}>
          {isRTL ? 'لا توجد خدمات متاحة حالياً' : 'No Services Available Yet'}
        </h3>
        <p className={cn('text-muted-foreground mb-6 leading-relaxed', isRTL && 'font-arabic')}>
          {isRTL 
            ? 'نحن نعمل على إضافة خدمات عمرة وحج مميزة. يرجى التحقق مرة أخرى قريباً أو تعديل معايير البحث.'
            : 'We\'re working on adding quality Umrah and Hajj services. Please check back soon or adjust your search criteria.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => {
            setPriceRange([0, 50000]);
            setMinRating(0);
            setSearchQuery('');
            setServiceType(undefined);
          }}>
            <Sparkles className="h-4 w-4 me-2" />
            {isRTL ? 'إعادة تعيين الفلاتر' : 'Reset Filters'}
          </Button>
          <Button asChild>
            <Link to="/donate">
              <Compass className="h-4 w-4 me-2" />
              {isRTL ? 'دعم المحتاجين' : 'Support Those in Need'}
            </Link>
          </Button>
        </div>
      </div>
    </GlassCard>
  );

  // Conditional Layout based on auth status
  const Layout = user ? DashboardLayout : MainLayout;

  return (
    <Layout>
      <div className="container py-6 px-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={cn('text-2xl md:text-3xl font-bold', isRTL && 'font-arabic')}>
              {isRTL ? 'تصفح الخدمات' : 'Browse Services'}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              {isRTL 
                ? `${filteredServices.length} خدمة متاحة`
                : `${filteredServices.length} services available`
              }
            </p>
          </div>
          
          {/* Compare Button */}
          {compareList.length > 0 && (
            <Button variant="secondary" className="gap-2">
              <Check className="h-4 w-4" />
              {isRTL ? `مقارنة (${compareList.length})` : `Compare (${compareList.length})`}
            </Button>
          )}
        </div>

        {/* Service Type Tabs */}
        <Tabs value={serviceType || 'all'} onValueChange={handleTypeChange}>
          <TabsList className="grid w-full grid-cols-4 max-w-md h-auto">
            <TabsTrigger value="all" className="text-xs md:text-sm py-2">{t.services.allServices}</TabsTrigger>
            <TabsTrigger value="umrah" className="text-xs md:text-sm py-2">{t.services.umrah}</TabsTrigger>
            <TabsTrigger value="hajj" className="text-xs md:text-sm py-2">{t.services.hajj}</TabsTrigger>
            <TabsTrigger value="ziyarat" className="text-xs md:text-sm py-2">{t.services.ziyarat}</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isRTL ? 'ابحث عن خدمات...' : 'Search services...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-10"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder={isRTL ? 'ترتيب حسب' : 'Sort by'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">{isRTL ? 'الأعلى تقييماً' : 'Highest Rated'}</SelectItem>
              <SelectItem value="reviews">{isRTL ? 'الأكثر مراجعات' : 'Most Reviews'}</SelectItem>
              <SelectItem value="price_asc">{isRTL ? 'السعر: الأقل' : 'Price: Low to High'}</SelectItem>
              <SelectItem value="price_desc">{isRTL ? 'السعر: الأعلى' : 'Price: High to Low'}</SelectItem>
              <SelectItem value="duration">{isRTL ? 'المدة: الأقصر' : 'Duration: Shortest'}</SelectItem>
            </SelectContent>
          </Select>

          {/* Mobile Filters */}
          <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden gap-2">
                <Filter className="h-4 w-4" />
                {isRTL ? 'تصفية' : 'Filters'}
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? 'right' : 'left'}>
              <SheetHeader>
                <SheetTitle>{isRTL ? 'تصفية النتائج' : 'Filter Results'}</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FiltersContent />
              </div>
            </SheetContent>
          </Sheet>

          {/* View Mode Toggle */}
          <div className="hidden md:flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <GlassCard>
              <GlassCardHeader>
                <h3 className="font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {isRTL ? 'تصفية' : 'Filters'}
                </h3>
              </GlassCardHeader>
              <GlassCardContent>
                <FiltersContent />
              </GlassCardContent>
            </GlassCard>
          </aside>

          {/* Services Grid/List */}
          <div className="flex-1">
            {isLoading ? (
              <div className={cn(
                'grid gap-4 md:gap-6',
                viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
              )}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-16 mb-2" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3 mt-2" />
                    </CardContent>
                    <CardFooter>
                      <Skeleton className="h-10 w-24" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : filteredServices.length === 0 ? (
              <EmptyState />
            ) : (
              <div className={cn(
                'grid gap-4 md:gap-6',
                viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
              )}>
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    isCompareSelected={compareList.includes(service.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile FAB for Filters */}
        <div className="md:hidden">
          <FloatingActionButton
            icon={<Filter className="h-5 w-5" />}
            onClick={() => setMobileFilterOpen(true)}
          />
        </div>
      </div>
    </Layout>
  );
}
