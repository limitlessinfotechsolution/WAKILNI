import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';

export type Provider = Tables<'providers'>;
export type ProviderUpdate = TablesUpdate<'providers'>;
export type KycStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export function useProvider() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProvider = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProvider(data);
    } catch (error) {
      console.error('Error fetching provider:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createProvider = async (data: Partial<Provider>) => {
    if (!user) return null;

    try {
      const { data: newProvider, error } = await supabase
        .from('providers')
        .insert({
          user_id: user.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;

      setProvider(newProvider);
      toast({
        title: 'Success',
        description: 'Provider profile created',
      });
      return newProvider;
    } catch (error) {
      console.error('Error creating provider:', error);
      toast({
        title: 'Error',
        description: 'Failed to create provider profile',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateProvider = async (updates: ProviderUpdate) => {
    if (!provider) return null;

    try {
      const { data, error } = await supabase
        .from('providers')
        .update(updates)
        .eq('id', provider.id)
        .select()
        .single();

      if (error) throw error;

      setProvider(data);
      toast({
        title: 'Success',
        description: 'Provider profile updated',
      });
      return data;
    } catch (error) {
      console.error('Error updating provider:', error);
      toast({
        title: 'Error',
        description: 'Failed to update provider profile',
        variant: 'destructive',
      });
      return null;
    }
  };

  const submitForKyc = async () => {
    if (!provider) return false;

    try {
      const { error } = await supabase
        .from('providers')
        .update({
          kyc_status: 'under_review',
          kyc_submitted_at: new Date().toISOString(),
        })
        .eq('id', provider.id);

      if (error) throw error;

      await fetchProvider();
      toast({
        title: 'Success',
        description: 'KYC submitted for review',
      });
      return true;
    } catch (error) {
      console.error('Error submitting KYC:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit for KYC',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProvider();
  }, [user]);

  return {
    provider,
    isLoading,
    createProvider,
    updateProvider,
    submitForKyc,
    refetch: fetchProvider,
  };
}
