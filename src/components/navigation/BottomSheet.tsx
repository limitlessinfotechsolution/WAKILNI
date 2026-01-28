import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showHandle?: boolean;
  showCloseButton?: boolean;
  height?: 'auto' | 'half' | 'full';
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  showHandle = true,
  showCloseButton = true,
  height = 'auto',
  className,
}: BottomSheetProps) {
  const { trigger } = useHaptics();
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const [startY, setStartY] = React.useState(0);
  const [currentY, setCurrentY] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);

  const heightClasses = {
    auto: 'max-h-[85vh]',
    half: 'h-[50vh]',
    full: 'h-[90vh]',
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientY - startY;
    if (delta > 0) {
      setCurrentY(delta);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (currentY > 100) {
      trigger('light');
      onClose();
    }
    setCurrentY(0);
  };

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      trigger('light');
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, trigger]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
          'animate-fade-in'
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'fixed inset-x-0 bottom-0 z-50',
          'bg-card rounded-t-3xl shadow-2xl',
          heightClasses[height],
          'overflow-hidden',
          'safe-area-bottom',
          'animate-slide-up',
          className
        )}
        style={{
          transform: isDragging ? `translateY(${currentY}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle */}
        {showHandle && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
        )}

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 py-2 border-b">
            {title && (
              <h3 className="font-semibold text-lg">{title}</h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  'p-2 rounded-full hover:bg-muted transition-colors',
                  !title && 'ml-auto'
                )}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn(
          'overflow-y-auto',
          height === 'auto' && 'max-h-[calc(85vh-80px)]',
          height === 'half' && 'h-[calc(50vh-80px)]',
          height === 'full' && 'h-[calc(90vh-80px)]',
        )}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </>
  );
}
