import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useProvider } from './useProvider';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Service = Tables<'services'>;
export type ServiceInsert = TablesInsert<'services'>;
export type ServiceUpdate = TablesUpdate<'services'>;
export type ServiceType = 'umrah' | 'hajj' | 'ziyarat';

export function useProviderServices() {
  const { user } = useAuth();
  const { provider } = useProvider();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchServices = async () => {
    if (!provider) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', provider.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch services',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addService = async (service: Omit<ServiceInsert, 'provider_id'>) => {
    if (!provider) return null;

    try {
      const { data, error } = await supabase
        .from('services')
        .insert({
          ...service,
          provider_id: provider.id,
        })
        .select()
        .single();

      if (error) throw error;

      setServices(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Service added successfully',
      });
      return data;
    } catch (error) {
      console.error('Error adding service:', error);
      toast({
        title: 'Error',
        description: 'Failed to add service',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateService = async (id: string, updates: ServiceUpdate) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setServices(prev => prev.map(s => (s.id === id ? data : s)));
      toast({
        title: 'Success',
        description: 'Service updated successfully',
      });
      return data;
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: 'Error',
        description: 'Failed to update service',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setServices(prev => prev.filter(s => s.id !== id));
      toast({
        title: 'Success',
        description: 'Service deleted successfully',
      });
      return true;
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete service',
        variant: 'destructive',
      });
      return false;
    }
  };

  const toggleServiceActive = async (id: string, isActive: boolean) => {
    return updateService(id, { is_active: isActive });
  };

  useEffect(() => {
    fetchServices();
  }, [provider]);

  return {
    services,
    isLoading,
    addService,
    updateService,
    deleteService,
    toggleServiceActive,
    refetch: fetchServices,
  };
}
