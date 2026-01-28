import { DashboardLayout } from '@/components/layout';
import { KycVerificationForm } from '@/components/provider/KycVerificationForm';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export default function KycPage() {
  const { t, isRTL } = useLanguage();

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className={cn('text-2xl font-bold mb-1', isRTL && 'font-arabic')}>
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
    </DashboardLayout>
  );
}
