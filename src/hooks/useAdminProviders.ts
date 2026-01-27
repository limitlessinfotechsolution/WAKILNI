import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Provider = Tables<'providers'>;
type KycStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

interface ProviderWithProfile extends Provider {
  profile?: {
    full_name: string | null;
    full_name_ar: string | null;
    phone: string | null;
    avatar_url: string | null;
  } | null;
}

export function useAdminProviders(kycFilter?: KycStatus) {
  const { toast } = useToast();
  const [providers, setProviders] = useState<ProviderWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('providers')
        .select(`
          *,
          profile:profiles!providers_user_id_fkey(
            full_name,
            full_name_ar,
            phone,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (kycFilter) {
        query = query.eq('kyc_status', kycFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transform data to match expected structure
      const transformedData = (data || []).map(item => ({
        ...item,
        profile: Array.isArray(item.profile) ? item.profile[0] : item.profile
      }));
      
      setProviders(transformedData);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch providers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateKycStatus = async (
    providerId: string, 
    status: KycStatus, 
    notes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('providers')
        .update({
          kyc_status: status,
          kyc_notes: notes || null,
          kyc_reviewed_at: new Date().toISOString(),
        })
        .eq('id', providerId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Provider ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      });

      await fetchProviders();
      return true;
    } catch (error) {
      console.error('Error updating KYC status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update KYC status',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [kycFilter]);

  return {
    providers,
    isLoading,
    updateKycStatus,
    refetch: fetchProviders,
  };
}
