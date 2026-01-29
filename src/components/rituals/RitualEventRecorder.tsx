import { useState } from 'react';
import { 
  CheckCircle, Camera, MapPin, Loader2, 
  Maximize2, Minimize2, WifiOff, CloudOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/lib/i18n';
import { useRitualEvents, UMRAH_RITUAL_STEPS } from '@/hooks/useRitualEvents';
import { useRitualLocation } from '@/hooks/useRitualLocation';
import { useHaptics } from '@/hooks/useHaptics';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { GPSIndicator } from './GPSIndicator';
import { StepProgressBar } from './StepProgressBar';
import { AudioWaveform } from './AudioWaveform';
import { SuccessCelebration } from '@/components/feedback/SuccessCelebration';
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/cards/GlassCard';
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
  const haptics = useHaptics();
  const { isOnline, pendingCount } = useOfflineSync();
  const { events, recordEvent, getCompletedSteps, getNextStep, isRitualComplete } = useRitualEvents(bookingId);
  const { location, isLoading: geoLoading, error: geoError, requestLocation, isNearHaram } = useRitualLocation();
  
  const [isRecording, setIsRecording] = useState(false);
  const [duaTranscript, setDuaTranscript] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);

  const completedSteps = getCompletedSteps();
  const currentStep = getNextStep();

  const handleRecordStep = async () => {
    if (!currentStep) return;
    
    setIsRecording(true);
    haptics.medium();

    try {
      let geoLocation = location;
      if (!geoLocation) {
        geoLocation = await requestLocation();
      }

      await recordEvent({
        booking_id: bookingId,
        provider_id: providerId,
        beneficiary_id: beneficiaryId,
        ritual_step: currentStep.step,
        step_order: currentStep.order,
        geo_location: geoLocation ? {
          lat: geoLocation.latitude,
          lng: geoLocation.longitude,
          accuracy: geoLocation.accuracy || 0,
        } : undefined,
        dua_transcript: duaTranscript || undefined,
        beneficiary_name_mentioned: duaTranscript.toLowerCase().includes(beneficiaryName.toLowerCase()),
      });

      haptics.success();
      setDuaTranscript('');
      
      // Check if ritual is now complete
      if (completedSteps.length + 1 >= UMRAH_RITUAL_STEPS.length) {
        setShowCelebration(true);
        setTimeout(() => {
          setShowCelebration(false);
          onComplete?.();
        }, 4000);
      }
    } finally {
      setIsRecording(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    haptics.light();
  };

  return (
    <>
      <SuccessCelebration
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        title={isRTL ? 'تمت العمرة بنجاح!' : 'Umrah Complete!'}
        description={isRTL 
          ? `تم إكمال جميع مناسك العمرة لـ ${beneficiaryName}` 
          : `All Umrah rituals completed for ${beneficiaryName}`
        }
        icon="party"
        primaryAction={{
          label: isRTL ? 'متابعة' : 'Continue',
          onClick: () => {
            setShowCelebration(false);
            onComplete?.();
          }
        }}
      />

      <div className={cn(
        'transition-all duration-300',
        isFullscreen && 'fixed inset-0 z-50 bg-background p-4 overflow-auto'
      )}>
        <div className="space-y-4">
          {/* Header with Fullscreen Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className={cn('font-semibold text-lg', isRTL && 'font-arabic')}>
                {isRTL ? 'سجل المناسك' : 'Ritual Event Ledger'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isRTL ? `للمستفيد: ${beneficiaryName}` : `For: ${beneficiaryName}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Offline Indicator */}
              {!isOnline && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  <CloudOff className="h-3 w-3 me-1" />
                  {pendingCount > 0 && `${pendingCount} `}
                  {isRTL ? 'غير متصل' : 'Offline'}
                </Badge>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* GPS Indicator */}
          <GPSIndicator
            accuracy={location?.accuracy || null}
            isLoading={geoLoading}
            hasLocation={!!location}
            isNearHaram={isNearHaram()}
            error={geoError}
            onRequestLocation={requestLocation}
          />

          {/* Step Progress */}
          <GlassCard variant="gradient" hoverable={false}>
            <GlassCardContent className="py-4">
              <StepProgressBar
                steps={UMRAH_RITUAL_STEPS}
                completedSteps={completedSteps}
                currentStep={currentStep}
              />
            </GlassCardContent>
          </GlassCard>

          {/* Completion Alert */}
          {isRitualComplete() && (
            <Alert className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-700 dark:text-emerald-300">
                {isRTL 
                  ? 'تم إكمال جميع مناسك العمرة بنجاح! يمكنك الآن إصدار شهادة الإكمال.'
                  : 'All Umrah rituals completed successfully! You can now issue the completion certificate.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Current Step Recording */}
          {currentStep && (
            <GlassCard variant="heavy" glow>
              <GlassCardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="bg-primary text-primary-foreground mb-2">
                      {isRTL ? `الخطوة ${currentStep.order}` : `Step ${currentStep.order}`}
                    </Badge>
                    <h4 className={cn('font-semibold text-lg', isRTL && 'font-arabic')}>
                      {isRTL ? currentStep.labelAr : currentStep.labelEn}
                    </h4>
                  </div>
                  {location && (
                    <Badge variant="outline" className="text-emerald-600">
                      <MapPin className="h-3 w-3 me-1" />
                      {isRTL ? 'موقع محدد' : 'Located'}
                    </Badge>
                  )}
                </div>
              </GlassCardHeader>
              <GlassCardContent className="space-y-4">
                {/* Photo/Video Capture Area Placeholder */}
                <div className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 flex flex-col items-center justify-center gap-3">
                  <div className="p-4 rounded-full bg-muted">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    {isRTL ? 'اضغط لالتقاط صورة أو فيديو' : 'Tap to capture photo or video'}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      <Camera className="h-4 w-4 me-1" />
                      {isRTL ? 'صورة' : 'Photo'}
                    </Button>
                  </div>
                </div>

                {/* Audio Recording */}
                <AudioWaveform
                  isRecording={isAudioRecording}
                  duration={audioDuration}
                  onStartRecording={() => {
                    setIsAudioRecording(true);
                    haptics.medium();
                  }}
                  onStopRecording={() => {
                    setIsAudioRecording(false);
                    haptics.success();
                  }}
                />

                {/* Dua Transcript */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {isRTL ? 'نص الدعاء' : 'Dua Transcript'}
                  </label>
                  <Textarea
                    placeholder={isRTL 
                      ? `أدخل الدعاء الذي قرأته لـ ${beneficiaryName}...`
                      : `Enter the dua you recited for ${beneficiaryName}...`}
                    value={duaTranscript}
                    onChange={(e) => setDuaTranscript(e.target.value)}
                    className="min-h-[100px] font-arabic"
                    dir="rtl"
                  />
                  {duaTranscript.toLowerCase().includes(beneficiaryName.toLowerCase()) && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      <CheckCircle className="h-3 w-3 me-1" />
                      {isRTL ? 'ذكر اسم المستفيد' : 'Beneficiary Name Mentioned'}
                    </Badge>
                  )}
                </div>

                {/* Record Button */}
                <Button 
                  size="lg"
                  onClick={handleRecordStep}
                  disabled={isRecording || geoLoading}
                  className="w-full h-14 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all active:scale-[0.98]"
                >
                  {isRecording ? (
                    <>
                      <Loader2 className="h-5 w-5 me-2 animate-spin" />
                      {isRTL ? 'جاري التسجيل...' : 'Recording...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 me-2" />
                      {isRTL ? 'تسجيل هذه الخطوة' : 'Record This Step'}
                    </>
                  )}
                </Button>
              </GlassCardContent>
            </GlassCard>
          )}

          {/* Completed Steps Summary */}
          {completedSteps.length > 0 && (
            <GlassCard>
              <GlassCardHeader>
                <h4 className="font-medium text-sm text-muted-foreground">
                  {isRTL ? 'الخطوات المكتملة' : 'Completed Steps'}
                </h4>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="grid grid-cols-3 gap-2">
                  {UMRAH_RITUAL_STEPS
                    .filter(s => completedSteps.includes(s.step))
                    .map(step => (
                      <div 
                        key={step.step}
                        className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30"
                      >
                        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="text-xs text-emerald-700 dark:text-emerald-300 truncate">
                          {isRTL ? step.labelAr : step.labelEn}
                        </span>
                      </div>
                    ))
                  }
                </div>
              </GlassCardContent>
            </GlassCard>
          )}
        </div>
      </div>
    </>
  );
}
