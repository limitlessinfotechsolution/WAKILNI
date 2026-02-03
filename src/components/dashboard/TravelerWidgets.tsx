import { Clock, BookOpen, Heart, Compass, Moon, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { useState, useEffect } from 'react';
import { WidgetCard } from '@/components/ui/mobile-card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useHijriDate } from '@/hooks/useHijriDate';
import { useQiblaDirection } from '@/hooks/useQiblaDirection';

// Prayer Time Widget
export function PrayerTimeWidget() {
  const { isRTL } = useLanguage();
  const { prayers, nextPrayer, countdown, location, isLoading } = usePrayerTimes();

  if (isLoading) {
    return (
      <WidgetCard 
        title={isRTL ? 'أوقات الصلاة' : 'Prayer Times'} 
        icon={<Clock />}
        color="primary"
      >
        <div className="space-y-3">
          <div className="text-center">
            <Skeleton className="h-3 w-20 mx-auto mb-2" />
            <Skeleton className="h-6 w-16 mx-auto mb-1" />
            <Skeleton className="h-5 w-12 mx-auto" />
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 rounded" />
            ))}
          </div>
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard 
      title={isRTL ? 'أوقات الصلاة' : 'Prayer Times'} 
      icon={<Clock />}
      color="primary"
    >
      <div className="text-center mb-3">
        <p className="text-[10px] text-muted-foreground">
          {isRTL ? 'الصلاة القادمة' : 'Next Prayer'}
          {location && <span className="opacity-60"> • {location}</span>}
        </p>
        <p className="text-lg md:text-xl font-bold text-primary">
          {isRTL ? nextPrayer?.nameAr : nextPrayer?.name}
        </p>
        <p className="text-base md:text-lg">{nextPrayer?.time}</p>
        {countdown && (
          <p className="text-[10px] text-muted-foreground mt-1">
            {isRTL ? `في ${countdown}` : `in ${countdown}`}
          </p>
        )}
      </div>
      <div className="grid grid-cols-3 gap-1 text-[10px]">
        {prayers.slice(0, 6).map((prayer) => (
          <div
            key={prayer.name}
            className={cn(
              'text-center p-1.5 rounded',
              prayer.passed ? 'opacity-50' : 'bg-card'
            )}
          >
            <p className="font-medium truncate">{isRTL ? prayer.nameAr : prayer.name}</p>
            <p className="text-muted-foreground">{prayer.time}</p>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

// Quran Widget
export function QuranWidget() {
  const { isRTL } = useLanguage();

  return (
    <WidgetCard 
      title={isRTL ? 'القرآن الكريم' : 'Holy Quran'} 
      icon={<BookOpen />}
      color="green"
    >
      <div className="text-center space-y-2">
        <p className="text-base md:text-lg font-arabic leading-relaxed" dir="rtl">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <p className="text-[10px] text-muted-foreground">
          {isRTL ? 'سورة الفاتحة - آية ١' : 'Al-Fatiha - 1'}
        </p>
        <Button variant="outline" size="sm" className="w-full h-7 text-xs">
          {isRTL ? 'متابعة القراءة' : 'Continue Reading'}
        </Button>
      </div>
    </WidgetCard>
  );
}

// Dua Widget
export function DuaWidget() {
  const { isRTL } = useLanguage();

  const dailyDua = {
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا',
    translation: 'O Allah, I ask You for beneficial knowledge.',
  };

  return (
    <WidgetCard 
      title={isRTL ? 'دعاء اليوم' : 'Daily Dua'} 
      icon={<Heart />}
      color="yellow"
    >
      <div className="space-y-2 text-center">
        <p className="text-sm md:text-base font-arabic leading-relaxed" dir="rtl">
          {dailyDua.arabic}
        </p>
        <p className="text-[10px] text-muted-foreground italic">
          {dailyDua.translation}
        </p>
      </div>
    </WidgetCard>
  );
}

// Tasbih Counter Widget
export function TasbihWidget() {
  const { isRTL } = useLanguage();
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);

  const phrases = [
    { arabic: 'سُبْحَانَ اللَّهِ', english: 'SubhanAllah', target: 33 },
    { arabic: 'الْحَمْدُ لِلَّهِ', english: 'Alhamdulillah', target: 33 },
    { arabic: 'اللَّهُ أَكْبَرُ', english: 'Allahu Akbar', target: 34 },
  ];

  const [currentPhrase, setCurrentPhrase] = useState(0);

  const handleTap = () => {
    if (count < target) {
      setCount(count + 1);
    }
    if (count + 1 >= target && currentPhrase < phrases.length - 1) {
      setCurrentPhrase(currentPhrase + 1);
      setCount(0);
      setTarget(phrases[currentPhrase + 1].target);
    }
  };

  const reset = () => {
    setCount(0);
    setCurrentPhrase(0);
    setTarget(33);
  };

  return (
    <WidgetCard 
      title={isRTL ? 'التسبيح' : 'Tasbih'} 
      icon={<Calculator />}
      color="primary"
    >
      <div className="text-center space-y-2">
        <div>
          <p className="text-base md:text-lg font-arabic" dir="rtl">
            {phrases[currentPhrase].arabic}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {phrases[currentPhrase].english}
          </p>
        </div>
        
        <div 
          onClick={handleTap}
          className="mx-auto w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors active:scale-95"
        >
          <span className="text-xl md:text-2xl font-bold text-primary">{count}</span>
        </div>
        
        <div className="flex items-center justify-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            {count} / {target}
          </span>
          <Button variant="ghost" size="sm" onClick={reset} className="h-6 text-[10px] px-2">
            {isRTL ? 'إعادة' : 'Reset'}
          </Button>
        </div>
      </div>
    </WidgetCard>
  );
}

// Qibla Direction Widget
export function QiblaWidget() {
  const { isRTL } = useLanguage();
  const { 
    bearing, 
    relativeDirection, 
    cardinalDirection, 
    distance, 
    isCompassSupported, 
    isCompassActive, 
    isLoading, 
    enableCompass 
  } = useQiblaDirection();

  const handleEnableCompass = async () => {
    await enableCompass();
  };

  if (isLoading) {
    return (
      <WidgetCard 
        title={isRTL ? 'اتجاه القبلة' : 'Qibla'} 
        icon={<Compass />}
        color="secondary"
      >
        <div className="flex flex-col items-center justify-center py-2">
          <Skeleton className="w-14 h-14 rounded-full" />
          <Skeleton className="h-3 w-20 mt-2" />
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard 
      title={isRTL ? 'اتجاه القبلة' : 'Qibla'} 
      icon={<Compass />}
      color="secondary"
    >
      <div className="flex flex-col items-center justify-center py-2">
        <div 
          className="relative w-14 h-14 md:w-16 md:h-16"
          style={{
            transform: isCompassActive ? `rotate(${-relativeDirection}deg)` : 'none',
            transition: 'transform 0.3s ease-out',
          }}
        >
          <Compass className={cn(
            "w-full h-full text-secondary",
            isCompassActive && "animate-none"
          )} />
          {/* Qibla indicator arrow */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-3 bg-secondary rounded-full"
            style={{
              transform: isCompassActive ? 'none' : `rotate(${bearing}deg)`,
              transformOrigin: 'center 28px',
            }}
          />
        </div>
        
        <div className="text-center mt-1">
          <p className="text-sm font-semibold text-secondary">
            {Math.round(bearing)}° {cardinalDirection}
          </p>
          {distance > 0 && (
            <p className="text-[10px] text-muted-foreground">
              {Math.round(distance)} km
            </p>
          )}
        </div>
        
        {isCompassSupported && !isCompassActive && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleEnableCompass}
            className="h-6 text-[10px] px-2 mt-1"
          >
            {isRTL ? 'تفعيل البوصلة' : 'Enable Compass'}
          </Button>
        )}
      </div>
    </WidgetCard>
  );
}

// Hijri Date Widget
export function HijriDateWidget() {
  const { isRTL } = useLanguage();
  const { day, month, monthAr, year, holiday, holidayAr, isLoading } = useHijriDate();

  if (isLoading) {
    return (
      <WidgetCard 
        title={isRTL ? 'التاريخ الهجري' : 'Hijri Date'} 
        icon={<Moon />}
        color="secondary"
      >
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-10 mx-auto" />
          <Skeleton className="h-5 w-16 mx-auto" />
          <Skeleton className="h-4 w-12 mx-auto" />
        </div>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard 
      title={isRTL ? 'التاريخ الهجري' : 'Hijri Date'} 
      icon={<Moon />}
      color="secondary"
    >
      <div className="text-center">
        <p className="text-2xl md:text-3xl font-bold">{day}</p>
        <p className="text-base md:text-lg">{isRTL ? monthAr : month}</p>
        <p className="text-sm text-muted-foreground">{year} هـ</p>
        {(holiday || holidayAr) && (
          <p className="text-xs text-secondary font-medium mt-1">
            ✨ {isRTL ? holidayAr : holiday}
          </p>
        )}
      </div>
    </WidgetCard>
  );
}
