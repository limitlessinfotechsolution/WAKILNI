import { FileText, Plus, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { useVendor } from '@/hooks/useVendor';
import { Link } from 'react-router-dom';

export default function VendorServicesPage() {
  const { isRTL } = useLanguage();
  const { services, isLoading } = useVendor();

  const getServiceTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      umrah: 'bg-emerald-500',
      hajj: 'bg-amber-500',
      ziyarat: 'bg-purple-500',
    };
    return <Badge className={colors[type] || 'bg-gray-500'}>{type.toUpperCase()}</Badge>;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'إدارة الخدمات' : 'Service Management'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'إدارة الخدمات المتاحة من خلال مقدمي الخدمات' : 'Manage services available through your providers'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{services.length}</p>
              <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي الخدمات' : 'Total Services'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600">
                {services.filter(s => s.is_active).length}
              </p>
              <p className="text-sm text-muted-foreground">{isRTL ? 'نشطة' : 'Active'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-emerald-600">
                {services.filter(s => s.service_type === 'umrah').length}
              </p>
              <p className="text-sm text-muted-foreground">{isRTL ? 'عمرة' : 'Umrah'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-amber-600">
                {services.filter(s => s.service_type === 'hajj').length}
              </p>
              <p className="text-sm text-muted-foreground">{isRTL ? 'حج' : 'Hajj'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Services List */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'قائمة الخدمات' : 'Services List'}</CardTitle>
            <CardDescription>
              {services.length} {isRTL ? 'خدمة متاحة' : 'service(s) available'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">{isRTL ? 'لا توجد خدمات' : 'No services yet'}</p>
                <p className="text-muted-foreground mb-4">
                  {isRTL ? 'الخدمات ستظهر عندما يضيفها مقدمو الخدمات' : 'Services will appear when providers add them'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <Card key={service.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        {getServiceTypeBadge(service.service_type)}
                        <Badge variant={service.is_active ? 'default' : 'secondary'}>
                          {service.is_active ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'معطل' : 'Inactive')}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">
                        {isRTL ? service.title_ar || service.title : service.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            {service.currency || 'SAR'} {service.price}
                          </p>
                          {service.duration_days && (
                            <p className="text-sm text-muted-foreground">
                              {service.duration_days} {isRTL ? 'يوم' : 'days'}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link to={`/services/${service.id}`}>
                          <Eye className="h-4 w-4 me-1" />
                          {isRTL ? 'عرض التفاصيل' : 'View Details'}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
