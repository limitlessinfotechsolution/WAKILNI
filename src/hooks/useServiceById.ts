import { useQuery } from '@tanstack/react-query';
import * as ServicesAPI from '@/api/services/services.service';
import type { ServiceWithProvider } from '@/api/services/services.service';

export function useServiceById(serviceId: string | null | undefined) {
  const { data: service, isLoading, error, refetch } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      if (!serviceId) return null;
      const result = await ServicesAPI.getServiceById(serviceId);
      if (!result.success) throw new Error(result.error?.message);
      return result.data;
    },
    enabled: !!serviceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    service,
    isLoading,
    error,
    refetch,
  };
}
