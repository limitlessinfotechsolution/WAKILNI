import { CreditCard } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { SubscriptionManagement } from '@/components/admin/SubscriptionManagement';

export default function SubscriptionsPage() {
  const { isRTL } = useLanguage();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold flex items-center gap-2 ${isRTL ? 'font-arabic' : ''}`}>
              <CreditCard className="h-6 w-6 text-primary" />
              {isRTL ? 'إدارة الاشتراكات' : 'Subscription Management'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isRTL 
                ? 'إدارة اشتراكات الوكلاء والباقات'
                : 'Manage vendor subscriptions and plans'}
            </p>
          </div>
        </div>

        {/* Subscription Management Component */}
        <SubscriptionManagement />
      </div>
    </DashboardLayout>
  );
}
