import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';

export type KycStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

interface VendorKyc {
  id: string;
  user_id: string;
  company_name: string;
  company_name_ar: string | null;
  commercial_registration: string | null;
  tax_number: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  address_ar: string | null;
  is_saudi_registered: boolean | null;
  logo_url: string | null;
  kyc_status: KycStatus | null;
  kyc_notes: string | null;
  kyc_submitted_at: string | null;
  created_at: string;
}

export interface VendorKycFormData {
  company_name: string;
  company_name_ar?: string;
  commercial_registration?: string;
  tax_number?: string;
  contact_email: string;
  contact_phone?: string;
  address: string;
  address_ar?: string;
  is_saudi_registered: boolean;
}

export function useVendorKyc() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<VendorKyc | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVendor = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setVendor(data as VendorKyc | null);
    } catch (error) {
      console.error('Error fetching vendor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendor();
  }, [user]);

  const createVendor = async (data: VendorKycFormData) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('vendors')
        .insert({
          user_id: user.id,
          company_name: data.company_name,
          company_name_ar: data.company_name_ar || null,
          commercial_registration: data.commercial_registration || null,
          tax_number: data.tax_number || null,
          contact_email: data.contact_email || null,
          contact_phone: data.contact_phone || null,
          address: data.address || null,
          address_ar: data.address_ar || null,
          is_saudi_registered: data.is_saudi_registered,
          kyc_status: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Vendor profile created successfully',
      });

      await fetchVendor();
      return true;
    } catch (error) {
      console.error('Error creating vendor:', error);
      toast({
        title: 'Error',
        description: 'Failed to create vendor profile',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateVendor = async (data: VendorKycFormData) => {
    if (!user || !vendor) return false;

    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          company_name: data.company_name,
          company_name_ar: data.company_name_ar || null,
          commercial_registration: data.commercial_registration || null,
          tax_number: data.tax_number || null,
          contact_email: data.contact_email || null,
          contact_phone: data.contact_phone || null,
          address: data.address || null,
          address_ar: data.address_ar || null,
          is_saudi_registered: data.is_saudi_registered,
        })
        .eq('id', vendor.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Vendor profile updated successfully',
      });

      await fetchVendor();
      return true;
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast({
        title: 'Error',
        description: 'Failed to update vendor profile',
        variant: 'destructive',
      });
      return false;
    }
  };

  const submitForKyc = async () => {
    if (!user || !vendor) return false;

    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          kyc_status: 'under_review',
          kyc_submitted_at: new Date().toISOString(),
        })
        .eq('id', vendor.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'KYC application submitted for review',
      });

      await fetchVendor();
      return true;
    } catch (error) {
      console.error('Error submitting KYC:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit KYC application',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    vendor,
    isLoading,
    createVendor,
    updateVendor,
    submitForKyc,
    refetch: fetchVendor,
  };
}
