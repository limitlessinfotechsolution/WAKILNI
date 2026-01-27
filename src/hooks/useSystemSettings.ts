import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface SystemSetting {
  id: string;
  key: string;
  value: Json;
  description: string | null;
  category: string | null;
  updated_at: string;
}

export function useSystemSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setSettings((data || []) as SystemSetting[]);
    } catch (error) {
      console.error('Error fetching system settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch system settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: string, value: Json) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('system_settings')
        .update({ value, updated_by: user?.id })
        .eq('key', key);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Setting updated successfully',
      });

      await fetchSettings();
      return true;
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getSetting = (key: string) => {
    return settings.find(s => s.key === key);
  };

  const getSettingValue = <T>(key: string, defaultValue: T): T => {
    const setting = getSetting(key);
    if (!setting?.value) return defaultValue;
    return setting.value as T;
  };

  const isMaintenanceMode = () => {
    const value = getSettingValue<{ enabled?: boolean }>('maintenance_mode', { enabled: false });
    return value?.enabled === true;
  };

  const isEmergencyShutdown = () => {
    const value = getSettingValue<{ enabled?: boolean }>('emergency_shutdown', { enabled: false });
    return value?.enabled === true;
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    updateSetting,
    getSetting,
    getSettingValue,
    isMaintenanceMode,
    isEmergencyShutdown,
    refetch: fetchSettings,
  };
}
