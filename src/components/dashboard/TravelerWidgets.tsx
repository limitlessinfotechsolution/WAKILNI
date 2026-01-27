import { Clock, BookOpen, Heart, Compass, Moon, Sun, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { useState, useEffect } from 'react';

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
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'font-arabic' : ''}`}>
          <Clock className="h-5 w-5 text-primary" />
          {isRTL ? 'أوقات الصلاة' : 'Prayer Times'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">
            {isRTL ? 'الصلاة القادمة' : 'Next Prayer'}
          </p>
          <p className="text-2xl font-bold text-primary">{nextPrayer.name}</p>
          <p className="text-xl">{nextPrayer.time}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {prayers.slice(0, 6).map((prayer) => (
            <div
              key={prayer.name}
              className={`text-center p-2 rounded ${
                prayer.passed ? 'opacity-50' : 'bg-card'
              }`}
            >
              <p className="font-medium">{prayer.name}</p>
              <p className="text-muted-foreground">{prayer.time}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Quran Widget
export function QuranWidget() {
  const { isRTL } = useLanguage();

  return (
    <Card className="bg-gradient-to-br from-emerald-dark/10 to-emerald-dark/5 border-emerald-dark/20">
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'font-arabic' : ''}`}>
          <BookOpen className="h-5 w-5 text-emerald-light" />
          {isRTL ? 'القرآن الكريم' : 'Holy Quran'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-3">
          <p className="text-xl font-arabic leading-relaxed" dir="rtl">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <p className="text-sm text-muted-foreground">
            {isRTL ? 'سورة الفاتحة - آية ١' : 'Surah Al-Fatiha - Verse 1'}
          </p>
          <Button variant="outline" size="sm" className="w-full">
            {isRTL ? 'متابعة القراءة' : 'Continue Reading'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Dua Widget
export function DuaWidget() {
  const { isRTL } = useLanguage();

  const dailyDua = {
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
    translation: 'O Allah, I ask You for beneficial knowledge, good provision and accepted deeds.',
  };

  return (
    <Card className="bg-gradient-to-br from-gold/10 to-gold/5 border-gold/20">
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'font-arabic' : ''}`}>
          <Heart className="h-5 w-5 text-gold" />
          {isRTL ? 'دعاء اليوم' : 'Daily Dua'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-center">
          <p className="text-lg font-arabic leading-relaxed" dir="rtl">
            {dailyDua.arabic}
          </p>
          <p className="text-sm text-muted-foreground italic">
            {dailyDua.translation}
          </p>
        </div>
      </CardContent>
    </Card>
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
    <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'font-arabic' : ''}`}>
          <Calculator className="h-5 w-5 text-primary" />
          {isRTL ? 'التسبيح' : 'Tasbih Counter'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center space-y-4">
          <div>
            <p className="text-2xl font-arabic" dir="rtl">
              {phrases[currentPhrase].arabic}
            </p>
            <p className="text-sm text-muted-foreground">
              {phrases[currentPhrase].english}
            </p>
          </div>
          
          <div 
            onClick={handleTap}
            className="mx-auto w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors"
          >
            <span className="text-3xl font-bold text-primary">{count}</span>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">
              {count} / {target}
            </span>
            <Button variant="ghost" size="sm" onClick={reset}>
              {isRTL ? 'إعادة' : 'Reset'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Qibla Direction Widget
export function QiblaWidget() {
  const { isRTL } = useLanguage();

  return (
    <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'font-arabic' : ''}`}>
          <Compass className="h-5 w-5 text-accent" />
          {isRTL ? 'اتجاه القبلة' : 'Qibla Direction'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative w-20 h-20">
            <Compass className="w-full h-full text-accent animate-pulse" />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {isRTL ? 'اضغط لتحديد الموقع' : 'Tap to detect location'}
          </p>
        </div>
      </CardContent>
    </Card>
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
    <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
      <CardHeader className="pb-2">
        <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'font-arabic' : ''}`}>
          <Moon className="h-5 w-5 text-secondary" />
          {isRTL ? 'التاريخ الهجري' : 'Hijri Date'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <p className="text-3xl font-bold">{hijriDate.day}</p>
          <p className="text-xl">{hijriDate.month}</p>
          <p className="text-lg text-muted-foreground">{hijriDate.year} هـ</p>
        </div>
      </CardContent>
    </Card>
  );
}
