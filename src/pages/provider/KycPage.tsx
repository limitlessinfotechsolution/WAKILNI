import { MainLayout } from '@/components/layout';
import { KycVerificationForm } from '@/components/provider/KycVerificationForm';
import { useLanguage } from '@/lib/i18n';

export default function KycPage() {
  const { t, isRTL } = useLanguage();

  return (
    <MainLayout>
      <div className="container py-8 px-4 max-w-3xl">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isRTL ? 'font-arabic' : ''}`}>
            {t.provider.kyc}
          </h1>
          <p className="text-muted-foreground">
            {isRTL 
              ? 'أكمل عملية التحقق لبدء تقديم خدماتك على المنصة'
              : 'Complete verification to start offering your services on the platform'}
          </p>
        </div>

        <KycVerificationForm />
      </div>
    </MainLayout>
  );
}
