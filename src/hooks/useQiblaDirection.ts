/**
 * Qibla Direction Hook
 * Calculates Qibla direction with device compass integration
 */

import { useState, useEffect, useCallback } from 'react';
import { useGeolocation } from './useGeolocation';

interface QiblaData {
  bearing: number; // Degrees from North
  compassHeading: number | null; // Device compass heading
  relativeDirection: number; // Bearing relative to device heading
  cardinalDirection: string;
  isCompassSupported: boolean;
  isCompassActive: boolean;
  distance: number; // km to Kaaba
}

// Kaaba coordinates (Al-Masjid al-Haram, Makkah)
const KAABA = {
  lat: 21.4225,
  lng: 39.8262,
};

const getCardinalDirection = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

const toRadians = (degrees: number): number => degrees * (Math.PI / 180);
const toDegrees = (radians: number): number => radians * (180 / Math.PI);

const calculateQiblaBearing = (lat: number, lng: number): number => {
  const lat1 = toRadians(lat);
  const lat2 = toRadians(KAABA.lat);
  const dLng = toRadians(KAABA.lng - lng);

  const y = Math.sin(dLng);
  const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLng);
  
  let bearing = toDegrees(Math.atan2(y, x));
  
  // Normalize to 0-360
  bearing = (bearing + 360) % 360;
  
  return bearing;
};

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

export function useQiblaDirection() {
  const { location, isLoading: geoLoading } = useGeolocation();
  const latitude = location?.latitude;
  const longitude = location?.longitude;
  const [qiblaData, setQiblaData] = useState<QiblaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compassHeading, setCompassHeading] = useState<number | null>(null);
  const [isCompassActive, setIsCompassActive] = useState(false);
  const [isCompassSupported, setIsCompassSupported] = useState(false);

  // Handle device orientation
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    // webkitCompassHeading is for iOS, alpha is for Android
    const heading = (event as any).webkitCompassHeading ?? (360 - (event.alpha || 0));
    
    if (heading !== null && !isNaN(heading)) {
      setCompassHeading(heading);
    }
  }, []);

  // Request compass permission (iOS 13+)
  const requestCompassPermission = useCallback(async (): Promise<boolean> => {
    // Check if DeviceOrientationEvent is available
    if (typeof DeviceOrientationEvent === 'undefined') {
      return false;
    }

    // iOS 13+ requires permission
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        return permission === 'granted';
      } catch {
        return false;
      }
    }

    // Android and older iOS don't need permission
    return true;
  }, []);

  // Enable compass
  const enableCompass = useCallback(async () => {
    const hasPermission = await requestCompassPermission();
    
    if (hasPermission) {
      window.addEventListener('deviceorientation', handleOrientation, true);
      setIsCompassActive(true);
      setIsCompassSupported(true);
      return true;
    } else {
      setError('Compass permission denied');
      setIsCompassSupported(false);
      return false;
    }
  }, [handleOrientation, requestCompassPermission]);

  // Disable compass
  const disableCompass = useCallback(() => {
    window.removeEventListener('deviceorientation', handleOrientation, true);
    setIsCompassActive(false);
    setCompassHeading(null);
  }, [handleOrientation]);

  // Check if compass is available
  useEffect(() => {
    const checkCompass = () => {
      // Check for DeviceOrientationEvent support
      if (typeof DeviceOrientationEvent !== 'undefined') {
        setIsCompassSupported(true);
      }
    };

    checkCompass();

    return () => {
      disableCompass();
    };
  }, [disableCompass]);

  // Calculate Qibla bearing when location is available
  useEffect(() => {
    if (geoLoading) return;

    // Use user location or default to Makkah
    const lat = latitude || 0;
    const lng = longitude || 0;

    if (lat === 0 && lng === 0) {
      // No location available
      setQiblaData({
        bearing: 0,
        compassHeading: null,
        relativeDirection: 0,
        cardinalDirection: 'N',
        isCompassSupported,
        isCompassActive,
        distance: 0,
      });
      setError('Location required for Qibla calculation');
      setIsLoading(false);
      return;
    }

    const bearing = calculateQiblaBearing(lat, lng);
    const distance = calculateDistance(lat, lng, KAABA.lat, KAABA.lng);
    
    setQiblaData({
      bearing,
      compassHeading,
      relativeDirection: compassHeading !== null ? (bearing - compassHeading + 360) % 360 : bearing,
      cardinalDirection: getCardinalDirection(bearing),
      isCompassSupported,
      isCompassActive,
      distance,
    });
    
    setError(null);
    setIsLoading(false);
  }, [latitude, longitude, geoLoading, compassHeading, isCompassSupported, isCompassActive]);

  // Update relative direction when compass heading changes
  useEffect(() => {
    if (qiblaData && compassHeading !== null) {
      setQiblaData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          compassHeading,
          relativeDirection: (prev.bearing - compassHeading + 360) % 360,
        };
      });
    }
  }, [compassHeading]);

  return {
    bearing: qiblaData?.bearing || 0,
    compassHeading: qiblaData?.compassHeading,
    relativeDirection: qiblaData?.relativeDirection || 0,
    cardinalDirection: qiblaData?.cardinalDirection || 'N',
    distance: qiblaData?.distance || 0,
    isCompassSupported,
    isCompassActive,
    isLoading: isLoading || geoLoading,
    error,
    enableCompass,
    disableCompass,
  };
}
