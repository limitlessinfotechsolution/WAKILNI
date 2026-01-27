import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Booking = Tables<'bookings'>;
export type BookingInsert = TablesInsert<'bookings'>;
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

  const createBooking = async (booking: Omit<BookingInsert, 'traveler_id'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ...booking,
          traveler_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from('booking_activities').insert({
        booking_id: data.id,
        actor_id: user.id,
        action: 'created',
        details: { status: 'pending' },
      });

      toast({
        title: 'Success',
        description: 'Booking created successfully',
      });

      await fetchBookings();
      return data;
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to create booking',
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
