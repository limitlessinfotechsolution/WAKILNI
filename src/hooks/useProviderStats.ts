/**
 * Provider Stats Hook
 * Fetches real provider earnings and performance statistics
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProvider } from './useProvider';

interface MonthlyEarning {
  month: string;
  amount: number;
}

interface ProviderStats {
  monthlyEarnings: number;
  totalEarnings: number;
  growthPercentage: number;
  earningsTrend: number[]; // Last 12 months for sparkline
  completionRate: number;
  averageRating: number;
  totalBookings: number;
  activeBookings: number;
  pendingBookings: number;
  currency: string;
}

export function useProviderStats() {
  const { provider } = useProvider();

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['provider-stats', provider?.id],
    queryFn: async (): Promise<ProviderStats> => {
      if (!provider?.id) {
        return getEmptyStats();
      }

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

      // Fetch all required data in parallel
      const [
        bookingsResult,
        thisMonthResult,
        lastMonthResult,
        yearlyResult,
        reviewsResult,
      ] = await Promise.all([
        // All bookings for this provider
        supabase
          .from('bookings')
          .select('id, status, total_amount, currency, completed_at, created_at')
          .eq('provider_id', provider.id),
        
        // This month's completed bookings
        supabase
          .from('bookings')
          .select('total_amount')
          .eq('provider_id', provider.id)
          .eq('status', 'completed')
          .gte('completed_at', thisMonth.toISOString()),
        
        // Last month's completed bookings
        supabase
          .from('bookings')
          .select('total_amount')
          .eq('provider_id', provider.id)
          .eq('status', 'completed')
          .gte('completed_at', lastMonth.toISOString())
          .lt('completed_at', thisMonth.toISOString()),
        
        // Last 12 months bookings
        supabase
          .from('bookings')
          .select('total_amount, completed_at')
          .eq('provider_id', provider.id)
          .eq('status', 'completed')
          .gte('completed_at', twelveMonthsAgo.toISOString())
          .order('completed_at', { ascending: true }),
        
        // Reviews for average rating
        supabase
          .from('reviews')
          .select('rating')
          .eq('provider_id', provider.id),
      ]);

      // Calculate booking stats
      const allBookings = bookingsResult.data || [];
      const totalBookings = allBookings.length;
      const completedBookings = allBookings.filter(b => b.status === 'completed').length;
      const activeBookings = allBookings.filter(b => ['accepted', 'in_progress'].includes(b.status || '')).length;
      const pendingBookings = allBookings.filter(b => ['pending', 'pending_payment'].includes(b.status || '')).length;
      const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

      // Calculate monthly earnings
      const monthlyEarnings = (thisMonthResult.data || []).reduce(
        (sum, b) => sum + (b.total_amount || 0),
        0
      );

      const lastMonthEarnings = (lastMonthResult.data || []).reduce(
        (sum, b) => sum + (b.total_amount || 0),
        0
      );

      // Calculate growth percentage
      let growthPercentage = 0;
      if (lastMonthEarnings > 0) {
        growthPercentage = ((monthlyEarnings - lastMonthEarnings) / lastMonthEarnings) * 100;
      } else if (monthlyEarnings > 0) {
        growthPercentage = 100; // New earnings = 100% growth
      }

      // Calculate total earnings
      const totalEarnings = allBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0);

      // Calculate 12-month trend
      const earningsTrend = calculateMonthlyTrend(yearlyResult.data || [], now);

      // Calculate average rating
      const reviews = reviewsResult.data || [];
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      // Get currency (default to SAR)
      const currency = allBookings.find(b => b.currency)?.currency || 'SAR';

      return {
        monthlyEarnings,
        totalEarnings,
        growthPercentage: Math.round(growthPercentage * 10) / 10,
        earningsTrend,
        completionRate: Math.round(completionRate),
        averageRating: Math.round(averageRating * 10) / 10,
        totalBookings,
        activeBookings,
        pendingBookings,
        currency,
      };
    },
    enabled: !!provider?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    monthlyEarnings: stats?.monthlyEarnings || 0,
    totalEarnings: stats?.totalEarnings || 0,
    growthPercentage: stats?.growthPercentage || 0,
    earningsTrend: stats?.earningsTrend || Array(12).fill(0),
    completionRate: stats?.completionRate || 0,
    averageRating: stats?.averageRating || 0,
    totalBookings: stats?.totalBookings || 0,
    activeBookings: stats?.activeBookings || 0,
    pendingBookings: stats?.pendingBookings || 0,
    currency: stats?.currency || 'SAR',
    isLoading,
    error: error?.message || null,
    refetch,
  };
}

function getEmptyStats(): ProviderStats {
  return {
    monthlyEarnings: 0,
    totalEarnings: 0,
    growthPercentage: 0,
    earningsTrend: Array(12).fill(0),
    completionRate: 0,
    averageRating: 0,
    totalBookings: 0,
    activeBookings: 0,
    pendingBookings: 0,
    currency: 'SAR',
  };
}

function calculateMonthlyTrend(
  bookings: { total_amount: number | null; completed_at: string | null }[],
  now: Date
): number[] {
  const months: number[] = Array(12).fill(0);
  
  bookings.forEach(booking => {
    if (!booking.completed_at || !booking.total_amount) return;
    
    const completedDate = new Date(booking.completed_at);
    const monthsAgo = 
      (now.getFullYear() - completedDate.getFullYear()) * 12 + 
      (now.getMonth() - completedDate.getMonth());
    
    if (monthsAgo >= 0 && monthsAgo < 12) {
      months[11 - monthsAgo] += booking.total_amount;
    }
  });
  
  return months;
}
