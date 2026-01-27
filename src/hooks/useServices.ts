import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

export type Service = Tables<'services'>;
export type ServiceType = 'umrah' | 'hajj' | 'ziyarat';

interface ServiceWithProvider extends Service {
  provider?: {
    id: string;
    company_name: string | null;
    company_name_ar: string | null;
    rating: number | null;
    total_reviews: number | null;
    bio: string | null;
    bio_ar: string | null;
  } | null;
}

export function useServices(filters?: { serviceType?: ServiceType; providerId?: string }) {
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceWithProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('services')
        .select(`
          *,
          provider:providers(
            id,
            company_name,
            company_name_ar,
            rating,
            total_reviews,
            bio,
            bio_ar
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters?.serviceType) {
        query = query.eq('service_type', filters.serviceType);
      }

      if (filters?.providerId) {
        query = query.eq('provider_id', filters.providerId);
      }

      const { data, error } = await query;

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

  useEffect(() => {
    fetchServices();
  }, [filters?.serviceType, filters?.providerId]);

  return {
    services,
    isLoading,
    refetch: fetchServices,
  };
}
