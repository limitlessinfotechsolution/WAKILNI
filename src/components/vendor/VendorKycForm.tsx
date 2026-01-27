import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Loader2,
  Building2,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useVendorKyc, type KycStatus, type VendorKycFormData } from '@/hooks/useVendorKyc';
import { cn } from '@/lib/utils';

// Saudi Commercial Registration validation (10 digits)
const crRegex = /^\d{10}$/;
// Saudi Tax Number validation (15 digits starting with 3)
const taxRegex = /^3\d{14}$/;
// Saudi phone validation
const phoneRegex = /^((\+966)|0)?5\d{8}$/;

const vendorKycSchema = z.object({
  company_name: z.string().min(2, 'Company name is required').max(100),
  company_name_ar: z.string().max(100).optional(),
  commercial_registration: z.string()
    .regex(crRegex, 'Commercial Registration must be exactly 10 digits')
    .optional()
    .or(z.literal('')),
  tax_number: z.string()
    .regex(taxRegex, 'Tax Number must be 15 digits starting with 3')
    .optional()
    .or(z.literal('')),
  contact_email: z.string().email('Invalid email address'),
  contact_phone: z.string()
    .regex(phoneRegex, 'Invalid Saudi phone number (e.g., 05XXXXXXXX)')
    .optional()
    .or(z.literal('')),
  address: z.string().min(10, 'Address must be at least 10 characters').max(500),
  address_ar: z.string().max(500).optional(),
  is_saudi_registered: z.boolean(),
}).refine((data) => {
  // If Saudi registered, CR and Tax number are required
  if (data.is_saudi_registered) {
    return data.commercial_registration && data.tax_number;
  }
  return true;
}, {
  message: 'Commercial Registration and Tax Number are required for Saudi registered companies',
  path: ['is_saudi_registered'],
});

interface Document {
  id: string;
  name: string;
  type: 'cr_certificate' | 'tax_certificate' | 'license';
  uploadedAt: string;
}

