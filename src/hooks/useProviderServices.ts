import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useProvider } from './useProvider';
import * as ServicesAPI from '@/api/services/services.service';
import type { Service, ServiceInsert, ServiceUpdate } from '@/api/services/services.service';

export type { Service, ServiceInsert, ServiceUpdate };
export type ServiceType = 'umrah' | 'hajj' | 'ziyarat';

export function useProviderServices() {
  const { provider } = useProvider();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryKey = ['provider-services', provider?.id];

  const { data: services = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!provider) return [];
      const result = await ServicesAPI.getProviderServices(provider.id, true);
      if (!result.success) throw new Error(result.error?.message);
      return result.data || [];
    },
    enabled: !!provider,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const addServiceMutation = useMutation({
    mutationFn: async (service: Omit<ServiceInsert, 'provider_id'>) => {
      if (!provider) throw new Error('No provider');
      const result = await ServicesAPI.createService({
        ...service,
        provider_id: provider.id,
      });
      if (!result.success) throw new Error(result.error?.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: 'Success',
        description: 'Service added successfully',
      });
    },
    onError: (error) => {
      console.error('Error adding service:', error);
      toast({
        title: 'Error',
        description: 'Failed to add service',
        variant: 'destructive',
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ServiceUpdate }) => {
      const result = await ServicesAPI.updateService(id, updates);
      if (!result.success) throw new Error(result.error?.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: 'Success',
        description: 'Service updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating service:', error);
      toast({
        title: 'Error',
        description: 'Failed to update service',
        variant: 'destructive',
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await ServicesAPI.deleteService(id);
      if (!result.success) throw new Error(result.error?.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: 'Success',
        description: 'Service deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Error deleting service:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete service',
        variant: 'destructive',
      });
    },
  });

  const addService = async (service: Omit<ServiceInsert, 'provider_id'>) => {
    return addServiceMutation.mutateAsync(service);
  };

  const updateService = async (id: string, updates: ServiceUpdate) => {
    return updateServiceMutation.mutateAsync({ id, updates });
  };

  const deleteService = async (id: string) => {
    return deleteServiceMutation.mutateAsync(id);
  };

  const toggleServiceActive = async (id: string, isActive: boolean) => {
    return updateService(id, { is_active: isActive });
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    services,
    isLoading,
    addService,
    updateService,
    deleteService,
    toggleServiceActive,
    refetch,
  };
}
