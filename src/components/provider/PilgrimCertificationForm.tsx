import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Upload, CheckCircle, Clock, XCircle, AlertCircle, Loader2,
  Shield, Video, Camera, FileCheck, Award, Calendar, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
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
import { usePilgrimCertification, type PilgrimStatus } from '@/hooks/usePilgrimCertification';
import { useProvider } from '@/hooks/useProvider';
import { cn } from '@/lib/utils';

const certificationSchema = z.object({
  has_completed_own_umrah: z.boolean(),
  own_umrah_date: z.string().optional(),
  has_completed_own_hajj: z.boolean(),
  own_hajj_date: z.string().optional(),
  video_oath_transcript: z.string().max(2000).optional(),
});

type CertificationFormData = z.infer<typeof certificationSchema>;

const statusConfig: Record<PilgrimStatus, { icon: any; color: string; bgColor: string; label: string; labelAr: string }> = {
  pending: { 
    icon: Clock, 
    color: 'text-muted-foreground', 
    bgColor: 'bg-muted',
    label: 'Pending Submission',
    labelAr: 'في انتظار التقديم'
  },
  under_review: { 
    icon: AlertCircle, 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-50',
    label: 'Under Scholar Review',
    labelAr: 'قيد مراجعة العلماء'
  },
  verified: { 
    icon: CheckCircle, 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-50',
    label: 'Verified Pilgrim',
    labelAr: 'معتمر موثق'
  },
  suspended: { 
    icon: XCircle, 
    color: 'text-destructive', 
    bgColor: 'bg-destructive/10',
    label: 'Suspended',
    labelAr: 'موقوف'
  },
  inactive: { 
    icon: AlertTriangle, 
    color: 'text-muted-foreground', 
    bgColor: 'bg-muted',
    label: 'Inactive',
    labelAr: 'غير نشط'
  },
};

