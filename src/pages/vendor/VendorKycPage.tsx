import { DashboardLayout } from '@/components/layout';
import { VendorKycForm } from '@/components/vendor/VendorKycForm';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export default function VendorKycPage() {
  const { isRTL } = useLanguage();

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className={cn('text-2xl font-bold mb-1', isRTL && 'font-arabic')}>
            {isRTL ? 'التحقق من الوكالة' : 'Agency Verification'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL 
              ? 'أكمل عملية التحقق لبدء إدارة مقدمي الخدمات والحجوزات على المنصة'
              : 'Complete verification to start managing providers and bookings on the platform'}
          </p>
        </div>

        <VendorKycForm />
      </div>
    </DashboardLayout>
  );
}
