import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import * as ServicesAPI from '@/api/services/services.service';
import type { ServiceWithProvider, ServiceFilters, Service } from '@/api/services/services.service';
import type { ServiceType } from '@/config/constants';

export type { ServiceWithProvider, Service };
export type { ServiceType } from '@/config/constants';

export function useServices(filters?: { serviceType?: ServiceType; providerId?: string }) {
  const { toast } = useToast();

  const queryKey = ['services', filters?.serviceType, filters?.providerId];

  const { data: services = [], isLoading, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const apiFilters: ServiceFilters = {
        serviceType: filters?.serviceType,
        providerId: filters?.providerId,
        isActive: true,
      };
      
      const result = await ServicesAPI.getServices(apiFilters);
      
      if (!result.success) {
        toast({
          title: 'Error',
          description: result.error?.message || 'Failed to fetch services',
          variant: 'destructive',
        });
        throw new Error(result.error?.message);
      }
      
      return result.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    services,
    isLoading,
    refetch,
  };
}
