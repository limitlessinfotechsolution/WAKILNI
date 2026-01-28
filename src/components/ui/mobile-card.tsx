import * as React from "react";
import { cn } from "@/lib/utils";

// Mobile-optimized card component with compact styling
const MobileCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm",
        "p-3 md:p-4", // Reduced padding on mobile
        className
      )}
      {...props}
    />
  )
);
MobileCard.displayName = "MobileCard";

// Compact stat card for mobile dashboards
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color?: 'blue' | 'green' | 'orange' | 'pink' | 'purple' | 'primary' | 'secondary';
  className?: string;
}

const colorMap = {
  blue: 'from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800',
  green: 'from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800',
  orange: 'from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800',
  pink: 'from-pink-50 to-pink-100 dark:from-pink-950/50 dark:to-pink-900/50 border-pink-200 dark:border-pink-800',
  purple: 'from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800',
  primary: 'from-primary/10 to-primary/5 border-primary/20',
  secondary: 'from-secondary/10 to-secondary/5 border-secondary/20',
};

const iconColorMap = {
  blue: 'text-blue-500',
  green: 'text-green-500',
  orange: 'text-orange-500',
  pink: 'text-pink-500',
  purple: 'text-purple-500',
  primary: 'text-primary',
  secondary: 'text-secondary',
};

const textColorMap = {
  blue: 'text-blue-900 dark:text-blue-100',
  green: 'text-green-900 dark:text-green-100',
  orange: 'text-orange-900 dark:text-orange-100',
  pink: 'text-pink-900 dark:text-pink-100',
  purple: 'text-purple-900 dark:text-purple-100',
  primary: 'text-foreground',
  secondary: 'text-foreground',
};

const labelColorMap = {
  blue: 'text-blue-600 dark:text-blue-300',
  green: 'text-green-600 dark:text-green-300',
  orange: 'text-orange-600 dark:text-orange-300',
  pink: 'text-pink-600 dark:text-pink-300',
  purple: 'text-purple-600 dark:text-purple-300',
  primary: 'text-muted-foreground',
  secondary: 'text-muted-foreground',
};

export function StatCard({ title, value, icon, trend, color = 'primary', className }: StatCardProps) {
  return (
    <div className={cn(
      "rounded-xl border bg-gradient-to-br p-3 md:p-4",
      colorMap[color],
      className
    )}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className={cn("text-[10px] md:text-xs uppercase tracking-wider font-medium truncate", labelColorMap[color])}>
            {title}
          </p>
          <p className={cn("text-xl md:text-2xl font-bold mt-0.5", textColorMap[color])}>
            {value}
          </p>
          {trend && (
            <p className={cn("text-[10px] mt-0.5", trend.isPositive ? 'text-green-600' : 'text-red-600')}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </p>
          )}
        </div>
        <div className={cn("shrink-0", iconColorMap[color])}>
          {React.cloneElement(icon as React.ReactElement, { className: 'h-6 w-6 md:h-8 md:w-8' })}
        </div>
      </div>
    </div>
  );
}

// Mobile-optimized quick action card
interface ActionCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: number | string;
  gradientFrom?: string;
  gradientTo?: string;
  className?: string;
}

export function ActionCard({ 
  title, 
  description, 
  icon, 
  badge,
  gradientFrom = 'gray-500',
  gradientTo = 'slate-500',
  className 
}: ActionCardProps) {
  return (
    <div className={cn(
      "rounded-xl border-2 hover:border-primary/50 bg-card p-3 md:p-4 transition-all duration-300 cursor-pointer group",
      "hover:shadow-lg active:scale-[0.98]",
      className
    )}>
      <div className="flex items-start gap-2.5 md:gap-3">
        <div className={cn(
          "p-2 md:p-2.5 rounded-lg md:rounded-xl bg-gradient-to-br text-white shadow-md group-hover:scale-105 transition-transform shrink-0",
          `from-${gradientFrom}`,
          `to-${gradientTo}`
        )} style={{
          background: `linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to))`
        }}>
          {React.cloneElement(icon as React.ReactElement, { className: 'h-4 w-4 md:h-5 md:w-5' })}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm md:text-base group-hover:text-primary transition-colors truncate">
              {title}
            </h3>
            {badge !== undefined && Number(badge) > 0 && (
              <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-medium bg-destructive text-destructive-foreground rounded-full animate-pulse">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Mobile widget wrapper with compact header
interface WidgetCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'primary' | 'secondary';
  className?: string;
}

const widgetColorMap = {
  blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
  green: 'from-green-500/10 to-green-500/5 border-green-500/20',
  yellow: 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/20',
  red: 'from-red-500/10 to-red-500/5 border-red-500/20',
  purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
  primary: 'from-primary/10 to-primary/5 border-primary/20',
  secondary: 'from-secondary/10 to-secondary/5 border-secondary/20',
};

const widgetIconColorMap = {
  blue: 'text-blue-500',
  green: 'text-green-500',
  yellow: 'text-yellow-600',
  red: 'text-red-500',
  purple: 'text-purple-500',
  primary: 'text-primary',
  secondary: 'text-secondary',
};

export function WidgetCard({ title, icon, children, color = 'primary', className }: WidgetCardProps) {
  return (
    <div className={cn(
      "rounded-xl border bg-gradient-to-br p-3 md:p-4",
      widgetColorMap[color],
      className
    )}>
      <div className="flex items-center gap-2 mb-2 md:mb-3">
        <span className={widgetIconColorMap[color]}>
          {React.cloneElement(icon as React.ReactElement, { className: 'h-4 w-4 md:h-5 md:w-5' })}
        </span>
        <h3 className="font-semibold text-sm md:text-base">{title}</h3>
      </div>
      <div className="text-sm">
        {children}
      </div>
    </div>
  );
}

export { MobileCard };
