import { Clock, BookOpen, Heart, Compass, Moon, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { useState, useEffect } from 'react';
import { WidgetCard } from '@/components/ui/mobile-card';
import { cn } from '@/lib/utils';

// Prayer Time Widget
export function PrayerTimeWidget() {
  const { isRTL } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock prayer times - in production, use an API
  const prayers = [
    { name: isRTL ? 'الفجر' : 'Fajr', time: '05:23', passed: true },
    { name: isRTL ? 'الشروق' : 'Sunrise', time: '06:45', passed: true },
    { name: isRTL ? 'الظهر' : 'Dhuhr', time: '12:15', passed: true },
    { name: isRTL ? 'العصر' : 'Asr', time: '15:30', passed: false },
    { name: isRTL ? 'المغرب' : 'Maghrib', time: '18:12', passed: false },
    { name: isRTL ? 'العشاء' : 'Isha', time: '19:42', passed: false },
  ];

  const nextPrayer = prayers.find(p => !p.passed) || prayers[0];

  return (
    <WidgetCard 
      title={isRTL ? 'أوقات الصلاة' : 'Prayer Times'} 
      icon={<Clock />}
      color="primary"
    >
      <div className="text-center mb-3">
        <p className="text-[10px] text-muted-foreground">
          {isRTL ? 'الصلاة القادمة' : 'Next Prayer'}
        </p>
        <p className="text-lg md:text-xl font-bold text-primary">{nextPrayer.name}</p>
        <p className="text-base md:text-lg">{nextPrayer.time}</p>
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
            <p className="font-medium truncate">{prayer.name}</p>
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

  return (
    <WidgetCard 
      title={isRTL ? 'اتجاه القبلة' : 'Qibla'} 
      icon={<Compass />}
      color="secondary"
    >
      <div className="flex flex-col items-center justify-center py-2">
        <div className="relative w-14 h-14 md:w-16 md:h-16">
          <Compass className="w-full h-full text-secondary animate-pulse" />
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          {isRTL ? 'اضغط لتحديد' : 'Tap to detect'}
        </p>
      </div>
    </WidgetCard>
  );
}

// Hijri Date Widget
export function HijriDateWidget() {
  const { isRTL } = useLanguage();

  // Mock Hijri date - in production, use a proper library
  const hijriDate = {
    day: 15,
    month: isRTL ? 'رجب' : 'Rajab',
    year: 1446,
  };

  return (
    <WidgetCard 
      title={isRTL ? 'التاريخ الهجري' : 'Hijri Date'} 
      icon={<Moon />}
      color="secondary"
    >
      <div className="text-center">
        <p className="text-2xl md:text-3xl font-bold">{hijriDate.day}</p>
        <p className="text-base md:text-lg">{hijriDate.month}</p>
        <p className="text-sm text-muted-foreground">{hijriDate.year} هـ</p>
      </div>
    </WidgetCard>
  );
}
