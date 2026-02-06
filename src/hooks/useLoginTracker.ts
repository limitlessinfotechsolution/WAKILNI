import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

function parseUserAgent(ua: string) {
  let browser = 'Unknown';
  let os = 'Unknown';
  let deviceType = 'desktop';

  // Browser detection
  if (ua.includes('Firefox/')) browser = 'Firefox';
  else if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';

  // OS detection
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  // Device type
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
    deviceType = 'mobile';
  } else if (ua.includes('iPad') || ua.includes('Tablet')) {
    deviceType = 'tablet';
  }

  return { browser, os, deviceType };
}

export function useLoginTracker() {
  const trackLogin = useCallback(async (userId: string) => {
    try {
      const ua = navigator.userAgent;
      const { browser, os, deviceType } = parseUserAgent(ua);

      // Try to get rough location from timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const city = timezone.split('/').pop()?.replace(/_/g, ' ') || '';

      // Insert session record
      await supabase.from('user_sessions').insert({
        user_id: userId,
        user_agent: ua,
        device_type: deviceType,
        browser,
        os,
        city,
        is_current: true,
      });

      // Update profile last login
      await supabase.from('profiles').update({
        last_login_at: new Date().toISOString(),
        last_login_device: `${browser} on ${os}`,
        last_login_location: city,
      }).eq('user_id', userId);
    } catch (error) {
      console.error('Error tracking login:', error);
    }
  }, []);

  return { trackLogin };
}
