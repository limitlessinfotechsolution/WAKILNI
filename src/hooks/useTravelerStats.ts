/**
 * Traveler Stats Hook
 * Fetches real booking and beneficiary statistics for travelers
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface TravelerStats {
  activeBookings: number;
  completedBookings: number;
  pendingBookings: number;
  beneficiariesCount: number;
  totalSpent: number;
  currency: string;
}

export function useTravelerStats() {
  const { user } = useAuth();

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['traveler-stats', user?.id],
    queryFn: async (): Promise<TravelerStats> => {
      if (!user?.id) {
        return {
          activeBookings: 0,
          completedBookings: 0,
          pendingBookings: 0,
          beneficiariesCount: 0,
          totalSpent: 0,
          currency: 'SAR',
        };
      }

      // Fetch booking counts by status
      const [activeResult, completedResult, pendingResult, beneficiariesResult, spentResult] = await Promise.all([
        // Active bookings (accepted or in_progress)
        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('traveler_id', user.id)
          .in('status', ['accepted', 'in_progress']),
        
        // Completed bookings
        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('traveler_id', user.id)
          .eq('status', 'completed'),
        
        // Pending bookings
        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('traveler_id', user.id)
          .eq('status', 'pending'),
        
        // Beneficiaries count
        supabase
          .from('beneficiaries')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        
        // Total spent (sum of completed booking amounts)
        supabase
          .from('bookings')
          .select('total_amount, currency')
          .eq('traveler_id', user.id)
          .eq('status', 'completed'),
      ]);

      // Calculate total spent
      let totalSpent = 0;
      let currency = 'SAR';
      
      if (spentResult.data && spentResult.data.length > 0) {
        totalSpent = spentResult.data.reduce((sum, booking) => {
          return sum + (booking.total_amount || 0);
        }, 0);
        currency = spentResult.data[0].currency || 'SAR';
      }

      return {
        activeBookings: activeResult.count || 0,
        completedBookings: completedResult.count || 0,
        pendingBookings: pendingResult.count || 0,
        beneficiariesCount: beneficiariesResult.count || 0,
        totalSpent,
        currency,
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  return {
    activeBookings: stats?.activeBookings || 0,
    completedBookings: stats?.completedBookings || 0,
    pendingBookings: stats?.pendingBookings || 0,
    beneficiariesCount: stats?.beneficiariesCount || 0,
    totalSpent: stats?.totalSpent || 0,
    currency: stats?.currency || 'SAR',
    isLoading,
    error: error?.message || null,
    refetch,
  };
}
