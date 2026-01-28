import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

export type Booking = Tables<'bookings'>;
export type BookingStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';

interface BookingWithDetails extends Booking {
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
  provider?: {
    id: string;
    company_name: string | null;
    company_name_ar: string | null;
    rating: number | null;
  } | null;
}

// Secure booking creation request - no client-side price calculation
interface CreateBookingRequest {
  service_id: string;
  beneficiary_id: string;
  scheduled_date: string | null;
  special_requests: string | null;
}

export function useBookings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(
            id,
            title,
            title_ar,
            service_type,
            price,
            currency
          ),
          beneficiary:beneficiaries(
            id,
            full_name,
            full_name_ar,
            status
          ),
          provider:providers(
            id,
            company_name,
            company_name_ar,
            rating
          )
        `)
        .eq('traveler_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch bookings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Secure booking creation via Edge Function - price calculated server-side
  const createBooking = async (bookingRequest: CreateBookingRequest) => {
    if (!user) return null;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-booking`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            service_id: bookingRequest.service_id,
            beneficiary_id: bookingRequest.beneficiary_id,
            scheduled_date: bookingRequest.scheduled_date,
            special_requests: bookingRequest.special_requests,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create booking');
      }

      toast({
        title: 'Success',
        description: 'Booking created successfully',
      });

      await fetchBookings();
      return result.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create booking',
        variant: 'destructive',
      });
      return null;
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  return {
    bookings,
    isLoading,
    createBooking,
    refetch: fetchBookings,
  };
}
