/**
 * Prayer Times Hook
 * Fetches accurate prayer times from Aladhan API with 24-hour caching
 */

import { useState, useEffect, useCallback } from 'react';
import { useGeolocation } from './useGeolocation';

interface PrayerTime {
  name: string;
  nameAr: string;
  time: string;
  passed: boolean;
}

interface PrayerTimesData {
  prayers: PrayerTime[];
  nextPrayer: PrayerTime | null;
  countdown: string;
  location: string;
  date: string;
}

interface CachedPrayerTimes {
  data: Record<string, string>;
  timestamp: number;
  latitude: number;
  longitude: number;
  date: string;
}

const CACHE_KEY = 'wakilni_prayer_times';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Makkah coordinates as fallback
const MAKKAH_COORDS = { lat: 21.4225, lng: 39.8262 };

const PRAYER_NAMES = [
  { key: 'Fajr', name: 'Fajr', nameAr: 'الفجر' },
  { key: 'Sunrise', name: 'Sunrise', nameAr: 'الشروق' },
  { key: 'Dhuhr', name: 'Dhuhr', nameAr: 'الظهر' },
  { key: 'Asr', name: 'Asr', nameAr: 'العصر' },
  { key: 'Maghrib', name: 'Maghrib', nameAr: 'المغرب' },
  { key: 'Isha', name: 'Isha', nameAr: 'العشاء' },
];

export function usePrayerTimes() {
  const { location, isLoading: geoLoading } = useGeolocation();
  const latitude = location?.latitude;
  const longitude = location?.longitude;
  const city = location?.city;
  const [prayerData, setPrayerData] = useState<PrayerTimesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getCurrentMinutes = (): number => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  const formatCountdown = (targetTime: string): string => {
    const now = new Date();
    const [hours, minutes] = targetTime.split(':').map(Number);
    
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    
    // If target time has passed, add a day
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }
    
    const diff = target.getTime() - now.getTime();
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  const processPrayerTimes = useCallback((timings: Record<string, string>, locationName: string) => {
    const currentMinutes = getCurrentMinutes();
    
    const prayers: PrayerTime[] = PRAYER_NAMES.map(({ key, name, nameAr }) => {
      const time = timings[key]?.split(' ')[0] || '00:00'; // Remove timezone if present
      const prayerMinutes = parseTimeToMinutes(time);
      
      return {
        name,
        nameAr,
        time,
        passed: prayerMinutes < currentMinutes,
      };
    });

    // Find next prayer
    const nextPrayer = prayers.find(p => !p.passed) || prayers[0];
    const countdown = nextPrayer ? formatCountdown(nextPrayer.time) : '';

    setPrayerData({
      prayers,
      nextPrayer,
      countdown,
      location: locationName,
      date: new Date().toLocaleDateString(),
    });
  }, []);

  const fetchPrayerTimes = useCallback(async (lat: number, lng: number, locationName: string) => {
    try {
      const today = new Date();
      const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
      
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const cachedData: CachedPrayerTimes = JSON.parse(cached);
        const isExpired = Date.now() - cachedData.timestamp > CACHE_DURATION;
        const isSameLocation = 
          Math.abs(cachedData.latitude - lat) < 0.1 && 
          Math.abs(cachedData.longitude - lng) < 0.1;
        const isSameDate = cachedData.date === dateStr;
        
        if (!isExpired && isSameLocation && isSameDate) {
          processPrayerTimes(cachedData.data, locationName);
          setIsLoading(false);
          return;
        }
      }

      // Fetch from API
      // Method 4 = Umm Al-Qura University, Makkah (used in Saudi Arabia)
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=4`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch prayer times');
      }

      const data = await response.json();
      const timings = data.data?.timings;

      if (!timings) {
        throw new Error('Invalid API response');
      }

      // Cache the response
      const cacheData: CachedPrayerTimes = {
        data: timings,
        timestamp: Date.now(),
        latitude: lat,
        longitude: lng,
        date: dateStr,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

      processPrayerTimes(timings, locationName);
      setError(null);
    } catch (err) {
      console.error('Prayer times fetch error:', err);
      setError('Failed to load prayer times');
      
      // Use cached data if available, even if expired
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const cachedData: CachedPrayerTimes = JSON.parse(cached);
        processPrayerTimes(cachedData.data, locationName);
      }
    } finally {
      setIsLoading(false);
    }
  }, [processPrayerTimes]);

  // Update countdown every minute
  useEffect(() => {
    if (!prayerData?.nextPrayer) return;

    const interval = setInterval(() => {
      setPrayerData(prev => {
        if (!prev?.nextPrayer) return prev;
        
        const currentMinutes = getCurrentMinutes();
        const updatedPrayers = prev.prayers.map(p => ({
          ...p,
          passed: parseTimeToMinutes(p.time) < currentMinutes,
        }));
        
        const nextPrayer = updatedPrayers.find(p => !p.passed) || updatedPrayers[0];
        
        return {
          ...prev,
          prayers: updatedPrayers,
          nextPrayer,
          countdown: formatCountdown(nextPrayer.time),
        };
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [prayerData?.nextPrayer]);

  // Fetch prayer times when location is available
  useEffect(() => {
    if (geoLoading) return;

    const lat = latitude || MAKKAH_COORDS.lat;
    const lng = longitude || MAKKAH_COORDS.lng;
    const locationName = city || 'Makkah';

    fetchPrayerTimes(lat, lng, locationName);
  }, [latitude, longitude, city, geoLoading, fetchPrayerTimes]);

  const refetch = useCallback(() => {
    localStorage.removeItem(CACHE_KEY);
    setIsLoading(true);
    
    const lat = latitude || MAKKAH_COORDS.lat;
    const lng = longitude || MAKKAH_COORDS.lng;
    const locationName = city || 'Makkah';
    
    fetchPrayerTimes(lat, lng, locationName);
  }, [latitude, longitude, city, fetchPrayerTimes]);

  return {
    prayers: prayerData?.prayers || [],
    nextPrayer: prayerData?.nextPrayer || null,
    countdown: prayerData?.countdown || '',
    location: prayerData?.location || '',
    isLoading: isLoading || geoLoading,
    error,
    refetch,
  };
}
