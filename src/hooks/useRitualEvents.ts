import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export interface RitualEvent {
  id: string;
  booking_id: string;
  provider_id: string;
  beneficiary_id: string;
  ritual_step: string;
  step_order: number;
  timestamp: string;
  geo_location: { lat: number; lng: number; accuracy?: number } | null;
  media_url: string | null;
  media_type: string | null;
  media_hash: string | null;
  dua_audio_url: string | null;
  dua_transcript: string | null;
  beneficiary_name_mentioned: boolean;
  verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  verification_notes: string | null;
  is_flagged: boolean;
  flag_reason: string | null;
  exif_data: any;
  device_fingerprint: string | null;
  created_at: string;
}

export const UMRAH_RITUAL_STEPS = [
  { step: 'ihram', order: 1, labelEn: 'Ihram (Intention)', labelAr: 'الإحرام (النية)' },
  { step: 'tawaf_start', order: 2, labelEn: 'Tawaf Start', labelAr: 'بدء الطواف' },
  { step: 'tawaf_complete', order: 3, labelEn: 'Tawaf Complete (7 rounds)', labelAr: 'إكمال الطواف (٧ أشواط)' },
  { step: 'maqam_ibrahim', order: 4, labelEn: 'Prayer at Maqam Ibrahim', labelAr: 'الصلاة عند مقام إبراهيم' },
  { step: 'zamzam', order: 5, labelEn: 'Drink Zamzam Water', labelAr: 'شرب ماء زمزم' },
  { step: 'sai_start', order: 6, labelEn: 'Sa\'i Start (Safa)', labelAr: 'بدء السعي (الصفا)' },
  { step: 'sai_complete', order: 7, labelEn: 'Sa\'i Complete (7 laps)', labelAr: 'إكمال السعي (٧ أشواط)' },
  { step: 'halq_taqsir', order: 8, labelEn: 'Halq/Taqsir (Hair cut)', labelAr: 'الحلق أو التقصير' },
  { step: 'completion_dua', order: 9, labelEn: 'Completion Dua', labelAr: 'دعاء الإكمال' },
];

export function useRitualEvents(bookingId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<RitualEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = async () => {
    if (!bookingId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ritual_events')
        .select('*')
        .eq('booking_id', bookingId)
        .order('step_order', { ascending: true });

      if (error) throw error;
      setEvents((data as RitualEvent[]) || []);
    } catch (error) {
      console.error('Error fetching ritual events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const recordEvent = async (data: {
    booking_id: string;
    provider_id: string;
    beneficiary_id: string;
    ritual_step: string;
    step_order: number;
    geo_location?: { lat: number; lng: number; accuracy?: number };
    media_url?: string;
    media_type?: string;
    dua_audio_url?: string;
    dua_transcript?: string;
    beneficiary_name_mentioned?: boolean;
  }) => {
    try {
      const { data: newEvent, error } = await supabase
        .from('ritual_events')
        .insert({
          ...data,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => [...prev, newEvent as RitualEvent]);
      toast({
        title: 'Step Recorded',
        description: 'Ritual step has been recorded successfully',
      });
      return newEvent;
    } catch (error) {
      console.error('Error recording ritual event:', error);
      toast({
        title: 'Error',
        description: 'Failed to record ritual step',
        variant: 'destructive',
      });
      return null;
    }
  };

  const getCompletedSteps = () => {
    return events.map(e => e.ritual_step);
  };

  const getNextStep = () => {
    const completedSteps = getCompletedSteps();
    return UMRAH_RITUAL_STEPS.find(s => !completedSteps.includes(s.step));
  };

  const isRitualComplete = () => {
    return events.length >= UMRAH_RITUAL_STEPS.length;
  };

  useEffect(() => {
    fetchEvents();
  }, [bookingId]);

  return {
    events,
    isLoading,
    recordEvent,
    refetch: fetchEvents,
    getCompletedSteps,
    getNextStep,
    isRitualComplete,
    RITUAL_STEPS: UMRAH_RITUAL_STEPS,
  };
}
