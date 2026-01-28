import { useState } from 'react';
import { Check, ChevronRight, ChevronLeft, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { StepServiceSelection } from './steps/StepServiceSelection';
import { StepProviderSelection } from './steps/StepProviderSelection';
import { StepDateSelection } from './steps/StepDateSelection';
import { StepBeneficiarySelection } from './steps/StepBeneficiarySelection';
import { StepReviewConfirm } from './steps/StepReviewConfirm';
import { StepPayment } from './steps/StepPayment';
import type { Service } from '@/hooks/useServices';
import type { Beneficiary } from '@/hooks/useBeneficiaries';

export interface BookingData {
  serviceType: 'umrah' | 'hajj' | 'ziyarat' | null;
  service: Service | null;
  beneficiary: Beneficiary | null;
  specialRequests: string;
  scheduledDate: Date | null;
}

interface BookingWizardProps {
  onComplete: (data: BookingData) => Promise<void>;
}

const steps = [
  { id: 'service', labelEn: 'Service', labelAr: 'الخدمة', icon: '🕋' },
  { id: 'provider', labelEn: 'Provider', labelAr: 'المقدم', icon: '✓' },
  { id: 'date', labelEn: 'Date', labelAr: 'التاريخ', icon: '📅' },
  { id: 'beneficiary', labelEn: 'Beneficiary', labelAr: 'المستفيد', icon: '👤' },
  { id: 'review', labelEn: 'Review', labelAr: 'المراجعة', icon: '📋' },
  { id: 'payment', labelEn: 'Payment', labelAr: 'الدفع', icon: '💳' },
];

export function BookingWizard({ onComplete }: BookingWizardProps) {
  const { isRTL } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    serviceType: null,
    service: null,
    beneficiary: null,
    specialRequests: '',
    scheduledDate: null,
  });

  const ArrowNext = isRTL ? ChevronLeft : ChevronRight;
  const ArrowPrev = isRTL ? ChevronRight : ChevronLeft;

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!bookingData.serviceType;
      case 1:
        return !!bookingData.service;
      case 2:
        return !!bookingData.scheduledDate;
      case 3:
        return !!bookingData.beneficiary;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(bookingData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepServiceSelection
            selected={bookingData.serviceType}
            onSelect={(type) => updateBookingData({ serviceType: type, service: null, scheduledDate: null })}
          />
        );
      case 1:
        return (
          <StepProviderSelection
            serviceType={bookingData.serviceType!}
            selected={bookingData.service}
            onSelect={(service) => updateBookingData({ service, scheduledDate: null })}
          />
        );
      case 2:
        return (
          <StepDateSelection
            service={bookingData.service!}
            selectedDate={bookingData.scheduledDate}
            onSelectDate={(date) => updateBookingData({ scheduledDate: date })}
          />
        );
      case 3:
        return (
          <StepBeneficiarySelection
            selected={bookingData.beneficiary}
            onSelect={(beneficiary) => updateBookingData({ beneficiary })}
          />
        );
      case 4:
        return (
          <StepReviewConfirm
            data={bookingData}
            onUpdate={updateBookingData}
          />
        );
      case 5:
        return (
          <StepPayment
            data={bookingData}
            onComplete={handleComplete}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Quote */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
          <Sparkles className="h-4 w-4" />
          <span className={cn(isRTL && 'font-arabic')}>
            {isRTL 
              ? 'وَمَن تَطَوَّعَ خَيْرًا فَإِنَّ اللَّهَ شَاكِرٌ عَلِيمٌ'
              : 'Whoever volunteers good, Allah is appreciative and knowing'}
          </span>
        </div>
      </div>

      {/* Progress Steps */}
      <nav aria-label="Progress" className="overflow-x-auto pb-4">
        <ol className="flex items-center justify-center min-w-max gap-2">
          {steps.map((step, index) => (
            <li key={step.id} className="relative flex items-center">
              {/* Step Circle */}
              <button
                onClick={() => index < currentStep && setCurrentStep(index)}
                disabled={index > currentStep}
                className={cn(
                  'relative flex flex-col items-center',
                  index < currentStep && 'cursor-pointer',
                  index > currentStep && 'cursor-not-allowed opacity-50'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300',
                    index < currentStep
                      ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                      : index === currentStep
                      ? 'border-primary bg-background text-primary shadow-md'
                      : 'border-muted bg-muted text-muted-foreground'
                  )}
                >
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm">{step.icon}</span>
                  )}
                </div>
                <span className={cn(
                  'mt-2 text-xs font-medium text-center max-w-[60px] leading-tight',
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {isRTL ? step.labelAr : step.labelEn}
                </span>
              </button>
              
              {/* Connector Line */}
              {index !== steps.length - 1 && (
                <div
                  className={cn(
                    'w-8 sm:w-12 h-0.5 mx-1 transition-colors duration-300',
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="min-h-[450px]">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowPrev className="h-4 w-4" />
          {isRTL ? 'السابق' : 'Previous'}
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="gap-2"
          >
            {isRTL ? 'التالي' : 'Next'}
            <ArrowNext className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isRTL ? 'تأكيد الحجز' : 'Confirm Booking'}
          </Button>
        )}
      </div>
    </div>
  );
}
