import * as React from 'react';
import { cn } from '@/lib/utils';

interface RingChartProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  showValue?: boolean;
  valueFormatter?: (value: number) => string;
  label?: string;
  animate?: boolean;
  className?: string;
}

export function RingChart({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  color = 'hsl(var(--primary))',
  trackColor = 'hsl(var(--muted))',
  showValue = true,
  valueFormatter = (v) => `${Math.round(v)}%`,
  label,
  animate = true,
  className,
}: RingChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value / max, 0), 1);
  const offset = circumference - progress * circumference;

  const [animatedOffset, setAnimatedOffset] = React.useState(animate ? circumference : offset);

  React.useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setAnimatedOffset(offset), 100);
      return () => clearTimeout(timer);
    }
    setAnimatedOffset(offset);
  }, [offset, animate]);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          className="opacity-30"
        />
        
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          style={{
            transition: animate ? 'stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {showValue && (
          <span className="text-lg font-bold leading-none">
            {valueFormatter(value)}
          </span>
        )}
        {label && (
          <span className="text-[10px] text-muted-foreground mt-0.5 max-w-[70%] truncate">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

interface MultiRingChartProps {
  rings: {
    value: number;
    max?: number;
    color: string;
    label?: string;
  }[];
  size?: number;
  strokeWidth?: number;
  gap?: number;
  animate?: boolean;
  className?: string;
}

export function MultiRingChart({
  rings,
  size = 120,
  strokeWidth = 8,
  gap = 4,
  animate = true,
  className,
}: MultiRingChartProps) {
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {rings.map((ring, index) => {
          const outerRadius = (size - strokeWidth) / 2 - (strokeWidth + gap) * index;
          const circumference = 2 * Math.PI * outerRadius;
          const progress = Math.min(Math.max((ring.value) / (ring.max || 100), 0), 1);
          const offset = circumference - progress * circumference;

          return (
            <React.Fragment key={index}>
              {/* Track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={outerRadius}
                fill="none"
                stroke={ring.color}
                strokeWidth={strokeWidth}
                className="opacity-20"
              />
              
              {/* Progress */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={outerRadius}
                fill="none"
                stroke={ring.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={animate ? circumference : offset}
                style={{
                  transition: animate ? `stroke-dashoffset 1s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.1}s` : 'none',
                  strokeDashoffset: offset,
                }}
              />
            </React.Fragment>
          );
        })}
      </svg>
    </div>
  );
}
