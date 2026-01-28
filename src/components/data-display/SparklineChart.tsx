import * as React from 'react';
import { cn } from '@/lib/utils';

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  showDots?: boolean;
  animate?: boolean;
  className?: string;
}

export function SparklineChart({
  data,
  width = 120,
  height = 40,
  color = 'hsl(var(--primary))',
  fillColor,
  strokeWidth = 2,
  showDots = false,
  animate = true,
  className,
}: SparklineChartProps) {
  const padding = 4;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  if (!data || data.length === 0) {
    return (
      <svg width={width} height={height} className={className}>
        <line
          x1={padding}
          y1={height / 2}
          x2={width - padding}
          y2={height / 2}
          stroke="hsl(var(--muted))"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - min) / range) * chartHeight;
    return { x, y, value };
  });

  const pathD = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const areaPathD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  const pathLength = React.useMemo(() => {
    if (!animate) return 0;
    let length = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
  }, [points, animate]);

  return (
    <svg 
      width={width} 
      height={height} 
      className={cn('overflow-visible', className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* Gradient definition */}
      <defs>
        <linearGradient id={`sparkline-gradient-${width}-${height}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={fillColor || color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={fillColor || color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      {fillColor !== 'none' && (
        <path
          d={areaPathD}
          fill={`url(#sparkline-gradient-${width}-${height})`}
          className={animate ? 'animate-fade-in' : ''}
        />
      )}

      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={animate ? {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
          animation: 'sparkline-draw 1s ease-out forwards',
        } : undefined}
      />

      {/* Dots */}
      {showDots && points.map((point, index) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={3}
          fill="hsl(var(--background))"
          stroke={color}
          strokeWidth={2}
          className={animate ? 'animate-scale-in' : ''}
          style={animate ? { animationDelay: `${index * 50}ms` } : undefined}
        />
      ))}

      {/* End dot highlight */}
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={4}
          fill={color}
          className={animate ? 'animate-pulse-scale' : ''}
        />
      )}

      <style>{`
        @keyframes sparkline-draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </svg>
  );
}
