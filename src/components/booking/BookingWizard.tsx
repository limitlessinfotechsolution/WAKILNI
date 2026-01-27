import { useState } from 'react';
import { Check, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { StepServiceSelection } from './steps/StepServiceSelection';
import { StepProviderSelection } from './steps/StepProviderSelection';
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
  { id: 'service', labelEn: 'Service Type', labelAr: 'نوع الخدمة' },
  { id: 'provider', labelEn: 'Select Provider', labelAr: 'اختر مقدم الخدمة' },
  { id: 'beneficiary', labelEn: 'Beneficiary', labelAr: 'المستفيد' },
  { id: 'review', labelEn: 'Review', labelAr: 'المراجعة' },
  { id: 'payment', labelEn: 'Payment', labelAr: 'الدفع' },
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
        return !!bookingData.beneficiary;
      case 3:
        return true;
      case 4:
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
            onSelect={(type) => updateBookingData({ serviceType: type, service: null })}
          />
        );
      case 1:
        return (
          <StepProviderSelection
            serviceType={bookingData.serviceType!}
            selected={bookingData.service}
            onSelect={(service) => updateBookingData({ service })}
          />
        );
      case 2:
        return (
          <StepBeneficiarySelection
            selected={bookingData.beneficiary}
            onSelect={(beneficiary) => updateBookingData({ beneficiary })}
          />
        );
      case 3:
        return (
          <StepReviewConfirm
            data={bookingData}
            onUpdate={updateBookingData}
          />
        );
      case 4:
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
      {/* Progress Steps */}
      <nav aria-label="Progress" className="overflow-x-auto pb-4">
        <ol className="flex items-center justify-center min-w-max">
          {steps.map((step, index) => (
            <li key={step.id} className={cn('relative', index !== steps.length - 1 && 'pe-8 sm:pe-20')}>
              <div className="flex items-center">
                <div
                  className={cn(
                    'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                    index < currentStep
                      ? 'border-primary bg-primary text-primary-foreground'
                      : index === currentStep
                      ? 'border-primary bg-background text-primary'
                      : 'border-muted bg-muted text-muted-foreground'
                  )}
                >
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index !== steps.length - 1 && (
                  <div
                    className={cn(
                      'absolute top-5 h-0.5 w-8 sm:w-20',
                      isRTL ? 'left-0 -translate-x-full' : 'right-0 translate-x-0',
                      index < currentStep ? 'bg-primary' : 'bg-muted'
                    )}
                    style={{ [isRTL ? 'left' : 'right']: '0', transform: isRTL ? 'translateX(-100%)' : 'none' }}
                  />
                )}
              </div>
              <p className={cn(
                'mt-2 text-xs font-medium text-center max-w-[80px]',
                index <= currentStep ? 'text-primary' : 'text-muted-foreground'
              )}>
                {isRTL ? step.labelAr : step.labelEn}
              </p>
            </li>
          ))}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="min-h-[400px]">
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
