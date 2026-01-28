import * as React from 'react';
import { cn } from '@/lib/utils';
import { Plus, X } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';

interface FloatingActionButtonProps {
  icon?: React.ReactNode;
  onClick?: () => void;
  actions?: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }[];
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  className?: string;
}

export function FloatingActionButton({
  icon = <Plus className="h-6 w-6" />,
  onClick,
  actions,
  position = 'bottom-right',
  className,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { trigger } = useHaptics();

  const positionClasses = {
    'bottom-right': 'bottom-24 right-4',
    'bottom-left': 'bottom-24 left-4',
    'bottom-center': 'bottom-24 left-1/2 -translate-x-1/2',
  };

  const handleMainClick = () => {
    if (actions && actions.length > 0) {
      setIsOpen(!isOpen);
      trigger('light');
    } else if (onClick) {
      onClick();
      trigger('medium');
    }
  };

  const handleActionClick = (action: (typeof actions)[0]) => {
    action.onClick();
    setIsOpen(false);
    trigger('selection');
  };

  return (
    <div className={cn('fixed z-40', positionClasses[position], className)}>
      {/* Action buttons */}
      {actions && isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col-reverse items-end gap-2 mb-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full',
                'bg-card shadow-lg border border-border',
                'text-sm font-medium',
                'transition-all duration-200',
                'hover:shadow-xl hover:-translate-y-0.5',
                'active:scale-95',
                'animate-scale-in'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="text-muted-foreground">{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={handleMainClick}
        className={cn(
          'flex items-center justify-center',
          'w-14 h-14 rounded-full',
          'bg-gradient-to-br from-primary to-primary/90',
          'text-primary-foreground shadow-lg',
          'transition-all duration-300',
          'hover:shadow-xl hover:scale-105',
          'active:scale-95',
          isOpen && 'rotate-45'
        )}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <X className="h-6 w-6" /> : icon}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
