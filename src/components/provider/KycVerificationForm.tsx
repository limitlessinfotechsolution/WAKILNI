import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, FileText, CheckCircle, Clock, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { useLanguage } from '@/lib/i18n';
import { useProvider, type KycStatus } from '@/hooks/useProvider';
import { cn } from '@/lib/utils';

const kycSchema = z.object({
  company_name: z.string().min(2, 'Company name is required').max(100),
  company_name_ar: z.string().max(100).optional(),
  bio: z.string().min(20, 'Bio must be at least 20 characters').max(1000),
  bio_ar: z.string().max(1000).optional(),
});

type KycFormData = z.infer<typeof kycSchema>;

interface Certification {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
}

const statusConfig: Record<KycStatus, { icon: any; color: string; bgColor: string }> = {
  pending: { icon: Clock, color: 'text-muted-foreground', bgColor: 'bg-muted' },
  under_review: { icon: AlertCircle, color: 'text-secondary', bgColor: 'bg-secondary/10' },
  approved: { icon: CheckCircle, color: 'text-primary', bgColor: 'bg-primary/10' },
  rejected: { icon: XCircle, color: 'text-destructive', bgColor: 'bg-destructive/10' },
};

export function KycVerificationForm() {
  const { t, isRTL } = useLanguage();
  const { provider, isLoading, createProvider, updateProvider, submitForKyc } = useProvider();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<KycFormData>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      company_name: provider?.company_name || '',
      company_name_ar: provider?.company_name_ar || '',
      bio: provider?.bio || '',
      bio_ar: provider?.bio_ar || '',
    },
  });

  const kycStatus = (provider?.kyc_status as KycStatus) || 'pending';
  const StatusIcon = statusConfig[kycStatus].icon;

  const handleSave = async (data: KycFormData) => {
    setIsSaving(true);
    try {
      const updates = {
        ...data,
        certifications: certifications as any,
      };

      if (provider) {
        await updateProvider(updates);
      } else {
        await createProvider(updates);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitKyc = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    if (certifications.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await handleSave(form.getValues());
      await submitForKyc();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCertification = () => {
    const newCert: Certification = {
      id: Date.now().toString(),
      name: isRTL ? 'شهادة جديدة' : 'New Certificate',
      type: 'certificate',
      uploadedAt: new Date().toISOString(),
    };
    setCertifications([...certifications, newCert]);
  };

  const handleRemoveCertification = (id: string) => {
    setCertifications(certifications.filter(c => c.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isEditable = kycStatus === 'pending' || kycStatus === 'rejected';

  return (
    <div className="space-y-6">
      {/* KYC Status Banner */}
      <Card className={cn('border-2', statusConfig[kycStatus].bgColor)}>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className={cn('p-3 rounded-full', statusConfig[kycStatus].bgColor)}>
              <StatusIcon className={cn('h-6 w-6', statusConfig[kycStatus].color)} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">
                {t.provider[`kyc${kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1).replace('_', '')}` as keyof typeof t.provider]}
              </h3>
              <p className="text-sm text-muted-foreground">
                {kycStatus === 'pending' && (isRTL 
                  ? 'أكمل ملفك الشخصي وأرفق الشهادات للتقديم للتحقق'
                  : 'Complete your profile and upload certifications to submit for verification')}
                {kycStatus === 'under_review' && (isRTL 
                  ? 'طلبك قيد المراجعة من فريقنا'
                  : 'Your application is being reviewed by our team')}
                {kycStatus === 'approved' && (isRTL 
                  ? 'تم التحقق من حسابك ويمكنك الآن تقديم الخدمات'
                  : 'Your account is verified and you can now offer services')}
                {kycStatus === 'rejected' && (isRTL 
                  ? 'تم رفض طلبك. يرجى مراجعة الملاحظات والتقديم مرة أخرى'
                  : 'Your application was rejected. Please review the notes and resubmit')}
              </p>
            </div>
            <Badge variant="outline" className={statusConfig[kycStatus].color}>
              {t.provider[`kyc${kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1).replace('_', '')}` as keyof typeof t.provider]}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Rejection Notes */}
      {kycStatus === 'rejected' && provider?.kyc_notes && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>{isRTL ? 'سبب الرفض' : 'Rejection Reason'}</AlertTitle>
          <AlertDescription>{provider.kyc_notes}</AlertDescription>
        </Alert>
      )}

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'معلومات الشركة' : 'Company Information'}</CardTitle>
          <CardDescription>
            {isRTL 
              ? 'أدخل معلومات شركتك أو عملك'
              : 'Enter your company or business information'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'اسم الشركة (بالإنجليزية)' : 'Company Name (English)'}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={!isEditable}
                          placeholder={isRTL ? 'أدخل اسم الشركة' : 'Enter company name'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_name_ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'اسم الشركة (بالعربية)' : 'Company Name (Arabic)'}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          dir="rtl"
                          disabled={!isEditable}
                          placeholder={isRTL ? 'أدخل اسم الشركة بالعربية' : 'Enter company name in Arabic'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isRTL ? 'نبذة عن الشركة (بالإنجليزية)' : 'About Company (English)'}</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={4}
                        disabled={!isEditable}
                        placeholder={isRTL 
                          ? 'اكتب نبذة عن شركتك وخبراتك في تقديم خدمات الحج والعمرة...'
                          : 'Describe your company and experience in providing Hajj & Umrah services...'}
                      />
                    </FormControl>
                    <FormDescription>
                      {isRTL ? 'على الأقل 20 حرفاً' : 'At least 20 characters'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio_ar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isRTL ? 'نبذة عن الشركة (بالعربية)' : 'About Company (Arabic)'}</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={4}
                        dir="rtl"
                        disabled={!isEditable}
                        placeholder={isRTL 
                          ? 'اكتب نبذة عن شركتك بالعربية...'
                          : 'Describe your company in Arabic...'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEditable && (
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                  {t.common.save}
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle>{t.provider.certifications}</CardTitle>
          <CardDescription>
            {isRTL 
              ? 'ارفع شهاداتك وتراخيصك للتحقق منها'
              : 'Upload your certifications and licenses for verification'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {certifications.length > 0 ? (
            <div className="space-y-3">
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(cert.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {isEditable && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCertification(cert.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{isRTL ? 'لم يتم رفع أي شهادات بعد' : 'No certifications uploaded yet'}</p>
            </div>
          )}

          {isEditable && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleAddCertification}
            >
              <Upload className="me-2 h-4 w-4" />
              {isRTL ? 'إضافة شهادة (تجريبي)' : 'Add Certification (Demo)'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Submit for KYC */}
      {isEditable && (
        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">
                  {isRTL ? 'جاهز للتقديم؟' : 'Ready to Submit?'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? 'تأكد من إكمال جميع المعلومات ورفع الشهادات المطلوبة'
                    : 'Make sure all information is complete and certifications are uploaded'}
                </p>
              </div>
              <Button 
                size="lg" 
                onClick={handleSubmitKyc}
                disabled={isSubmitting || certifications.length === 0}
              >
                {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {t.provider.submitKyc}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
