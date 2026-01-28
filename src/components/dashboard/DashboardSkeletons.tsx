import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Stat Card Skeleton - matches StatCard from mobile-card.tsx
export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-3 md:p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-12" />
        </div>
        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
      </div>
    </div>
  );
}

// Widget Card Skeleton - matches WidgetCard from mobile-card.tsx
export function WidgetCardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 md:p-4 pb-2 flex flex-row items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="p-3 md:p-4 pt-0 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" style={{ width: `${100 - i * 15}%` }} />
        ))}
      </CardContent>
    </Card>
  );
}

// Action Card Skeleton
export function ActionCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-3 md:pt-6 md:p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32 hidden sm:block" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Prayer Time Widget Skeleton
export function PrayerTimeWidgetSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 md:p-4 pb-2 flex flex-row items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="p-3 md:p-4 pt-0">
        <div className="text-center mb-3 space-y-2">
          <Skeleton className="h-3 w-20 mx-auto" />
          <Skeleton className="h-6 w-16 mx-auto" />
          <Skeleton className="h-5 w-12 mx-auto" />
        </div>
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="text-center p-1.5 space-y-1">
              <Skeleton className="h-3 w-10 mx-auto" />
              <Skeleton className="h-3 w-8 mx-auto" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Generic Dashboard Skeleton for Traveler
export function TravelerDashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Welcome Header */}
      <div className="space-y-1">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3">
          <ActionCardSkeleton />
          <ActionCardSkeleton />
          <ActionCardSkeleton />
        </div>
      </div>

      {/* Islamic Widgets */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <WidgetCardSkeleton key={i} lines={3} />
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="p-4 md:p-6 pb-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-36" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="flex flex-col items-center py-8">
            <Skeleton className="h-12 w-12 rounded-full mb-4" />
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-48 mb-4" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Admin Dashboard Skeleton
export function AdminDashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="p-4">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-4">
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Provider Dashboard Skeleton
export function ProviderDashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-4 w-60" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <ActionCardSkeleton key={i} />
        ))}
      </div>

      {/* Widgets */}
      <div className="grid md:grid-cols-2 gap-4">
        <WidgetCardSkeleton lines={4} />
        <WidgetCardSkeleton lines={4} />
      </div>
    </div>
  );
}

// Vendor Dashboard Skeleton
export function VendorDashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Company Profile Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-3 md:p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 md:h-16 md:w-16 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <WidgetCardSkeleton key={i} lines={3} />
        ))}
      </div>
    </div>
  );
}