const statusConfig: Record<KycStatus, { icon: typeof Clock; color: string; bgColor: string }> = {
  pending: { icon: Clock, color: 'text-muted-foreground', bgColor: 'bg-muted' },
  under_review: { icon: AlertCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  approved: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  rejected: { icon: XCircle, color: 'text-destructive', bgColor: 'bg-destructive/10' },
};

export function VendorKycForm() {
  const { isRTL } = useLanguage();
  const { vendor, isLoading, createVendor, updateVendor, submitForKyc } = useVendorKyc();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<VendorKycFormData>({
    resolver: zodResolver(vendorKycSchema),
    defaultValues: {
      company_name: '',
      company_name_ar: '',
      commercial_registration: '',
      tax_number: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      address_ar: '',
      is_saudi_registered: true,
    },
  });

  // Reset form when vendor data loads
  useEffect(() => {
    if (vendor) {
      form.reset({
        company_name: vendor.company_name || '',
        company_name_ar: vendor.company_name_ar || '',
        commercial_registration: vendor.commercial_registration || '',
        tax_number: vendor.tax_number || '',
        contact_email: vendor.contact_email || '',
        contact_phone: vendor.contact_phone || '',
        address: vendor.address || '',
        address_ar: vendor.address_ar || '',
        is_saudi_registered: vendor.is_saudi_registered ?? true,
      });
    }
  }, [vendor, form]);

  const isSaudiRegistered = form.watch('is_saudi_registered');
  const kycStatus: KycStatus = (vendor?.kyc_status as KycStatus) || 'pending';
  const StatusIcon = statusConfig[kycStatus].icon;

  const handleSave = async (data: VendorKycFormData) => {
    setIsSaving(true);
    try {
      if (vendor) {
        await updateVendor(data);
      } else {
        await createVendor(data);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitKyc = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    // Check if Saudi registered without required documents
    const formData = form.getValues();
    if (formData.is_saudi_registered) {
      if (!formData.commercial_registration || !formData.tax_number) {
        form.setError('is_saudi_registered', {
          message: 'Commercial Registration and Tax Number are required for Saudi registered companies',
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const values = form.getValues();
      await handleSave(values);
      await submitForKyc();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDocument = (type: Document['type']) => {
    const names = {
      cr_certificate: isRTL ? 'شهادة السجل التجاري' : 'CR Certificate',
      tax_certificate: isRTL ? 'شهادة ضريبة القيمة المضافة' : 'VAT Tax Certificate',
      license: isRTL ? 'رخصة العمل' : 'Business License',
    };
    const newDoc: Document = {
      id: Date.now().toString(),
      name: names[type],
      type,
      uploadedAt: new Date().toISOString(),
    };
    setDocuments([...documents, newDoc]);
  };

  const handleRemoveDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
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
                {kycStatus === 'pending' && (isRTL ? 'في انتظار التحقق' : 'Pending Verification')}
                {kycStatus === 'under_review' && (isRTL ? 'قيد المراجعة' : 'Under Review')}
                {kycStatus === 'approved' && (isRTL ? 'تم التحقق' : 'Verified')}
                {kycStatus === 'rejected' && (isRTL ? 'مرفوض' : 'Rejected')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {kycStatus === 'pending' && (isRTL 
                  ? 'أكمل بيانات شركتك وأرفق المستندات المطلوبة للتحقق'
                  : 'Complete your company details and upload required documents for verification')}
                {kycStatus === 'under_review' && (isRTL 
                  ? 'طلبك قيد المراجعة من فريقنا. سنرد عليك خلال 2-3 أيام عمل'
                  : 'Your application is being reviewed. We will respond within 2-3 business days')}
                {kycStatus === 'approved' && (isRTL 
                  ? 'تم التحقق من وكالتك ويمكنك الآن إدارة مقدمي الخدمات والحجوزات'
                  : 'Your agency is verified and you can now manage providers and bookings')}
                {kycStatus === 'rejected' && (isRTL 
                  ? 'تم رفض طلبك. يرجى مراجعة الملاحظات والتقديم مرة أخرى'
                  : 'Your application was rejected. Please review the notes and resubmit')}
              </p>
            </div>
            <Badge variant="outline" className={statusConfig[kycStatus].color}>
              {kycStatus === 'pending' && (isRTL ? 'معلق' : 'Pending')}
              {kycStatus === 'under_review' && (isRTL ? 'قيد المراجعة' : 'Under Review')}
              {kycStatus === 'approved' && (isRTL ? 'تم التحقق' : 'Verified')}
              {kycStatus === 'rejected' && (isRTL ? 'مرفوض' : 'Rejected')}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Rejection Notes */}
      {kycStatus === 'rejected' && vendor?.kyc_notes && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>{isRTL ? 'سبب الرفض' : 'Rejection Reason'}</AlertTitle>
          <AlertDescription>{vendor.kyc_notes}</AlertDescription>
        </Alert>
      )}

      {/* Saudi Registration Check */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>{isRTL ? 'التسجيل في المملكة العربية السعودية' : 'Saudi Arabia Registration'}</CardTitle>
              <CardDescription>
                {isRTL 
                  ? 'هل شركتك مسجلة رسمياً في المملكة العربية السعودية؟'
                  : 'Is your company officially registered in Saudi Arabia?'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <FormField
              control={form.control}
              name="is_saudi_registered"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rtl:space-x-reverse rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!isEditable}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      {isRTL 
                        ? 'نعم، شركتي مسجلة في المملكة العربية السعودية'
                        : 'Yes, my company is registered in Saudi Arabia'}
                    </FormLabel>
                    <FormDescription>
                      {isRTL 
                        ? 'الشركات المسجلة في السعودية يجب أن توفر السجل التجاري ورقم ضريبة القيمة المضافة'
                        : 'Saudi registered companies must provide Commercial Registration and VAT Tax Number'}
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>{isRTL ? 'معلومات الشركة' : 'Company Information'}</CardTitle>
              <CardDescription>
                {isRTL 
                  ? 'أدخل معلومات وكالة السفر الخاصة بك'
                  : 'Enter your travel agency information'}
              </CardDescription>
            </div>
          </div>
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
                      <FormLabel>{isRTL ? 'اسم الشركة (بالإنجليزية) *' : 'Company Name (English) *'}</FormLabel>
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

              {/* Saudi Registration Fields */}
              {isSaudiRegistered && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <FormField
                    control={form.control}
                    name="commercial_registration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'رقم السجل التجاري *' : 'Commercial Registration No. *'}</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            disabled={!isEditable}
                            placeholder="1234567890"
                            maxLength={10}
                          />
                        </FormControl>
                        <FormDescription>
                          {isRTL ? '10 أرقام' : '10 digits'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tax_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'الرقم الضريبي (VAT) *' : 'VAT Tax Number *'}</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            disabled={!isEditable}
                            placeholder="300000000000003"
                            maxLength={15}
                          />
                        </FormControl>
                        <FormDescription>
                          {isRTL ? '15 رقم يبدأ بـ 3' : '15 digits starting with 3'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'البريد الإلكتروني *' : 'Contact Email *'}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          disabled={!isEditable}
                          placeholder="info@company.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'رقم الهاتف' : 'Contact Phone'}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={!isEditable}
                          placeholder="05XXXXXXXX"
                          dir="ltr"
                        />
                      </FormControl>
                      <FormDescription>
                        {isRTL ? 'رقم سعودي' : 'Saudi phone number'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'العنوان (بالإنجليزية) *' : 'Address (English) *'}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={!isEditable}
                          placeholder={isRTL ? 'أدخل عنوان الشركة' : 'Enter company address'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address_ar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'العنوان (بالعربية)' : 'Address (Arabic)'}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          dir="rtl"
                          disabled={!isEditable}
                          placeholder={isRTL ? 'أدخل العنوان بالعربية' : 'Enter address in Arabic'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isEditable && (
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                  {isRTL ? 'حفظ' : 'Save'}
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Document Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? 'المستندات المطلوبة' : 'Required Documents'}</CardTitle>
          <CardDescription>
            {isRTL 
              ? 'ارفع المستندات الرسمية للتحقق من شركتك'
              : 'Upload official documents to verify your company'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {isEditable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(doc.id)}
                    >
                      {isRTL ? 'إزالة' : 'Remove'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{isRTL ? 'لم يتم رفع أي مستندات بعد' : 'No documents uploaded yet'}</p>
            </div>
          )}

          {isEditable && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => handleAddDocument('cr_certificate')}
              >
                <Upload className="me-2 h-4 w-4" />
                {isRTL ? 'السجل التجاري' : 'CR Certificate'}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAddDocument('tax_certificate')}
              >
                <Upload className="me-2 h-4 w-4" />
                {isRTL ? 'شهادة الضريبة' : 'Tax Certificate'}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAddDocument('license')}
              >
                <Upload className="me-2 h-4 w-4" />
                {isRTL ? 'رخصة العمل' : 'Business License'}
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {isRTL ? '(تجريبي - ستتم إضافة رفع الملفات الفعلي قريباً)' : '(Demo - actual file upload coming soon)'}
          </p>
        </CardContent>
      </Card>

      {/* Submit for KYC */}
      {isEditable && (
        <Card className="border-primary/20">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">
                  {isRTL ? 'جاهز للتقديم؟' : 'Ready to Submit?'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isRTL 
                    ? 'تأكد من إكمال جميع المعلومات ورفع المستندات المطلوبة'
                    : 'Make sure all information is complete and documents are uploaded'}
                </p>
              </div>
              <Button 
                size="lg" 
                onClick={handleSubmitKyc}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {isRTL ? 'تقديم للتحقق' : 'Submit for Verification'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
