import * as React from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { LucideIcon } from 'lucide-react';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date | string;
  icon?: LucideIcon;
  status?: 'success' | 'warning' | 'error' | 'info' | 'default';
  action?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  showTimestamp?: boolean;
  animated?: boolean;
  className?: string;
}

const statusColors = {
  success: 'bg-emerald-500 text-white',
  warning: 'bg-amber-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-blue-500 text-white',
  default: 'bg-muted text-muted-foreground',
};

const statusRingColors = {
  success: 'ring-emerald-500/20',
  warning: 'ring-amber-500/20',
  error: 'ring-red-500/20',
  info: 'ring-blue-500/20',
  default: 'ring-muted/50',
};

export function Timeline({ 
  items, 
  showTimestamp = true, 
  animated = true,
  className 
}: TimelineProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
        <p className="text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-border via-border to-transparent" />

      <div className="space-y-4">
        {items.map((item, index) => {
          const Icon = item.icon;
          const status = item.status || 'default';
          const timestamp = typeof item.timestamp === 'string' 
            ? new Date(item.timestamp) 
            : item.timestamp;

          return (
            <div
              key={item.id}
              className={cn(
                'relative flex gap-4 pl-10',
                animated && 'animate-fade-in-up',
              )}
              style={animated ? { animationDelay: `${index * 50}ms` } : undefined}
            >
              {/* Icon node */}
              <div 
                className={cn(
                  'absolute left-0 flex items-center justify-center',
                  'w-8 h-8 rounded-full ring-4 ring-background',
                  statusColors[status],
                  statusRingColors[status]
                )}
              >
                {Icon ? (
                  <Icon className="h-4 w-4" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-current" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm leading-none">{item.title}</p>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {showTimestamp && (
                      <time className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(timestamp, 'MMM d, h:mm a')}
                      </time>
                    )}
                    {item.action}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TimelineStepProps {
  steps: {
    id: string;
    label: string;
    description?: string;
    status: 'completed' | 'current' | 'upcoming';
  }[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function TimelineSteps({ 
  steps, 
  orientation = 'horizontal',
  className 
}: TimelineStepProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div 
      className={cn(
        'flex',
        isHorizontal ? 'flex-row items-start' : 'flex-col',
        className
      )}
    >
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={cn(
            'flex',
            isHorizontal ? 'flex-col items-center flex-1' : 'flex-row items-start gap-4',
            index !== steps.length - 1 && isHorizontal && 'relative'
          )}
        >
          {/* Connector line */}
          {index !== steps.length - 1 && (
            <div
              className={cn(
                'absolute bg-border',
                isHorizontal 
                  ? 'top-4 left-1/2 right-0 h-0.5 -translate-y-1/2' 
                  : 'left-4 top-8 bottom-0 w-0.5',
                step.status === 'completed' && 'bg-primary'
              )}
              style={isHorizontal ? { left: '50%', right: '-50%' } : undefined}
            />
          )}

          {/* Step indicator */}
          <div
            className={cn(
              'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
              step.status === 'completed' && 'bg-primary border-primary text-primary-foreground',
              step.status === 'current' && 'bg-background border-primary text-primary',
              step.status === 'upcoming' && 'bg-background border-muted text-muted-foreground'
            )}
          >
            {step.status === 'completed' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="text-xs font-semibold">{index + 1}</span>
            )}
          </div>

          {/* Label */}
          <div className={cn(
            'text-center',
            isHorizontal ? 'mt-2' : 'flex-1 pb-8',
            !isHorizontal && 'pt-1'
          )}>
            <p className={cn(
              'text-sm font-medium',
              step.status === 'upcoming' && 'text-muted-foreground'
            )}>
              {step.label}
            </p>
            {step.description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {step.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
