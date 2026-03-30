import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
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
  vendor_id: string | null;
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
  vendor?: {
    id: string;
    company_name: string;
    company_name_ar: string | null;
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

interface AvailableVendor {
  id: string;
  company_name: string;
  company_name_ar: string | null;
  rating: number | null;
  is_active: boolean | null;
}

export function useBookingAllocations() {
  const { toast } = useToast();
  const { role } = useAuth();
  const [pendingBookings, setPendingBookings] = useState<BookingWithDetails[]>([]);
  const [availableProviders, setAvailableProviders] = useState<AvailableProvider[]>([]);
  const [availableVendors, setAvailableVendors] = useState<AvailableVendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isSuperAdmin = role === 'super_admin';

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
        .in('status', ['pending', 'assigned_to_vendor', 'assigned_to_provider', 'accepted'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch vendor details for bookings that have vendor_id
      const vendorIds = [...new Set((data || []).map(b => b.vendor_id).filter(Boolean))];
      let vendorMap: Record<string, { id: string; company_name: string; company_name_ar: string | null }> = {};
      
      if (vendorIds.length > 0) {
        const { data: vendors } = await supabase
          .from('vendors')
          .select('id, company_name, company_name_ar')
          .in('id', vendorIds);
        
        (vendors || []).forEach(v => { vendorMap[v.id] = v; });
      }

      const bookingsWithDetails = (data || []).map(booking => ({
        ...booking,
        service: Array.isArray(booking.service) ? booking.service[0] : booking.service,
        beneficiary: Array.isArray(booking.beneficiary) ? booking.beneficiary[0] : booking.beneficiary,
        provider: Array.isArray(booking.provider) ? booking.provider[0] : booking.provider,
        vendor: booking.vendor_id ? vendorMap[booking.vendor_id] || null : null,
      }));

      setPendingBookings(bookingsWithDetails);
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

  const fetchAvailableVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('id, company_name, company_name_ar, rating, is_active')
        .eq('kyc_status', 'approved')
        .eq('is_active', true)
        .eq('is_suspended', false)
        .order('rating', { ascending: false });

      if (error) throw error;
      setAvailableVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const assignToVendor = async (bookingId: string, vendorId: string, notes?: string) => {
    try {
      // Update booking with vendor_id and status
      const { error } = await supabase
        .from('bookings')
        .update({ vendor_id: vendorId, status: 'assigned_to_vendor' as any })
        .eq('id', bookingId);

      if (error) throw error;

      // Create allocation record
      await supabase.from('service_allocations').insert({
        booking_id: bookingId,
        vendor_id: vendorId,
        status: 'assigned',
        allocation_type: 'manual',
        assigned_at: new Date().toISOString(),
        notes,
      });

      // Log activity
      await supabase.from('booking_activities').insert({
        booking_id: bookingId,
        action: 'assigned_to_vendor',
        details: { vendor_id: vendorId, notes },
      });

      // Notify vendor
      const { data: vendor } = await supabase
        .from('vendors')
        .select('user_id')
        .eq('id', vendorId)
        .single();

      if (vendor) {
        await supabase.from('notification_queue').insert({
          user_id: vendor.user_id,
          notification_type: 'booking_assigned_to_vendor',
          title: 'New Booking Assigned',
          body: 'A new booking has been assigned to you by admin',
          payload: { booking_id: bookingId },
        });
      }

      toast({ title: 'Success', description: 'Booking assigned to vendor' });
      await fetchPendingBookings();
      return true;
    } catch (error) {
      console.error('Error assigning to vendor:', error);
      toast({ title: 'Error', description: 'Failed to assign booking', variant: 'destructive' });
      return false;
    }
  };

  const assignToProvider = async (bookingId: string, providerId: string, notes?: string) => {
    try {
      // Super Admin direct assignment bypasses vendor step
      const { error } = await supabase
        .from('bookings')
        .update({ provider_id: providerId, status: 'assigned_to_provider' as any })
        .eq('id', bookingId);

      if (error) throw error;

      await supabase.from('service_allocations').upsert({
        booking_id: bookingId,
        provider_id: providerId,
        status: 'assigned',
        allocation_type: 'manual',
        assigned_at: new Date().toISOString(),
        notes,
      }, { onConflict: 'booking_id' });

      await supabase.from('booking_activities').insert({
        booking_id: bookingId,
        action: 'assigned_to_provider',
        details: { provider_id: providerId, notes },
      });

      // Notify provider
      const { data: provider } = await supabase
        .from('providers')
        .select('user_id')
        .eq('id', providerId)
        .single();

      if (provider) {
        await supabase.from('notification_queue').insert({
          user_id: provider.user_id,
          notification_type: 'booking_assigned_to_provider',
          title: 'New Job Assigned',
          body: 'A new job has been assigned to you',
          payload: { booking_id: bookingId },
        });
      }

      toast({ title: 'Success', description: 'Booking assigned to provider' });
      await fetchPendingBookings();
      return true;
    } catch (error) {
      console.error('Error assigning booking:', error);
      toast({ title: 'Error', description: 'Failed to assign booking', variant: 'destructive' });
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
        .update({ provider_id: null, vendor_id: null, status: 'pending' as any })
        .eq('id', bookingId);

      toast({ title: 'Success', description: 'Booking unassigned' });
      await fetchPendingBookings();
      return true;
    } catch (error) {
      console.error('Error unassigning booking:', error);
      toast({ title: 'Error', description: 'Failed to unassign booking', variant: 'destructive' });
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchPendingBookings(), fetchAvailableProviders(), fetchAvailableVendors()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  return {
    pendingBookings,
    availableProviders,
    availableVendors,
    isLoading,
    isSuperAdmin,
    assignToVendor,
    assignToProvider,
    unassignBooking,
    refetch: async () => {
      await Promise.all([fetchPendingBookings(), fetchAvailableProviders(), fetchAvailableVendors()]);
    },
  };
}
