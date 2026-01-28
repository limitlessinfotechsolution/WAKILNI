import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';

export interface PublicAvailabilitySlot {
  id: string;
  provider_id: string;
  date: string;
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
  max_bookings: number;
  current_bookings: number;
}

export function usePublicProviderAvailability(providerId: string | undefined) {
  // Fetch availability for the next 3 months
  const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(addMonths(new Date(), 3)), 'yyyy-MM-dd');

  const { data: availability = [], isLoading } = useQuery({
    queryKey: ['public-provider-availability', providerId, startDate, endDate],
    queryFn: async () => {
      if (!providerId) return [];
      
      const { data, error } = await supabase
        .from('provider_availability')
        .select('id, provider_id, date, is_available, start_time, end_time, max_bookings, current_bookings')
        .eq('provider_id', providerId)
        .eq('is_available', true)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return data as PublicAvailabilitySlot[];
    },
    enabled: !!providerId,
  });

  // Check if a specific date is available
  const isDateAvailable = (date: Date): boolean => {
    if (!providerId) return true; // Default to available if no provider selected
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const slot = availability.find(a => a.date === dateStr);
    
    // If no slot exists, default to unavailable (provider hasn't set availability)
    if (!slot) return false;
    
    return slot.is_available && slot.current_bookings < slot.max_bookings;
  };

  // Get remaining slots for a date
  const getRemainingSlots = (date: Date): number => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const slot = availability.find(a => a.date === dateStr);
    
    if (!slot) return 0;
    return Math.max(0, slot.max_bookings - slot.current_bookings);
  };

  // Get available dates as array
  const getAvailableDates = (): Date[] => {
    return availability
      .filter(slot => slot.is_available && slot.current_bookings < slot.max_bookings)
      .map(slot => new Date(slot.date));
  };

  // Get next available date
  const getNextAvailableDate = (): Date | null => {
    const today = new Date();
    const availableDates = getAvailableDates().filter(d => d >= today);
    return availableDates.length > 0 ? availableDates[0] : null;
  };

  return {
    availability,
    isLoading,
    isDateAvailable,
    getRemainingSlots,
    getAvailableDates,
    getNextAvailableDate,
  };
}
