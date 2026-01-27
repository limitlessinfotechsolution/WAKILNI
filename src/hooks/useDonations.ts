import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Donation {
  id: string;
  donor_id: string | null;
  donor_name: string | null;
  donor_email: string | null;
  amount: number;
  currency: string | null;
  payment_method: string | null;
  payment_status: string | null;
  is_anonymous: boolean | null;
  message: string | null;
  allocated_amount: number | null;
  remaining_amount: number | null;
  created_at: string;
}

interface CharityRequest {
  id: string;
  beneficiary_id: string | null;
  requester_id: string | null;
  service_type: string;
  requested_amount: number;
  approved_amount: number | null;
  status: string | null;
  priority: number | null;
  reason: string | null;
  reason_ar: string | null;
  notes: string | null;
  created_at: string;
  beneficiary?: {
    full_name: string;
    full_name_ar: string | null;
  } | null;
}

export function useDonations() {
  const { toast } = useToast();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [charityRequests, setCharityRequests] = useState<CharityRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalDonated, setTotalDonated] = useState(0);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [availableFunds, setAvailableFunds] = useState(0);

  const fetchDonations = async () => {
    try {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('payment_status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations(data || []);

      const total = data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
      const allocated = data?.reduce((sum, d) => sum + (d.allocated_amount || 0), 0) || 0;
      setTotalDonated(total);
      setTotalAllocated(allocated);
      setAvailableFunds(total - allocated);
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  const fetchCharityRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('charity_requests')
        .select(`
          *,
          beneficiary:beneficiaries(full_name, full_name_ar)
        `)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData = (data || []).map(item => ({
        ...item,
        beneficiary: Array.isArray(item.beneficiary) ? item.beneficiary[0] : item.beneficiary
      }));
      
      setCharityRequests(transformedData as CharityRequest[]);
    } catch (error) {
      console.error('Error fetching charity requests:', error);
    }
  };

  const approveRequest = async (requestId: string, approvedAmount: number) => {
    try {
      const { error } = await supabase
        .from('charity_requests')
        .update({
          status: 'approved',
          approved_amount: approvedAmount,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Charity request approved',
      });

      await fetchCharityRequests();
      return true;
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve request',
        variant: 'destructive',
      });
      return false;
    }
  };

  const rejectRequest = async (requestId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('charity_requests')
        .update({
          status: 'rejected',
          notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Charity request rejected',
      });

      await fetchCharityRequests();
      return true;
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject request',
        variant: 'destructive',
      });
      return false;
    }
  };

  const allocateFunds = async (requestId: string, donationId: string, amount: number) => {
    try {
      // Create allocation record
      const { error: allocError } = await supabase
        .from('donation_allocations')
        .insert({
          donation_id: donationId,
          charity_request_id: requestId,
          amount,
        });

      if (allocError) throw allocError;

      // Update donation allocated amount
      const { data: donation } = await supabase
        .from('donations')
        .select('allocated_amount')
        .eq('id', donationId)
        .single();

      await supabase
        .from('donations')
        .update({
          allocated_amount: (donation?.allocated_amount || 0) + amount,
        })
        .eq('id', donationId);

      // Update charity request status
      await supabase
        .from('charity_requests')
        .update({ status: 'funded' })
        .eq('id', requestId);

      toast({
        title: 'Success',
        description: 'Funds allocated successfully',
      });

      await Promise.all([fetchDonations(), fetchCharityRequests()]);
      return true;
    } catch (error) {
      console.error('Error allocating funds:', error);
      toast({
        title: 'Error',
        description: 'Failed to allocate funds',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchDonations(), fetchCharityRequests()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  return {
    donations,
    charityRequests,
    isLoading,
    totalDonated,
    totalAllocated,
    availableFunds,
    approveRequest,
    rejectRequest,
    allocateFunds,
    refetch: async () => {
      await Promise.all([fetchDonations(), fetchCharityRequests()]);
    },
  };
}
