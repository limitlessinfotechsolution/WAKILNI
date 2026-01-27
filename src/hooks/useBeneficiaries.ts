import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Beneficiary = Tables<'beneficiaries'>;
export type BeneficiaryInsert = TablesInsert<'beneficiaries'>;
export type BeneficiaryUpdate = TablesUpdate<'beneficiaries'>;
export type BeneficiaryStatus = 'deceased' | 'sick' | 'elderly' | 'disabled' | 'other';

export function useBeneficiaries() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBeneficiaries = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBeneficiaries(data || []);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch beneficiaries',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addBeneficiary = async (beneficiary: Omit<BeneficiaryInsert, 'user_id'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .insert({
          ...beneficiary,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setBeneficiaries(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Beneficiary added successfully',
      });
      return data;
    } catch (error) {
      console.error('Error adding beneficiary:', error);
      toast({
        title: 'Error',
        description: 'Failed to add beneficiary',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateBeneficiary = async (id: string, updates: BeneficiaryUpdate) => {
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setBeneficiaries(prev =>
        prev.map(b => (b.id === id ? data : b))
      );
      toast({
        title: 'Success',
        description: 'Beneficiary updated successfully',
      });
      return data;
    } catch (error) {
      console.error('Error updating beneficiary:', error);
      toast({
        title: 'Error',
        description: 'Failed to update beneficiary',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteBeneficiary = async (id: string) => {
    try {
      const { error } = await supabase
        .from('beneficiaries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBeneficiaries(prev => prev.filter(b => b.id !== id));
      toast({
        title: 'Success',
        description: 'Beneficiary deleted successfully',
      });
      return true;
    } catch (error) {
      console.error('Error deleting beneficiary:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete beneficiary',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, [user]);

  return {
    beneficiaries,
    isLoading,
    addBeneficiary,
    updateBeneficiary,
    deleteBeneficiary,
    refetch: fetchBeneficiaries,
  };
}
