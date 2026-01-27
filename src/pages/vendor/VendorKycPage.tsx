import { MainLayout } from '@/components/layout';
import { VendorKycForm } from '@/components/vendor/VendorKycForm';
import { useLanguage } from '@/lib/i18n';

export default function VendorKycPage() {
  const { isRTL } = useLanguage();

  return (
    <MainLayout>
      <div className="container py-8 px-4 max-w-3xl">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isRTL ? 'font-arabic' : ''}`}>
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
    </MainLayout>
  );
}
