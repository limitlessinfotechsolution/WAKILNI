import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalTravelers: number;
  totalProviders: number;
  totalVendors: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalDonations: number;
  donationAmount: number;
  pendingKyc: number;
  activeServices: number;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalTravelers: 0,
    totalProviders: 0,
    totalVendors: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalDonations: 0,
    donationAmount: 0,
    pendingKyc: 0,
    activeServices: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Fetch counts in parallel
      const [
        travelersRes,
        providersRes,
        vendorsRes,
        bookingsRes,
        pendingBookingsRes,
        completedBookingsRes,
        donationsRes,
        pendingKycRes,
        servicesRes,
      ] = await Promise.all([
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'traveler'),
        supabase.from('providers').select('*', { count: 'exact', head: true }),
        supabase.from('vendors').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('donations').select('amount'),
        supabase.from('providers').select('*', { count: 'exact', head: true }).eq('kyc_status', 'pending'),
        supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      const donationTotal = donationsRes.data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

      setStats({
        totalTravelers: travelersRes.count || 0,
        totalProviders: providersRes.count || 0,
        totalVendors: vendorsRes.count || 0,
        totalBookings: bookingsRes.count || 0,
        pendingBookings: pendingBookingsRes.count || 0,
        completedBookings: completedBookingsRes.count || 0,
        totalDonations: donationsRes.data?.length || 0,
        donationAmount: donationTotal,
        pendingKyc: pendingKycRes.count || 0,
        activeServices: servicesRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, isLoading, refetch: fetchStats };
}
