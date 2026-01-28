import * as React from 'react';
import Confetti from 'react-confetti';
import { cn } from '@/lib/utils';
import { CheckCircle, PartyPopper, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHaptics } from '@/hooks/useHaptics';

interface SuccessCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  icon?: 'check' | 'party' | 'star';
  showConfetti?: boolean;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  isRTL?: boolean;
}

export function SuccessCelebration({
  isOpen,
  onClose,
  title,
  titleAr,
  description,
  descriptionAr,
  icon = 'check',
  showConfetti = true,
  primaryAction,
  secondaryAction,
  isRTL = false,
}: SuccessCelebrationProps) {
  const [windowSize, setWindowSize] = React.useState({ width: 0, height: 0 });
  const [showConfettiState, setShowConfettiState] = React.useState(false);
  const { success } = useHaptics();

  React.useEffect(() => {
    if (isOpen) {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      setShowConfettiState(showConfetti);
      success();
      
      // Stop confetti after 3 seconds
      const timer = setTimeout(() => setShowConfettiState(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, showConfetti, success]);

  if (!isOpen) return null;

  const IconComponent = {
    check: CheckCircle,
    party: PartyPopper,
    star: Star,
  }[icon];

  const displayTitle = isRTL && titleAr ? titleAr : title;
  const displayDescription = isRTL && descriptionAr ? descriptionAr : description;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Confetti */}
      {showConfettiState && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899']}
        />
      )}

      {/* Content */}
      <div className={cn(
        'relative z-10 mx-4 max-w-sm w-full',
        'bg-card rounded-3xl shadow-2xl p-8',
        'text-center animate-scale-in',
        isRTL && 'font-arabic'
      )}>
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className={cn(
            'w-20 h-20 rounded-full flex items-center justify-center',
            'bg-gradient-to-br from-emerald-500 to-emerald-600',
            'text-white shadow-lg animate-bounce-in'
          )}>
            <IconComponent className="w-10 h-10" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-2 gradient-text-sacred">
          {displayTitle}
        </h2>

        {/* Description */}
        {displayDescription && (
          <p className="text-muted-foreground mb-6">
            {displayDescription}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {primaryAction && (
            <Button 
              onClick={primaryAction.onClick}
              className="w-full rounded-xl btn-premium"
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button 
              variant="ghost"
              onClick={secondaryAction.onClick}
              className="w-full rounded-xl"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}
