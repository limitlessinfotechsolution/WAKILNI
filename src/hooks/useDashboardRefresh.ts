import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n';

export function useDashboardRefresh() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  const { isRTL } = useLanguage();

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      // Invalidate all dashboard-related queries
      await queryClient.invalidateQueries();
      
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(isRTL ? 'تم تحديث البيانات' : 'Data refreshed');
    } catch (error) {
      toast.error(isRTL ? 'فشل في التحديث' : 'Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, isRTL]);

  const simulateLoad = useCallback((duration = 1000) => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), duration);
  }, []);

  const finishLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return {
    isRefreshing,
    isLoading,
    refresh,
    simulateLoad,
    finishLoading,
  };
}
