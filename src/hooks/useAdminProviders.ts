import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logAuditAction } from '@/hooks/useAuditLogger';
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
          profile:profiles(
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
      const provider = providers.find(p => p.id === providerId);
      const oldStatus = provider?.kyc_status;

      const { error } = await supabase
        .from('providers')
        .update({
          kyc_status: status,
          kyc_notes: notes || null,
          kyc_reviewed_at: new Date().toISOString(),
          is_active: status === 'approved',
        })
        .eq('id', providerId);

      if (error) throw error;

      // Log audit action
      await logAuditAction({
        action: status === 'approved' ? 'provider_kyc_approved' : 'provider_kyc_rejected',
        entityType: 'provider',
        entityId: providerId,
        oldValues: { 
          kyc_status: oldStatus,
          provider_name: provider?.company_name || provider?.profile?.full_name
        },
        newValues: { kyc_status: status, notes },
        metadata: { 
          provider_name: provider?.company_name || provider?.profile?.full_name,
          decision: status
        }
      });

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

  const suspendProvider = async (providerId: string, reason: string) => {
    try {
      const provider = providers.find(p => p.id === providerId);

      const { error } = await supabase
        .from('providers')
        .update({
          is_suspended: true,
          suspension_reason: reason,
          is_active: false,
        })
        .eq('id', providerId);

      if (error) throw error;

      // Log audit action
      await logAuditAction({
        action: 'provider_suspended',
        entityType: 'provider',
        entityId: providerId,
        oldValues: { is_suspended: false },
        newValues: { is_suspended: true, suspension_reason: reason },
        metadata: { 
          provider_name: provider?.company_name || provider?.profile?.full_name,
          reason
        }
      });

      toast({
        title: 'Success',
        description: 'Provider suspended successfully',
      });

      await fetchProviders();
      return true;
    } catch (error) {
      console.error('Error suspending provider:', error);
      toast({
        title: 'Error',
        description: 'Failed to suspend provider',
        variant: 'destructive',
      });
      return false;
    }
  };

  const activateProvider = async (providerId: string) => {
    try {
      const provider = providers.find(p => p.id === providerId);

      const { error } = await supabase
        .from('providers')
        .update({
          is_suspended: false,
          suspension_reason: null,
          is_active: true,
        })
        .eq('id', providerId);

      if (error) throw error;

      // Log audit action
      await logAuditAction({
        action: 'provider_activated',
        entityType: 'provider',
        entityId: providerId,
        oldValues: { is_suspended: true },
        newValues: { is_suspended: false, is_active: true },
        metadata: { 
          provider_name: provider?.company_name || provider?.profile?.full_name
        }
      });

      toast({
        title: 'Success',
        description: 'Provider activated successfully',
      });

      await fetchProviders();
      return true;
    } catch (error) {
      console.error('Error activating provider:', error);
      toast({
        title: 'Error',
        description: 'Failed to activate provider',
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
    suspendProvider,
    activateProvider,
    refetch: fetchProviders,
  };
}
