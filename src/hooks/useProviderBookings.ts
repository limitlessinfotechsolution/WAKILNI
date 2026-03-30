import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

export type Booking = Tables<'bookings'>;
export type BookingStatus = 'pending' | 'accepted' | 'assigned_to_vendor' | 'assigned_to_provider' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';

interface ProviderBookingWithDetails extends Booking {
  service?: {
    id: string;
    title: string;
    title_ar: string | null;
    service_type: string;
    price: number;
    currency: string | null;
  } | null;
  beneficiary?: {
    id: string;
    full_name: string;
    full_name_ar: string | null;
    status: string;
  } | null;
  traveler_profile?: {
    full_name: string | null;
    full_name_ar: string | null;
    phone: string | null;
  } | null;
}

export function useProviderBookings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<ProviderBookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [providerId, setProviderId] = useState<string | null>(null);

  const fetchProviderBookings = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data: provider, error: providerError } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (providerError || !provider) {
        setIsLoading(false);
        return;
      }

      setProviderId(provider.id);

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(
            id, title, title_ar, service_type, price, currency
          ),
          beneficiary:beneficiaries(
            id, full_name, full_name_ar, status
          )
        `)
        .eq('provider_id', provider.id)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching provider bookings:', error);
      toast({ title: 'Error', description: 'Failed to fetch bookings', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const acceptBooking = async (bookingId: string) => {
    if (!user || !providerId) return false;
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'in_progress' as any })
        .eq('id', bookingId)
        .eq('provider_id', providerId);

      if (error) throw error;

      await supabase.from('booking_activities').insert({
        booking_id: bookingId,
        actor_id: user.id,
        action: 'provider_accepted',
        details: { status: 'in_progress' },
      });

      toast({ title: 'Success', description: 'Booking accepted — now in progress' });
      await fetchProviderBookings();
      return true;
    } catch (error) {
      console.error('Error accepting booking:', error);
      toast({ title: 'Error', description: 'Failed to accept booking', variant: 'destructive' });
      return false;
    }
  };

  const rejectBooking = async (bookingId: string) => {
    if (!user || !providerId) return false;
    try {
      // Return to vendor by setting status back to assigned_to_vendor and clearing provider
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'assigned_to_vendor' as any, provider_id: null })
        .eq('id', bookingId)
        .eq('provider_id', providerId);

      if (error) throw error;

      await supabase.from('booking_activities').insert({
        booking_id: bookingId,
        actor_id: user.id,
        action: 'provider_rejected',
        details: { provider_id: providerId },
      });

      toast({ title: 'Job Rejected', description: 'Booking returned to vendor' });
      await fetchProviderBookings();
      return true;
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast({ title: 'Error', description: 'Failed to reject booking', variant: 'destructive' });
      return false;
    }
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    if (!user || !providerId) return false;
    try {
      const updates: Partial<Booking> = { status: status as any };
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', bookingId)
        .eq('provider_id', providerId);

      if (error) throw error;

      await supabase.from('booking_activities').insert({
        booking_id: bookingId,
        actor_id: user.id,
        action: `status_changed_to_${status}`,
        details: { status },
      });

      toast({ title: 'Success', description: 'Booking status updated' });
      await fetchProviderBookings();
      return true;
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({ title: 'Error', description: 'Failed to update booking', variant: 'destructive' });
      return false;
    }
  };

  useEffect(() => {
    fetchProviderBookings();
  }, [user]);

  return {
    bookings,
    isLoading,
    providerId,
    acceptBooking,
    rejectBooking,
    updateBookingStatus,
    refetch: fetchProviderBookings,
  };
}
