import { useState, useCallback } from 'react';

export interface RitualLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export function useRitualLocation() {
  const [location, setLocation] = useState<RitualLocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    return new Promise<RitualLocationData | null>((resolve) => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        resolve(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geoData: RitualLocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          setLocation(geoData);
          setIsLoading(false);
          resolve(geoData);
        },
        (err) => {
          let errorMessage = 'Failed to get location';
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = 'Location permission denied';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case err.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          setError(errorMessage);
          setIsLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  // Check if location is near Masjid al-Haram (rough check)
  const isNearHaram = useCallback(() => {
    if (!location) return false;
    
    // Masjid al-Haram coordinates (approximate center)
    const haramLat = 21.4225;
    const haramLng = 39.8262;
    const radiusKm = 2; // 2km radius
    
    // Haversine formula for distance
    const R = 6371; // Earth's radius in km
    const dLat = (location.latitude - haramLat) * Math.PI / 180;
    const dLon = (location.longitude - haramLng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(haramLat * Math.PI / 180) * Math.cos(location.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance <= radiusKm;
  }, [location]);

  return {
    location,
    isLoading,
    error,
    requestLocation,
    clearLocation,
    isNearHaram,
  };
}
