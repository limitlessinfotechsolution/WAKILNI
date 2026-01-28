import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useProvider } from '@/hooks/useProvider';

export type PilgrimStatus = 'pending' | 'under_review' | 'verified' | 'suspended' | 'inactive';

export interface PilgrimCertification {
  id: string;
  provider_id: string;
  
  // Personal verification
  government_id_url: string | null;
  government_id_verified: boolean;
  photo_verification_url: string | null;
  photo_verified: boolean;
  
  // Religious qualifications
  has_completed_own_umrah: boolean;
  own_umrah_date: string | null;
  has_completed_own_hajj: boolean;
  own_hajj_date: string | null;
  umrah_permit_history: any[];
  
  // Video oath
  video_oath_url: string | null;
  video_oath_transcript: string | null;
  video_oath_verified: boolean;
  video_oath_verified_by: string | null;
  video_oath_verified_at: string | null;
  
  // Scholar verification
  scholar_approved: boolean;
  scholar_id: string | null;
  scholar_approval_date: string | null;
  scholar_notes: string | null;
  
  // Status and limits
  status: PilgrimStatus;
  max_active_badal: number;
  current_active_badal: number;
  
  // Violation tracking
  violation_count: number;
  violations: any[];
  last_violation_date: string | null;
  
  // Trust score
  trust_score: number;
  total_completed_rituals: number;
  
  // Timestamps
  submitted_at: string | null;
  verified_at: string | null;
  suspended_at: string | null;
  suspension_reason: string | null;
  created_at: string;
  updated_at: string;
}

export function usePilgrimCertification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { provider } = useProvider();
  const [certification, setCertification] = useState<PilgrimCertification | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCertification = async () => {
    if (!provider) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pilgrim_certifications')
        .select('*')
        .eq('provider_id', provider.id)
        .maybeSingle();

      if (error) throw error;
      setCertification(data as PilgrimCertification | null);
    } catch (error) {
      console.error('Error fetching certification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCertification = async (data: Partial<PilgrimCertification>) => {
    if (!provider) return null;

    try {
      const { data: newCert, error } = await supabase
        .from('pilgrim_certifications')
        .insert({
          provider_id: provider.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;

      setCertification(newCert as PilgrimCertification);
      toast({
        title: 'Success',
        description: 'Certification record created',
      });
      return newCert;
    } catch (error) {
      console.error('Error creating certification:', error);
      toast({
        title: 'Error',
        description: 'Failed to create certification record',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateCertification = async (updates: Partial<PilgrimCertification>) => {
    if (!certification) return null;

    try {
      const { data, error } = await supabase
        .from('pilgrim_certifications')
        .update(updates)
        .eq('id', certification.id)
        .select()
        .single();

      if (error) throw error;

      setCertification(data as PilgrimCertification);
      toast({
        title: 'Success',
        description: 'Certification updated',
      });
      return data;
    } catch (error) {
      console.error('Error updating certification:', error);
      toast({
        title: 'Error',
        description: 'Failed to update certification',
        variant: 'destructive',
      });
      return null;
    }
  };

  const submitForVerification = async () => {
    if (!certification) return false;

    try {
      const { error } = await supabase
        .from('pilgrim_certifications')
        .update({
          status: 'under_review',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', certification.id);

      if (error) throw error;

      await fetchCertification();
      toast({
        title: 'Success',
        description: 'Submitted for scholar verification',
      });
      return true;
    } catch (error) {
      console.error('Error submitting for verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit for verification',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Calculate completion percentage
  const getCompletionPercentage = (): number => {
    if (!certification) return 0;

    const checks = [
      !!certification.government_id_url,
      !!certification.photo_verification_url,
      certification.has_completed_own_umrah,
      !!certification.video_oath_url,
    ];

    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
  };

  // Check if ready for submission
  const isReadyForSubmission = (): boolean => {
    if (!certification) return false;

    return (
      !!certification.government_id_url &&
      !!certification.photo_verification_url &&
      certification.has_completed_own_umrah &&
      !!certification.video_oath_url
    );
  };

  useEffect(() => {
    fetchCertification();
  }, [provider]);

  return {
    certification,
    isLoading,
    createCertification,
    updateCertification,
    submitForVerification,
    refetch: fetchCertification,
    getCompletionPercentage,
    isReadyForSubmission,
  };
}
