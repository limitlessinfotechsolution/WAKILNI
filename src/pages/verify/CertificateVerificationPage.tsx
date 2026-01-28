import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CheckCircle, XCircle, Search, QrCode, Shield, Calendar, 
  User, MapPin, Loader2, AlertCircle, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { MainLayout } from '@/components/layout';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface CertificateData {
  id: string;
  certificate_number: string;
  beneficiary_name: string;
  beneficiary_name_ar: string | null;
  service_type: 'umrah' | 'hajj' | 'ziyarat';
  completed_date: string;
  hijri_date: string | null;
  location: string | null;
  all_steps_verified: boolean;
  issued_at: string;
  pilgrim?: {
    company_name: string | null;
    rating: number | null;
    total_bookings: number | null;
  };
}

export default function CertificateVerificationPage() {
  const { isRTL } = useLanguage();
  const [searchParams] = useSearchParams();
  const [certificateCode, setCertificateCode] = useState(searchParams.get('code') || '');
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const serviceTypeLabels = {
    umrah: { en: 'Umrah', ar: 'العمرة' },
    hajj: { en: 'Hajj', ar: 'الحج' },
    ziyarat: { en: 'Ziyarat', ar: 'الزيارة' },
  };

  const verifyCertificate = async (code: string) => {
    if (!code.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const { data, error: fetchError } = await supabase
        .from('completion_certificates')
        .select(`
          *,
          pilgrim:providers!completion_certificates_pilgrim_id_fkey (
            company_name,
            rating,
            total_bookings
          )
        `)
        .or(`qr_verification_code.eq.${code},certificate_number.eq.${code}`)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setCertificate(data as CertificateData);
      } else {
        setCertificate(null);
        setError(isRTL 
          ? 'لم يتم العثور على شهادة بهذا الرمز'
          : 'No certificate found with this code');
      }
    } catch (err) {
      console.error('Error verifying certificate:', err);
      setError(isRTL 
        ? 'حدث خطأ أثناء التحقق من الشهادة'
        : 'An error occurred while verifying the certificate');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      verifyCertificate(code);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCertificate(certificateCode);
  };

  return (
    <MainLayout>
      <div className="container max-w-2xl py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className={cn("text-2xl md:text-3xl font-bold mb-2", isRTL && "font-arabic")}>
            {isRTL ? 'التحقق من شهادة الإتمام' : 'Certificate Verification'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL 
              ? 'تحقق من صحة شهادة إتمام العمرة أو الحج'
              : 'Verify the authenticity of an Umrah or Hajj completion certificate'}
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              {isRTL ? 'أدخل رمز التحقق' : 'Enter Verification Code'}
            </CardTitle>
            <CardDescription>
              {isRTL 
                ? 'أدخل رمز الشهادة أو امسح رمز QR'
                : 'Enter the certificate code or scan the QR code'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                placeholder={isRTL ? 'رمز الشهادة...' : 'Certificate code...'}
                value={certificateCode}
                onChange={(e) => setCertificateCode(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !certificateCode.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4 me-2" />
                    {isRTL ? 'تحقق' : 'Verify'}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result */}
        {hasSearched && !isLoading && (
          <>
            {certificate ? (
              <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  <CardTitle className="text-emerald-700 text-xl">
                    {isRTL ? 'شهادة صحيحة ✓' : 'Valid Certificate ✓'}
                  </CardTitle>
                  <CardDescription>
                    {isRTL 
                      ? 'تم التحقق من صحة هذه الشهادة'
                      : 'This certificate has been verified as authentic'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Certificate Info */}
                  <div className="bg-white rounded-lg p-4 space-y-4">
                    <div className="text-center">
                      <Badge className="mb-3 bg-primary">
                        {serviceTypeLabels[certificate.service_type][isRTL ? 'ar' : 'en']}
                      </Badge>
                      <h3 className="text-xl font-bold text-primary font-arabic">
                        {certificate.beneficiary_name_ar || certificate.beneficiary_name}
                      </h3>
                      {certificate.beneficiary_name_ar && (
                        <p className="text-muted-foreground">{certificate.beneficiary_name}</p>
                      )}
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">{isRTL ? 'تاريخ الإكمال' : 'Completion Date'}</p>
                          <p className="font-medium">
                            {new Date(certificate.completed_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {certificate.hijri_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">{isRTL ? 'التاريخ الهجري' : 'Hijri Date'}</p>
                            <p className="font-medium font-arabic">{certificate.hijri_date}</p>
                          </div>
                        </div>
                      )}
                      {certificate.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-muted-foreground">{isRTL ? 'الموقع' : 'Location'}</p>
                            <p className="font-medium">{certificate.location}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">{isRTL ? 'رقم الشهادة' : 'Certificate #'}</p>
                          <p className="font-medium font-mono text-xs">{certificate.certificate_number}</p>
                        </div>
                      </div>
                    </div>

                    {certificate.all_steps_verified && (
                      <div className="flex items-center justify-center gap-2 p-3 bg-emerald-100 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <span className="text-emerald-700 font-medium">
                          {isRTL ? 'جميع خطوات المناسك موثقة' : 'All ritual steps verified'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Pilgrim Info */}
                  {certificate.pilgrim && (
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {isRTL ? 'المعتمر المؤدي' : 'Performing Pilgrim'}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span>{certificate.pilgrim.company_name || (isRTL ? 'معتمر موثق' : 'Verified Pilgrim')}</span>
                        {certificate.pilgrim.rating && (
                          <Badge variant="secondary">
                            ⭐ {certificate.pilgrim.rating.toFixed(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-center text-muted-foreground">
                    {isRTL 
                      ? `تم إصدار الشهادة بتاريخ ${new Date(certificate.issued_at).toLocaleDateString()}`
                      : `Certificate issued on ${new Date(certificate.issued_at).toLocaleDateString()}`}
                  </p>
                </CardContent>
              </Card>
            ) : error ? (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>{isRTL ? 'غير صالح' : 'Invalid'}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
          </>
        )}

        {/* Info Section */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            {isRTL 
              ? 'هذا النظام مخصص للتحقق من شهادات إتمام العمرة والحج الصادرة عبر منصة وكّلني'
              : 'This system verifies Umrah and Hajj completion certificates issued through the Wakilni platform'}
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