export function PilgrimCertificationForm() {
  const { isRTL } = useLanguage();
  const { provider, isLoading: providerLoading } = useProvider();
  const { 
    certification, 
    isLoading, 
    createCertification,
    updateCertification, 
    submitForVerification,
    getCompletionPercentage,
    isReadyForSubmission
  } = usePilgrimCertification();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<CertificationFormData>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      has_completed_own_umrah: certification?.has_completed_own_umrah || false,
      own_umrah_date: certification?.own_umrah_date || '',
      has_completed_own_hajj: certification?.has_completed_own_hajj || false,
      own_hajj_date: certification?.own_hajj_date || '',
      video_oath_transcript: certification?.video_oath_transcript || '',
    },
  });

  // Update form when certification loads
  useEffect(() => {
    if (certification) {
      form.reset({
        has_completed_own_umrah: certification.has_completed_own_umrah,
        own_umrah_date: certification.own_umrah_date || '',
        has_completed_own_hajj: certification.has_completed_own_hajj,
        own_hajj_date: certification.own_hajj_date || '',
        video_oath_transcript: certification.video_oath_transcript || '',
      });
    }
  }, [certification]);

  const pilgrimStatus = certification?.status || 'pending';
  const StatusIcon = statusConfig[pilgrimStatus].icon;
  const completionPercentage = getCompletionPercentage();

  const handleSave = async (data: CertificationFormData) => {
    setIsSaving(true);
    try {
      if (certification) {
        await updateCertification(data);
      } else {
        await createCertification(data);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await handleSave(form.getValues());
      await submitForVerification();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock upload handlers (will be connected to real storage later)
  const handleUploadGovernmentId = async () => {
    if (!certification) {
      await createCertification({ government_id_url: 'demo://government-id.jpg' });
    } else {
      await updateCertification({ government_id_url: 'demo://government-id.jpg' });
    }
  };

  const handleUploadPhoto = async () => {
    if (!certification) {
      await createCertification({ photo_verification_url: 'demo://photo.jpg' });
    } else {
      await updateCertification({ photo_verification_url: 'demo://photo.jpg' });
    }
  };

  const handleUploadVideoOath = async () => {
    if (!certification) {
      await createCertification({ video_oath_url: 'demo://video-oath.mp4' });
    } else {
      await updateCertification({ video_oath_url: 'demo://video-oath.mp4' });
    }
  };

  if (isLoading || providerLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!provider) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{isRTL ? 'مطلوب ملف مقدم الخدمة' : 'Provider Profile Required'}</AlertTitle>
        <AlertDescription>
          {isRTL 
            ? 'يرجى إكمال ملف مقدم الخدمة أولاً قبل التقدم لشهادة المعتمر'
            : 'Please complete your provider profile first before applying for pilgrim certification'}
        </AlertDescription>
      </Alert>
    );
  }

  const isEditable = pilgrimStatus === 'pending' || pilgrimStatus === 'inactive';

  return (
    <div className="space-y-6">
      {/* Trust Score & Status Banner */}
      <Card className={cn('border-2', statusConfig[pilgrimStatus].bgColor)}>
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className={cn('p-4 rounded-full', statusConfig[pilgrimStatus].bgColor)}>
                <StatusIcon className={cn('h-8 w-8', statusConfig[pilgrimStatus].color)} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {isRTL ? statusConfig[pilgrimStatus].labelAr : statusConfig[pilgrimStatus].label}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {pilgrimStatus === 'pending' && (isRTL 
                    ? 'أكمل جميع متطلبات التحقق للتقديم لمراجعة العلماء'
                    : 'Complete all verification requirements to submit for scholar review')}
                  {pilgrimStatus === 'under_review' && (isRTL 
                    ? 'طلبك قيد المراجعة من قبل مجلس العلماء'
                    : 'Your application is being reviewed by the scholar board')}
                  {pilgrimStatus === 'verified' && (isRTL 
                    ? 'أنت معتمد لأداء خدمات العمرة بالنيابة'
                    : 'You are certified to perform Umrah Badal services')}
                  {pilgrimStatus === 'suspended' && (isRTL 
                    ? 'تم تعليق شهادتك. يرجى مراجعة الملاحظات'
                    : 'Your certification has been suspended. Please review the notes')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {certification && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{certification.trust_score}</div>
                  <div className="text-xs text-muted-foreground">{isRTL ? 'نقاط الثقة' : 'Trust Score'}</div>
                </div>
              )}
              <Badge 
                variant="outline" 
                className={cn('text-sm px-3 py-1', statusConfig[pilgrimStatus].color)}
              >
                {certification?.total_completed_rituals || 0} {isRTL ? 'عمرة مكتملة' : 'Completed'}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          {isEditable && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  {isRTL ? 'اكتمال التحقق' : 'Verification Progress'}
                </span>
                <span className="font-medium">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suspension Notice */}
      {pilgrimStatus === 'suspended' && certification?.suspension_reason && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>{isRTL ? 'سبب التعليق' : 'Suspension Reason'}</AlertTitle>
          <AlertDescription>{certification.suspension_reason}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Identity Verification */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {isRTL ? 'الخطوة ١: التحقق من الهوية' : 'Step 1: Identity Verification'}
              </CardTitle>
              <CardDescription>
                {isRTL 
                  ? 'ارفع هويتك الحكومية وصورة شخصية حديثة'
                  : 'Upload your government ID and a recent photo for verification'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Government ID */}
            <div className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
              certification?.government_id_url 
                ? 'border-emerald-500 bg-emerald-50' 
                : 'border-muted-foreground/25 hover:border-primary'
            )}>
              {certification?.government_id_url ? (
                <div className="space-y-2">
                  <CheckCircle className="h-10 w-10 mx-auto text-emerald-600" />
                  <p className="font-medium text-emerald-700">
                    {isRTL ? 'تم رفع الهوية' : 'ID Uploaded'}
                  </p>
                  {certification.government_id_verified && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      {isRTL ? 'تم التحقق' : 'Verified'}
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <FileCheck className="h-10 w-10 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium">{isRTL ? 'الهوية الحكومية' : 'Government ID'}</p>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'بطاقة الهوية السعودية أو جواز السفر' : 'Saudi ID card or passport'}
                    </p>
                  </div>
                  {isEditable && (
                    <Button variant="outline" size="sm" onClick={handleUploadGovernmentId}>
                      <Upload className="h-4 w-4 me-2" />
                      {isRTL ? 'رفع (تجريبي)' : 'Upload (Demo)'}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Photo Verification */}
            <div className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
              certification?.photo_verification_url 
                ? 'border-emerald-500 bg-emerald-50' 
                : 'border-muted-foreground/25 hover:border-primary'
            )}>
              {certification?.photo_verification_url ? (
                <div className="space-y-2">
                  <CheckCircle className="h-10 w-10 mx-auto text-emerald-600" />
                  <p className="font-medium text-emerald-700">
                    {isRTL ? 'تم رفع الصورة' : 'Photo Uploaded'}
                  </p>
                  {certification.photo_verified && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      {isRTL ? 'تم التحقق' : 'Verified'}
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <Camera className="h-10 w-10 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium">{isRTL ? 'صورة التحقق' : 'Verification Photo'}</p>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'صورة شخصية حديثة واضحة' : 'Clear recent photo of yourself'}
                    </p>
                  </div>
                  {isEditable && (
                    <Button variant="outline" size="sm" onClick={handleUploadPhoto}>
                      <Upload className="h-4 w-4 me-2" />
                      {isRTL ? 'رفع (تجريبي)' : 'Upload (Demo)'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Religious Qualifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {isRTL ? 'الخطوة ٢: المؤهلات الدينية' : 'Step 2: Religious Qualifications'}
              </CardTitle>
              <CardDescription>
                {isRTL 
                  ? 'أكد أنك أديت العمرة أو الحج لنفسك'
                  : 'Confirm you have performed Umrah or Hajj for yourself'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
              <div className="space-y-4">
                {/* Own Umrah */}
                <div className="flex items-start space-x-4 rtl:space-x-reverse p-4 border rounded-lg">
                  <FormField
                    control={form.control}
                    name="has_completed_own_umrah"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 rtl:space-x-reverse space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!isEditable}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base font-medium">
                            {isRTL ? 'لقد أديت العمرة لنفسي' : 'I have performed Umrah for myself'}
                          </FormLabel>
                          <FormDescription>
                            {isRTL 
                              ? 'يجب أن تكون قد أديت العمرة لنفسك قبل أداءها بالنيابة'
                              : 'You must have performed Umrah for yourself before performing it on behalf of others'}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch('has_completed_own_umrah') && (
                  <FormField
                    control={form.control}
                    name="own_umrah_date"
                    render={({ field }) => (
                      <FormItem className="ms-8">
                        <FormLabel>{isRTL ? 'تاريخ أداء العمرة' : 'Date of Umrah'}</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            disabled={!isEditable}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Separator />

                {/* Own Hajj */}
                <div className="flex items-start space-x-4 rtl:space-x-reverse p-4 border rounded-lg">
                  <FormField
                    control={form.control}
                    name="has_completed_own_hajj"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 rtl:space-x-reverse space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!isEditable}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base font-medium">
                            {isRTL ? 'لقد أديت الحج لنفسي' : 'I have performed Hajj for myself'}
                          </FormLabel>
                          <FormDescription>
                            {isRTL 
                              ? 'مطلوب لتقديم خدمات الحج بالنيابة (اختياري للعمرة)'
                              : 'Required to offer Hajj Badal services (optional for Umrah)'}
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch('has_completed_own_hajj') && (
                  <FormField
                    control={form.control}
                    name="own_hajj_date"
                    render={({ field }) => (
                      <FormItem className="ms-8">
                        <FormLabel>{isRTL ? 'تاريخ أداء الحج' : 'Date of Hajj'}</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            disabled={!isEditable}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
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

      {/* Step 3: Video Oath (Niyyah) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {isRTL ? 'الخطوة ٣: القسم المرئي (النية)' : 'Step 3: Video Oath (Niyyah)'}
              </CardTitle>
              <CardDescription>
                {isRTL 
                  ? 'سجّل إعلان نيتك للتحقق من قبل العلماء'
                  : 'Record your declaration of intention for scholar verification'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-amber-50 border-amber-200">
            <Shield className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">
              {isRTL ? 'نص القسم المطلوب' : 'Required Oath Script'}
            </AlertTitle>
            <AlertDescription className="text-amber-700 mt-2">
              <p className="font-arabic text-lg leading-relaxed" dir="rtl">
                "أشهد أني أنوي أداء العمرة بالنيابة عن من يُوكلني بإخلاص، متبعاً أحكام الشريعة الإسلامية، 
                وألتزم بالصدق والأمانة في جميع ما أقوم به."
              </p>
              <p className="mt-3 text-sm">
                {isRTL 
                  ? 'يجب أن يتضمن الفيديو: اسمك الكامل، هويتك، والنص أعلاه'
                  : 'Video must include: your full name, ID, and the oath above'}
              </p>
            </AlertDescription>
          </Alert>

          <div className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            certification?.video_oath_url 
              ? 'border-emerald-500 bg-emerald-50' 
              : 'border-muted-foreground/25 hover:border-primary'
          )}>
            {certification?.video_oath_url ? (
              <div className="space-y-3">
                <CheckCircle className="h-12 w-12 mx-auto text-emerald-600" />
                <p className="font-medium text-emerald-700 text-lg">
                  {isRTL ? 'تم رفع فيديو النية' : 'Oath Video Uploaded'}
                </p>
                {certification.video_oath_verified ? (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    <CheckCircle className="h-3 w-3 me-1" />
                    {isRTL ? 'تم التحقق من قبل العلماء' : 'Verified by Scholar'}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                    <Clock className="h-3 w-3 me-1" />
                    {isRTL ? 'في انتظار مراجعة العلماء' : 'Pending Scholar Review'}
                  </Badge>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Video className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium text-lg">{isRTL ? 'فيديو القسم' : 'Oath Video'}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL 
                      ? 'سجّل فيديو قصير (30-60 ثانية) تتلو فيه النص أعلاه'
                      : 'Record a short video (30-60 seconds) reciting the oath above'}
                  </p>
                </div>
                {isEditable && (
                  <Button variant="outline" onClick={handleUploadVideoOath}>
                    <Upload className="h-4 w-4 me-2" />
                    {isRTL ? 'رفع فيديو (تجريبي)' : 'Upload Video (Demo)'}
                  </Button>
                )}
              </div>
            )}
          </div>

          <Form {...form}>
            <FormField
              control={form.control}
              name="video_oath_transcript"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isRTL ? 'نص القسم (اختياري)' : 'Oath Transcript (Optional)'}</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={3}
                      disabled={!isEditable}
                      placeholder={isRTL 
                        ? 'اكتب نص القسم الذي ستتلوه في الفيديو...'
                        : 'Write the oath text you will recite in the video...'}
                      dir="rtl"
                    />
                  </FormControl>
                  <FormDescription>
                    {isRTL 
                      ? 'هذا يساعد في عملية التحقق'
                      : 'This helps with the verification process'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </CardContent>
      </Card>

      {/* Submit for Scholar Verification */}
      {isEditable && (
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {isRTL ? 'جاهز لمراجعة العلماء؟' : 'Ready for Scholar Review?'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isReadyForSubmission() 
                    ? (isRTL 
                        ? 'جميع المتطلبات مكتملة. يمكنك الآن التقديم للمراجعة'
                        : 'All requirements complete. You can now submit for review')
                    : (isRTL 
                        ? 'أكمل جميع الخطوات أعلاه للتقديم'
                        : 'Complete all steps above to submit')}
                </p>
              </div>
              <Button 
                size="lg" 
                onClick={handleSubmit}
                disabled={isSubmitting || !isReadyForSubmission()}
                className="min-w-[200px]"
              >
                {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                <Shield className="me-2 h-4 w-4" />
                {isRTL ? 'تقديم للتحقق' : 'Submit for Verification'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verified Status - Active Badal Limit */}
      {pilgrimStatus === 'verified' && certification && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-emerald-100">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-800">
                    {isRTL ? 'شهادة معتمر نشطة' : 'Active Pilgrim Certification'}
                  </h3>
                  <p className="text-sm text-emerald-600">
                    {isRTL 
                      ? `يمكنك قبول حتى ${certification.max_active_badal} طلب بدل نشط`
                      : `You can accept up to ${certification.max_active_badal} active Badal requests`}
                  </p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-700">
                  {certification.current_active_badal}/{certification.max_active_badal}
                </div>
                <div className="text-xs text-emerald-600">
                  {isRTL ? 'نشط حالياً' : 'Currently Active'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
