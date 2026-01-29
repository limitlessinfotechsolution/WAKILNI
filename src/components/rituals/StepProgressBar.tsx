import { CheckCircle, Circle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface RitualStep {
  step: string;
  order: number;
  labelEn: string;
  labelAr: string;
}

interface StepProgressBarProps {
  steps: RitualStep[];
  completedSteps: string[];
  currentStep?: RitualStep | null;
  onStepClick?: (step: RitualStep) => void;
}

export function StepProgressBar({
  steps,
  completedSteps,
  currentStep,
  onStepClick,
}: StepProgressBarProps) {
  const { isRTL } = useLanguage();
  
  const progress = (completedSteps.length / steps.length) * 100;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">
            {isRTL ? 'تقدم المناسك' : 'Ritual Progress'}
          </h4>
          <p className="text-xs text-muted-foreground">
            {currentStep 
              ? (isRTL ? currentStep.labelAr : currentStep.labelEn)
              : (isRTL ? 'جميع الخطوات مكتملة' : 'All steps complete')
            }
          </p>
        </div>
        <div className="text-end">
          <span className="text-2xl font-bold text-primary">{completedSteps.length}</span>
          <span className="text-sm text-muted-foreground">/{steps.length}</span>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="relative">
        <Progress value={progress} className="h-3" />
        <div 
          className="absolute top-0 h-3 bg-primary/20 rounded-full transition-all"
          style={{ width: `${((completedSteps.length + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Step Dots (Mobile: Scrollable, Desktop: Full width) */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 scrollbar-hide">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.step);
          const isCurrent = currentStep?.step === step.step;
          const isClickable = onStepClick && (isCompleted || isCurrent);

          return (
            <button
              key={step.step}
              disabled={!isClickable}
              onClick={() => isClickable && onStepClick?.(step)}
              className={cn(
                'flex flex-col items-center gap-1 min-w-[40px] transition-all',
                isClickable && 'cursor-pointer hover:scale-110',
                !isClickable && 'cursor-default'
              )}
              title={isRTL ? step.labelAr : step.labelEn}
            >
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center transition-all',
                isCompleted && 'bg-emerald-500 text-white',
                isCurrent && !isCompleted && 'bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse',
                !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
              )}>
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-medium">{step.order}</span>
                )}
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={cn(
                  'hidden sm:block absolute h-0.5 w-full top-1/2 -translate-y-1/2 -z-10',
                  completedSteps.includes(steps[index + 1]?.step) ? 'bg-emerald-500' : 'bg-muted'
                )} />
              )}
            </button>
          );
        })}
      </div>

      {/* Percentage */}
      <div className="text-center">
        <span className={cn(
          'text-sm font-medium',
          progress === 100 ? 'text-emerald-600' : 'text-muted-foreground'
        )}>
          {progress.toFixed(0)}% {isRTL ? 'مكتمل' : 'Complete'}
        </span>
      </div>
    </div>
  );
}
