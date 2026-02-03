/**
 * Hijri Date Hook
 * Converts Gregorian to Hijri dates with Islamic holiday detection
 */

import { useState, useEffect, useCallback } from 'react';

interface HijriDateData {
  day: number;
  month: string;
  monthAr: string;
  monthNumber: number;
  year: number;
  weekday: string;
  weekdayAr: string;
  holiday: string | null;
  holidayAr: string | null;
  fullDate: string;
  fullDateAr: string;
}

interface CachedHijriDate {
  data: HijriDateData;
  timestamp: number;
  gregorianDate: string;
}

const CACHE_KEY = 'wakilni_hijri_date';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

const HIJRI_MONTHS = [
  { en: 'Muharram', ar: 'محرّم' },
  { en: 'Safar', ar: 'صفر' },
  { en: 'Rabi al-Awwal', ar: 'ربيع الأول' },
  { en: 'Rabi al-Thani', ar: 'ربيع الآخر' },
  { en: 'Jumada al-Ula', ar: 'جمادى الأولى' },
  { en: 'Jumada al-Thani', ar: 'جمادى الآخرة' },
  { en: 'Rajab', ar: 'رجب' },
  { en: 'Shaban', ar: 'شعبان' },
  { en: 'Ramadan', ar: 'رمضان' },
  { en: 'Shawwal', ar: 'شوّال' },
  { en: 'Dhul Qadah', ar: 'ذو القعدة' },
  { en: 'Dhul Hijjah', ar: 'ذو الحجة' },
];

const WEEKDAYS = [
  { en: 'Sunday', ar: 'الأحد' },
  { en: 'Monday', ar: 'الإثنين' },
  { en: 'Tuesday', ar: 'الثلاثاء' },
  { en: 'Wednesday', ar: 'الأربعاء' },
  { en: 'Thursday', ar: 'الخميس' },
  { en: 'Friday', ar: 'الجمعة' },
  { en: 'Saturday', ar: 'السبت' },
];

// Islamic holidays by month and day
const ISLAMIC_HOLIDAYS: Record<string, { en: string; ar: string }> = {
  '1-1': { en: 'Islamic New Year', ar: 'رأس السنة الهجرية' },
  '1-10': { en: 'Day of Ashura', ar: 'يوم عاشوراء' },
  '3-12': { en: 'Mawlid al-Nabi', ar: 'المولد النبوي' },
  '7-27': { en: 'Isra and Miraj', ar: 'الإسراء والمعراج' },
  '9-1': { en: 'First of Ramadan', ar: 'أول رمضان' },
  '9-27': { en: 'Laylat al-Qadr (approx)', ar: 'ليلة القدر (تقريباً)' },
  '10-1': { en: 'Eid al-Fitr', ar: 'عيد الفطر' },
  '10-2': { en: 'Eid al-Fitr', ar: 'عيد الفطر' },
  '10-3': { en: 'Eid al-Fitr', ar: 'عيد الفطر' },
  '12-8': { en: 'Day of Tarwiyah', ar: 'يوم التروية' },
  '12-9': { en: 'Day of Arafah', ar: 'يوم عرفة' },
  '12-10': { en: 'Eid al-Adha', ar: 'عيد الأضحى' },
  '12-11': { en: 'Eid al-Adha', ar: 'عيد الأضحى' },
  '12-12': { en: 'Eid al-Adha', ar: 'عيد الأضحى' },
  '12-13': { en: 'Eid al-Adha', ar: 'عيد الأضحى' },
};

export function useHijriDate() {
  const [hijriDate, setHijriDate] = useState<HijriDateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getHoliday = (month: number, day: number): { en: string | null; ar: string | null } => {
    const key = `${month}-${day}`;
    const holiday = ISLAMIC_HOLIDAYS[key];
    return holiday ? { en: holiday.en, ar: holiday.ar } : { en: null, ar: null };
  };

  const processHijriData = useCallback((apiData: any): HijriDateData => {
    const hijri = apiData.hijri;
    const gregorian = apiData.gregorian;
    
    const monthIndex = parseInt(hijri.month.number) - 1;
    const monthData = HIJRI_MONTHS[monthIndex] || HIJRI_MONTHS[0];
    
    const weekdayIndex = new Date().getDay();
    const weekdayData = WEEKDAYS[weekdayIndex];
    
    const holiday = getHoliday(parseInt(hijri.month.number), parseInt(hijri.day));

    return {
      day: parseInt(hijri.day),
      month: monthData.en,
      monthAr: monthData.ar,
      monthNumber: parseInt(hijri.month.number),
      year: parseInt(hijri.year),
      weekday: weekdayData.en,
      weekdayAr: weekdayData.ar,
      holiday: holiday.en,
      holidayAr: holiday.ar,
      fullDate: `${hijri.day} ${monthData.en} ${hijri.year} AH`,
      fullDateAr: `${hijri.day} ${monthData.ar} ${hijri.year} هـ`,
    };
  }, []);

  const fetchHijriDate = useCallback(async () => {
    try {
      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
      
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const cachedData: CachedHijriDate = JSON.parse(cached);
        const isExpired = Date.now() - cachedData.timestamp > CACHE_DURATION;
        const isSameDate = cachedData.gregorianDate === dateStr;
        
        if (!isExpired && isSameDate) {
          setHijriDate(cachedData.data);
          setIsLoading(false);
          return;
        }
      }

      // Fetch from API
      const response = await fetch(
        `https://api.aladhan.com/v1/gToH/${dateStr}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch Hijri date');
      }

      const apiResponse = await response.json();
      const data = apiResponse.data;

      if (!data?.hijri) {
        throw new Error('Invalid API response');
      }

      const processedData = processHijriData(data);

      // Cache the response
      const cacheData: CachedHijriDate = {
        data: processedData,
        timestamp: Date.now(),
        gregorianDate: dateStr,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

      setHijriDate(processedData);
      setError(null);
    } catch (err) {
      console.error('Hijri date fetch error:', err);
      setError('Failed to load Hijri date');
      
      // Use cached data if available, even if expired
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const cachedData: CachedHijriDate = JSON.parse(cached);
        setHijriDate(cachedData.data);
      } else {
        // Fallback to a basic calculation (approximate)
        const today = new Date();
        const weekdayIndex = today.getDay();
        setHijriDate({
          day: 1,
          month: 'Rajab',
          monthAr: 'رجب',
          monthNumber: 7,
          year: 1446,
          weekday: WEEKDAYS[weekdayIndex].en,
          weekdayAr: WEEKDAYS[weekdayIndex].ar,
          holiday: null,
          holidayAr: null,
          fullDate: '1 Rajab 1446 AH',
          fullDateAr: '1 رجب 1446 هـ',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [processHijriData]);

  useEffect(() => {
    fetchHijriDate();
  }, [fetchHijriDate]);

  const refetch = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    setIsLoading(true);
    fetchHijriDate();
  }, [fetchHijriDate]);

  return {
    ...hijriDate,
    isLoading,
    error,
    refetch,
  };
}
