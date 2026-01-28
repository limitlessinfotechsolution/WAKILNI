import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { Image, Upload, Grid, List, Filter } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function GalleryPage() {
  const { isRTL } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 md:p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
              <Image className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <h1 className={cn('text-xl md:text-2xl font-bold', isRTL && 'font-arabic')}>
                {isRTL ? 'معرض الإثباتات' : 'Proof Gallery'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'صور وفيديوهات إثبات الخدمات' : 'Service completion photos & videos'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="h-4 w-4 me-2" />
              {isRTL ? 'تصفية' : 'Filter'}
            </Button>
            <div className="flex border rounded-lg p-0.5">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'ghost'} 
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 md:py-16 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Image className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
            </div>
            <h3 className={cn('font-semibold text-lg mb-2', isRTL && 'font-arabic')}>
              {isRTL ? 'لا توجد صور في المعرض' : 'No photos in gallery'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              {isRTL 
                ? 'ستظهر صور إثبات الخدمات المكتملة هنا تلقائياً'
                : 'Completed service proof photos will appear here automatically'
              }
            </p>
            <Button>
              <Upload className="h-4 w-4 me-2" />
              {isRTL ? 'رفع صور' : 'Upload Photos'}
            </Button>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 border-emerald-200 dark:border-emerald-800">
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400">0</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                  {isRTL ? 'إجمالي الصور' : 'Total Photos'}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">0</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  {isRTL ? 'الخدمات الموثقة' : 'Documented Services'}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50 border-amber-200 dark:border-amber-800 sm:col-span-2 lg:col-span-1">
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-400">0</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  {isRTL ? 'بانتظار المراجعة' : 'Pending Review'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
