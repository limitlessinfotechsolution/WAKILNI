import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/layout';
import { KycVerificationForm } from '@/components/provider/KycVerificationForm';
import { PilgrimCertificationForm } from '@/components/provider/PilgrimCertificationForm';
import { useLanguage } from '@/lib/i18n';
import { Building2, Shield } from 'lucide-react';

export default function KycPage() {
  const { isRTL } = useLanguage();

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isRTL ? 'التحقق والاعتماد' : 'Verification & Certification'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL 
                ? 'أكمل ملفك الشخصي واحصل على شهادة المعتمر الموثق'
                : 'Complete your profile and get certified as a verified pilgrim'}
            </p>
          </div>
        </div>

        {/* Tabs for Provider KYC and Pilgrim Certification */}
        <Tabs defaultValue="provider" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="provider" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {isRTL ? 'ملف مقدم الخدمة' : 'Provider Profile'}
            </TabsTrigger>
            <TabsTrigger value="pilgrim" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {isRTL ? 'شهادة المعتمر' : 'Pilgrim Certification'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="provider" className="space-y-6">
            <KycVerificationForm />
          </TabsContent>

          <TabsContent value="pilgrim" className="space-y-6">
            <PilgrimCertificationForm />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
