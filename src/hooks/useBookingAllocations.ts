import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BookingWithDetails {
  id: string;
  status: string | null;
  scheduled_date: string | null;
  total_amount: number | null;
  currency: string | null;
  special_requests: string | null;
  created_at: string;
  traveler_id: string | null;
  service?: {
    id: string;
    title: string;
    title_ar: string | null;
    service_type: string;
    price: number;
  } | null;
  beneficiary?: {
    id: string;
    full_name: string;
    full_name_ar: string | null;
  } | null;
  provider?: {
    id: string;
    company_name: string | null;
    rating: number | null;
  } | null;
  allocation?: {
    id: string;
    status: string | null;
    allocation_type: string | null;
    provider_id: string | null;
    vendor_id: string | null;
  } | null;
}

interface AvailableProvider {
  id: string;
  user_id: string;
  company_name: string | null;
  company_name_ar: string | null;
  rating: number | null;
  total_bookings: number | null;
  kyc_status: string | null;
  is_active: boolean | null;
  is_suspended: boolean | null;
}

export function useBookingAllocations() {
  const { toast } = useToast();
  const [pendingBookings, setPendingBookings] = useState<BookingWithDetails[]>([]);
  const [availableProviders, setAvailableProviders] = useState<AvailableProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(id, title, title_ar, service_type, price),
          beneficiary:beneficiaries(id, full_name, full_name_ar),
          provider:providers(id, company_name, rating)
        `)
        .in('status', ['pending', 'accepted'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch allocations separately
      const bookingIds = (data || []).map(b => b.id);
      const { data: allocations } = await supabase
        .from('service_allocations')
        .select('*')
        .in('booking_id', bookingIds);

      const bookingsWithAllocations = (data || []).map(booking => {
        const allocation = allocations?.find(a => a.booking_id === booking.id);
        return {
          ...booking,
          service: Array.isArray(booking.service) ? booking.service[0] : booking.service,
          beneficiary: Array.isArray(booking.beneficiary) ? booking.beneficiary[0] : booking.beneficiary,
          provider: Array.isArray(booking.provider) ? booking.provider[0] : booking.provider,
          allocation: allocation || null,
        };
      });

      setPendingBookings(bookingsWithAllocations);
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
    }
  };

  const fetchAvailableProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('kyc_status', 'approved')
        .eq('is_active', true)
        .eq('is_suspended', false)
        .order('rating', { ascending: false });

      if (error) throw error;
      setAvailableProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const assignToProvider = async (bookingId: string, providerId: string, notes?: string) => {
    try {
      // Check if allocation already exists
      const { data: existingAlloc } = await supabase
        .from('service_allocations')
        .select('id')
        .eq('booking_id', bookingId)
        .single();

      if (existingAlloc) {
        // Update existing allocation
        const { error } = await supabase
          .from('service_allocations')
          .update({
            provider_id: providerId,
            status: 'assigned',
            allocation_type: 'manual',
            assigned_at: new Date().toISOString(),
            notes,
          })
          .eq('id', existingAlloc.id);

        if (error) throw error;
      } else {
        // Create new allocation
        const { error } = await supabase
          .from('service_allocations')
          .insert({
            booking_id: bookingId,
            provider_id: providerId,
            status: 'assigned',
            allocation_type: 'manual',
            assigned_at: new Date().toISOString(),
            notes,
          });

        if (error) throw error;
      }

      // Update booking provider_id
      await supabase
        .from('bookings')
        .update({ provider_id: providerId, status: 'accepted' })
        .eq('id', bookingId);

      toast({
        title: 'Success',
        description: 'Booking assigned to provider',
      });

      await fetchPendingBookings();
      return true;
    } catch (error) {
      console.error('Error assigning booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign booking',
        variant: 'destructive',
      });
      return false;
    }
  };

  const autoRouteBooking = async (bookingId: string) => {
    try {
      // Find the best available provider based on rating and workload
      const booking = pendingBookings.find(b => b.id === bookingId);
      if (!booking?.service) {
        throw new Error('Booking or service not found');
      }

      // Get providers who offer this service type
      const serviceType = booking.service.service_type as 'umrah' | 'hajj' | 'ziyarat';
      const { data: eligibleProviders } = await supabase
        .from('providers')
        .select('*, services!inner(*)')
        .eq('kyc_status', 'approved')
        .eq('is_active', true)
        .eq('is_suspended', false)
        .eq('services.service_type', serviceType)
        .eq('services.is_active', true)
        .order('rating', { ascending: false })
        .limit(1);

      if (!eligibleProviders || eligibleProviders.length === 0) {
        toast({
          title: 'No Provider Available',
          description: 'No eligible provider found for this service type',
          variant: 'destructive',
        });
        return false;
      }

      const bestProvider = eligibleProviders[0];
      return await assignToProvider(bookingId, bestProvider.id, 'Auto-routed based on rating and availability');
    } catch (error) {
      console.error('Error auto-routing booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to auto-route booking',
        variant: 'destructive',
      });
      return false;
    }
  };

  const unassignBooking = async (bookingId: string) => {
    try {
      await supabase
        .from('service_allocations')
        .delete()
        .eq('booking_id', bookingId);

      await supabase
        .from('bookings')
        .update({ provider_id: null, status: 'pending' })
        .eq('id', bookingId);

      toast({
        title: 'Success',
        description: 'Booking unassigned',
      });

      await fetchPendingBookings();
      return true;
    } catch (error) {
      console.error('Error unassigning booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to unassign booking',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchPendingBookings(), fetchAvailableProviders()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  return {
    pendingBookings,
    availableProviders,
    isLoading,
    assignToProvider,
    autoRouteBooking,
    unassignBooking,
    refetch: async () => {
      await Promise.all([fetchPendingBookings(), fetchAvailableProviders()]);
    },
  };
}
