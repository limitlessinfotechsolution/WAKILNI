import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { addMonths } from 'date-fns';

interface VendorSubscription {
  id: string;
  company_name: string;
  company_name_ar: string | null;
  subscription_plan: string | null;
  subscription_expires_at: string | null;
  is_active: boolean | null;
  kyc_status: string | null;
  user_id: string;
}

interface SubscriptionStats {
  totalVendors: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  basicPlan: number;
  proPlan: number;
  enterprisePlan: number;
  monthlyRevenue: number;
}

export function useSubscriptionManagement() {
  const { toast } = useToast();
  const [vendors, setVendors] = useState<VendorSubscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats>({
    totalVendors: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    basicPlan: 0,
    proPlan: 0,
    enterprisePlan: 0,
    monthlyRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('id, company_name, company_name_ar, subscription_plan, subscription_expires_at, is_active, kyc_status, user_id')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const vendorData = data || [];
      setVendors(vendorData);

      // Calculate stats
      const now = new Date();
      const active = vendorData.filter(v => 
        v.subscription_expires_at && new Date(v.subscription_expires_at) > now
      );
      const expired = vendorData.filter(v => 
        v.subscription_expires_at && new Date(v.subscription_expires_at) <= now
      );

      const planPrices: Record<string, number> = {
        basic: 0,
        pro: 499,
        enterprise: 1499,
      };

      setStats({
        totalVendors: vendorData.length,
        activeSubscriptions: active.length,
        expiredSubscriptions: expired.length,
        basicPlan: vendorData.filter(v => v.subscription_plan === 'basic').length,
        proPlan: vendorData.filter(v => v.subscription_plan === 'pro').length,
        enterprisePlan: vendorData.filter(v => v.subscription_plan === 'enterprise').length,
        monthlyRevenue: active.reduce((sum, v) => sum + (planPrices[v.subscription_plan || 'basic'] || 0), 0),
      });
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subscription data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscription = async (vendorId: string, plan: string, months: number = 1) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          subscription_plan: plan,
          subscription_expires_at: addMonths(new Date(), months).toISOString(),
        })
        .eq('id', vendorId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Subscription updated successfully',
      });

      await fetchVendors();
      return true;
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to update subscription',
        variant: 'destructive',
      });
      return false;
    }
  };

  const extendSubscription = async (vendorId: string, months: number) => {
    try {
      const vendor = vendors.find(v => v.id === vendorId);
      if (!vendor) return false;

      const currentExpiry = vendor.subscription_expires_at 
        ? new Date(vendor.subscription_expires_at) 
        : new Date();
      const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();

      const { error } = await supabase
        .from('vendors')
        .update({
          subscription_expires_at: addMonths(baseDate, months).toISOString(),
        })
        .eq('id', vendorId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Subscription extended by ${months} month(s)`,
      });

      await fetchVendors();
      return true;
    } catch (error) {
      console.error('Error extending subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to extend subscription',
        variant: 'destructive',
      });
      return false;
    }
  };

  const cancelSubscription = async (vendorId: string) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          subscription_plan: 'basic',
          subscription_expires_at: null,
        })
        .eq('id', vendorId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Subscription cancelled',
      });

      await fetchVendors();
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  return {
    vendors,
    stats,
    isLoading,
    updateSubscription,
    extendSubscription,
    cancelSubscription,
    refetch: fetchVendors,
  };
}
