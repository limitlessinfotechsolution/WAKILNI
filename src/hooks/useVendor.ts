import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface Vendor {
  id: string;
  user_id: string;
  company_name: string;
  company_name_ar: string | null;
  address: string | null;
  address_ar: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  logo_url: string | null;
  commercial_registration: string | null;
  tax_number: string | null;
  is_saudi_registered: boolean | null;
  subscription_plan: string | null;
  subscription_expires_at: string | null;
  kyc_status: string | null;
  kyc_submitted_at: string | null;
  kyc_reviewed_at: string | null;
  kyc_notes: string | null;
  is_active: boolean | null;
  is_suspended: boolean | null;
  suspension_reason: string | null;
  rating: number | null;
  total_bookings: number | null;
  created_at: string;
}

interface VendorBooking {
  id: string;
  status: string | null;
  scheduled_date: string | null;
  total_amount: number | null;
  created_at: string;
  service?: {
    title: string;
    title_ar: string | null;
    service_type: string;
  } | null;
  beneficiary?: {
    full_name: string;
    full_name_ar: string | null;
  } | null;
}

interface VendorService {
  id: string;
  title: string;
  title_ar: string | null;
  service_type: string;
  price: number;
  currency: string | null;
  is_active: boolean | null;
  duration_days: number | null;
}

export function useVendor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [services, setServices] = useState<VendorService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
  });

  const fetchVendor = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setVendor(data);
    } catch (error) {
      console.error('Error fetching vendor:', error);
    }
  };

  const fetchBookings = async () => {
    if (!vendor) return;
    
    try {
      const { data, error } = await supabase
        .from('service_allocations')
        .select(`
          id,
          status,
          created_at,
          booking:bookings(
            id,
            status,
            scheduled_date,
            total_amount,
            created_at,
            service:services(title, title_ar, service_type),
            beneficiary:beneficiaries(full_name, full_name_ar)
          )
        `)
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const transformedBookings = (data || []).map(alloc => {
        const booking = Array.isArray(alloc.booking) ? alloc.booking[0] : alloc.booking;
        return {
          id: booking?.id || alloc.id,
          status: booking?.status || alloc.status,
          scheduled_date: booking?.scheduled_date,
          total_amount: booking?.total_amount,
          created_at: booking?.created_at || alloc.created_at,
          service: Array.isArray(booking?.service) ? booking.service[0] : booking?.service,
          beneficiary: Array.isArray(booking?.beneficiary) ? booking.beneficiary[0] : booking?.beneficiary,
        };
      }).filter(b => b.id);

      setBookings(transformedBookings);
      
      // Calculate stats
      const pending = transformedBookings.filter(b => b.status === 'pending' || b.status === 'accepted').length;
      const completed = transformedBookings.filter(b => b.status === 'completed').length;
      const revenue = transformedBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0);

      setStats({
        totalBookings: transformedBookings.length,
        pendingBookings: pending,
        completedBookings: completed,
        totalRevenue: revenue,
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchServices = async () => {
    if (!vendor) return;
    
    try {
      // Vendors manage providers, fetch their providers' services
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .limit(50);

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const updateVendor = async (updates: Partial<Omit<Vendor, 'kyc_status'>> & { kyc_status?: 'pending' | 'under_review' | 'approved' | 'rejected' }) => {
    if (!vendor) return false;
    
    try {
      const { error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', vendor.id);

      if (error) throw error;
      
      setVendor({ ...vendor, ...updates } as Vendor);
      toast({
        title: 'Success',
        description: 'Vendor profile updated',
      });
      return true;
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
      return false;
    }
  };

  const createVendor = async (data: { company_name: string; company_name_ar?: string; contact_email?: string; contact_phone?: string; address?: string }) => {
    if (!user) return false;
    
    try {
      const { data: newVendor, error } = await supabase
        .from('vendors')
        .insert({
          user_id: user.id,
          company_name: data.company_name,
          company_name_ar: data.company_name_ar || null,
          contact_email: data.contact_email || null,
          contact_phone: data.contact_phone || null,
          address: data.address || null,
        })
        .select()
        .single();

      if (error) throw error;
      
      setVendor(newVendor);
      toast({
        title: 'Success',
        description: 'Vendor profile created',
      });
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

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchVendor();
      setIsLoading(false);
    };
    
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (vendor) {
      Promise.all([fetchBookings(), fetchServices()]);
    }
  }, [vendor]);

  return {
    vendor,
    bookings,
    services,
    stats,
    isLoading,
    updateVendor,
    createVendor,
    refetch: async () => {
      await fetchVendor();
      if (vendor) {
        await Promise.all([fetchBookings(), fetchServices()]);
      }
    },
  };
}
