import { useState } from 'react';
import { 
  CheckCircle, Circle, Camera, Mic, MapPin, Loader2, 
  Upload, Play, AlertCircle, Clock, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLanguage } from '@/lib/i18n';
import { useRitualEvents, UMRAH_RITUAL_STEPS } from '@/hooks/useRitualEvents';
import { useRitualLocation } from '@/hooks/useRitualLocation';
import { cn } from '@/lib/utils';

interface RitualEventRecorderProps {
  bookingId: string;
  providerId: string;
  beneficiaryId: string;
  beneficiaryName: string;
  onComplete?: () => void;
}

export function RitualEventRecorder({
  bookingId,
  providerId,
  beneficiaryId,
  beneficiaryName,
  onComplete
}: RitualEventRecorderProps) {
  const { isRTL } = useLanguage();
  const { events, recordEvent, getCompletedSteps, getNextStep, isRitualComplete } = useRitualEvents(bookingId);
  const { location, isLoading: geoLoading, error: geoError, requestLocation } = useRitualLocation();
  
  const [isRecording, setIsRecording] = useState(false);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [duaTranscript, setDuaTranscript] = useState('');
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const completedSteps = getCompletedSteps();
  const nextStep = getNextStep();
  const progress = (completedSteps.length / UMRAH_RITUAL_STEPS.length) * 100;

  const handleRecordStep = async (step: typeof UMRAH_RITUAL_STEPS[0]) => {
    setIsRecording(true);
    setSelectedStep(step.step);

    try {
      // Get current location
      let geoLocation = location;
      if (!geoLocation) {
        await requestLocation();
        geoLocation = location;
      }

      await recordEvent({
        booking_id: bookingId,
        provider_id: providerId,
        beneficiary_id: beneficiaryId,
        ritual_step: step.step,
        step_order: step.order,
        geo_location: geoLocation ? {
          lat: geoLocation.latitude,
          lng: geoLocation.longitude,
          accuracy: geoLocation.accuracy || 0,
        } : undefined,
        dua_transcript: duaTranscript || undefined,
        beneficiary_name_mentioned: duaTranscript.toLowerCase().includes(beneficiaryName.toLowerCase()),
      });

      setDuaTranscript('');
      
      if (isRitualComplete() && onComplete) {
        onComplete();
      }
    } finally {
      setIsRecording(false);
      setSelectedStep(null);
    }
  };

  const getStepStatus = (step: string) => {
    if (completedSteps.includes(step)) return 'completed';
    if (nextStep?.step === step) return 'current';
    return 'pending';
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">
                {isRTL ? 'سجل المناسك' : 'Ritual Event Ledger'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isRTL ? `للمستفيد: ${beneficiaryName}` : `For: ${beneficiaryName}`}
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{completedSteps.length}/{UMRAH_RITUAL_STEPS.length}</div>
              <div className="text-xs text-muted-foreground">{isRTL ? 'خطوات مكتملة' : 'Steps Complete'}</div>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
          
          {isRitualComplete() && (
            <Alert className="mt-4 bg-emerald-50 border-emerald-200">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-700">
                {isRTL 
                  ? 'تم إكمال جميع مناسك العمرة بنجاح! يمكنك الآن إصدار شهادة الإكمال.'
                  : 'All Umrah rituals completed successfully! You can now issue the completion certificate.'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Location Status */}
      {geoError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {isRTL 
              ? 'يرجى تفعيل خدمة الموقع للتحقق من موقعك في الحرم'
              : 'Please enable location services to verify your presence at the Haram'}
          </AlertDescription>
        </Alert>
      )}

      {/* Ritual Steps */}
      <div className="space-y-3">
        {UMRAH_RITUAL_STEPS.map((step) => {
          const status = getStepStatus(step.step);
          const isExpanded = expandedStep === step.step;
          const completedEvent = events.find(e => e.ritual_step === step.step);

          return (
            <Card 
              key={step.step}
              className={cn(
                'transition-all',
                status === 'completed' && 'border-emerald-200 bg-emerald-50/50',
                status === 'current' && 'border-primary ring-2 ring-primary/20',
                status === 'pending' && 'opacity-60'
              )}
            >
              <Collapsible open={isExpanded} onOpenChange={() => setExpandedStep(isExpanded ? null : step.step)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center',
                        status === 'completed' && 'bg-emerald-100',
                        status === 'current' && 'bg-primary/10',
                        status === 'pending' && 'bg-muted'
                      )}>
                        {status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <span className={cn(
                            'font-bold',
                            status === 'current' ? 'text-primary' : 'text-muted-foreground'
                          )}>
                            {step.order}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {isRTL ? step.labelAr : step.labelEn}
                        </CardTitle>
                        {completedEvent && (
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3" />
                            {new Date(completedEvent.timestamp).toLocaleString()}
                            {completedEvent.geo_location && (
                              <Badge variant="secondary" className="text-xs">
                                <MapPin className="h-3 w-3 me-1" />
                                {isRTL ? 'موثق' : 'Verified'}
                              </Badge>
                            )}
                          </CardDescription>
                        )}
                      </div>
                      {status === 'current' && (
                        <Badge className="bg-primary text-primary-foreground">
                          {isRTL ? 'التالي' : 'Next'}
                        </Badge>
                      )}
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4">
                    {status === 'completed' && completedEvent ? (
                      <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                          {completedEvent.geo_location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {completedEvent.geo_location.lat.toFixed(4)}, {completedEvent.geo_location.lng.toFixed(4)}
                              </span>
                            </div>
                          )}
                          {completedEvent.beneficiary_name_mentioned && (
                            <Badge variant="outline" className="w-fit">
                              {isRTL ? 'ذكر اسم المستفيد' : 'Name Mentioned'}
                            </Badge>
                          )}
                        </div>
                        {completedEvent.dua_transcript && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-arabic">{completedEvent.dua_transcript}</p>
                          </div>
                        )}
                      </div>
                    ) : status === 'current' ? (
                      <div className="space-y-4">
                        <Textarea
                          placeholder={isRTL 
                            ? `أدخل الدعاء الذي قرأته لـ ${beneficiaryName}...`
                            : `Enter the dua you recited for ${beneficiaryName}...`}
                          value={duaTranscript}
                          onChange={(e) => setDuaTranscript(e.target.value)}
                          className="min-h-[100px] font-arabic"
                          dir="rtl"
                        />
                        
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            onClick={() => handleRecordStep(step)}
                            disabled={isRecording}
                            className="flex-1"
                          >
                            {isRecording && selectedStep === step.step ? (
                              <>
                                <Loader2 className="h-4 w-4 me-2 animate-spin" />
                                {isRTL ? 'جاري التسجيل...' : 'Recording...'}
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 me-2" />
                                {isRTL ? 'تسجيل هذه الخطوة' : 'Record This Step'}
                              </>
                            )}
                          </Button>
                        </div>

                        {!location && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={requestLocation}
                            disabled={geoLoading}
                          >
                            <MapPin className="h-4 w-4 me-2" />
                            {geoLoading 
                              ? (isRTL ? 'جاري تحديد الموقع...' : 'Getting location...') 
                              : (isRTL ? 'تفعيل الموقع' : 'Enable Location')}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {isRTL 
                          ? 'أكمل الخطوات السابقة أولاً'
                          : 'Complete previous steps first'}
                      </p>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
