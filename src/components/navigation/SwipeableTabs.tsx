import * as React from 'react';
import { cn } from '@/lib/utils';
import { useHaptics } from '@/hooks/useHaptics';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
}

interface SwipeableTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SwipeableTabs({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  className,
}: SwipeableTabsProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { trigger } = useHaptics();
  const [indicatorStyle, setIndicatorStyle] = React.useState({ left: 0, width: 0 });

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-2.5',
  };

  const handleTabClick = (tabId: string) => {
    if (tabId !== activeTab) {
      onTabChange(tabId);
      trigger('selection');
    }
  };

  // Update indicator position
  React.useEffect(() => {
    if (!containerRef.current) return;
    const activeElement = containerRef.current.querySelector(`[data-tab-id="${activeTab}"]`) as HTMLElement;
    if (activeElement) {
      setIndicatorStyle({
        left: activeElement.offsetLeft,
        width: activeElement.offsetWidth,
      });
    }
  }, [activeTab]);

  // Handle swipe navigation
  const [touchStart, setTouchStart] = React.useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    const currentIndex = tabs.findIndex(t => t.id === activeTab);

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < tabs.length - 1) {
        // Swipe left - next tab
        onTabChange(tabs[currentIndex + 1].id);
        trigger('selection');
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe right - previous tab
        onTabChange(tabs[currentIndex - 1].id);
        trigger('selection');
      }
    }
    setTouchStart(null);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex overflow-x-auto scrollbar-hide',
        variant === 'default' && 'bg-muted/50 rounded-xl p-1',
        variant === 'pills' && 'gap-2',
        variant === 'underline' && 'border-b',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Animated indicator */}
      {variant === 'default' && (
        <div
          className="absolute top-1 h-[calc(100%-8px)] bg-background rounded-lg shadow-sm transition-all duration-300 ease-out"
          style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        />
      )}
      {variant === 'underline' && (
        <div
          className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-out"
          style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        />
      )}

      {/* Tabs */}
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            data-tab-id={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              'relative z-10 flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-colors',
              sizeClasses[size],
              variant === 'default' && [
                'rounded-lg',
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              ],
              variant === 'pills' && [
                'rounded-full border',
                isActive 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50',
              ],
              variant === 'underline' && [
                'pb-3',
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              ]
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={cn(
                'ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full',
                isActive 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-muted text-muted-foreground'
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
