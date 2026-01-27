import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type KycStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

interface Vendor {
  id: string;
  user_id: string;
  company_name: string;
  company_name_ar: string | null;
  commercial_registration: string | null;
  tax_number: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  subscription_plan: string | null;
  subscription_expires_at: string | null;
  kyc_status: KycStatus | null;
  kyc_notes: string | null;
  is_active: boolean | null;
  is_suspended: boolean | null;
  suspension_reason: string | null;
  total_bookings: number | null;
  rating: number | null;
  created_at: string;
  profile?: {
    full_name: string | null;
    full_name_ar: string | null;
    phone: string | null;
  } | null;
}

export function useAdminVendors(kycFilter?: KycStatus) {
  const { toast } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('vendors')
        .select(`
          *,
          profile:profiles!vendors_user_id_fkey(
            full_name,
            full_name_ar,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (kycFilter) {
        query = query.eq('kyc_status', kycFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const transformedData = (data || []).map(item => ({
        ...item,
        profile: Array.isArray(item.profile) ? item.profile[0] : item.profile
      }));
      
      setVendors(transformedData as Vendor[]);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch vendors',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateKycStatus = async (vendorId: string, status: KycStatus, notes?: string) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          kyc_status: status,
          kyc_notes: notes || null,
          kyc_reviewed_at: new Date().toISOString(),
          is_active: status === 'approved',
        })
        .eq('id', vendorId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Vendor ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      });

      await fetchVendors();
      return true;
    } catch (error) {
      console.error('Error updating vendor KYC:', error);
      toast({
        title: 'Error',
        description: 'Failed to update vendor status',
        variant: 'destructive',
      });
      return false;
    }
  };

  const suspendVendor = async (vendorId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          is_suspended: true,
          suspension_reason: reason,
          is_active: false,
        })
        .eq('id', vendorId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Vendor suspended successfully',
      });

      await fetchVendors();
      return true;
    } catch (error) {
      console.error('Error suspending vendor:', error);
      toast({
        title: 'Error',
        description: 'Failed to suspend vendor',
        variant: 'destructive',
      });
      return false;
    }
  };

  const unsuspendVendor = async (vendorId: string) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          is_suspended: false,
          suspension_reason: null,
          is_active: true,
        })
        .eq('id', vendorId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Vendor unsuspended successfully',
      });

      await fetchVendors();
      return true;
    } catch (error) {
      console.error('Error unsuspending vendor:', error);
      toast({
        title: 'Error',
        description: 'Failed to unsuspend vendor',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [kycFilter]);

  return {
    vendors,
    isLoading,
    updateKycStatus,
    suspendVendor,
    unsuspendVendor,
    refetch: fetchVendors,
  };
}
