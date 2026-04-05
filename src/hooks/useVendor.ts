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
  provider_id: string | null;
  service?: {
    title: string;
    title_ar: string | null;
    service_type: string;
  } | null;
  beneficiary?: {
    full_name: string;
    full_name_ar: string | null;
  } | null;
  provider?: {
    id: string;
    company_name: string | null;
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

interface VendorProvider {
  id: string;
  provider_id: string;
  company_name: string | null;
  company_name_ar: string | null;
  rating: number | null;
  is_active: boolean | null;
}

export function useVendor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [services, setServices] = useState<VendorService[]>([]);
  const [vendorProviders, setVendorProviders] = useState<VendorProvider[]>([]);
  const [allProviders, setAllProviders] = useState<{ id: string; company_name: string | null; rating: number | null }[]>([]);
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
      // Query bookings directly by vendor_id
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(title, title_ar, service_type),
          beneficiary:beneficiaries(full_name, full_name_ar),
          provider:providers(id, company_name)
        `)
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const transformedBookings = (data || []).map(b => ({
        ...b,
        service: Array.isArray(b.service) ? b.service[0] : b.service,
        beneficiary: Array.isArray(b.beneficiary) ? b.beneficiary[0] : b.beneficiary,
        provider: Array.isArray(b.provider) ? b.provider[0] : b.provider,
      }));

      setBookings(transformedBookings);

      const pending = transformedBookings.filter(b => 
        b.status === 'assigned_to_vendor' || b.status === 'pending'
      ).length;
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
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('vendor_id', vendor.id)
        .limit(50);
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchVendorProviders = async () => {
    if (!vendor) return;
    try {
      const { data, error } = await supabase
        .from('vendor_providers')
        .select('id, provider_id')
        .eq('vendor_id', vendor.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const providerIds = data.map(vp => vp.provider_id);
        const { data: providers } = await supabase
          .from('providers')
          .select('id, company_name, company_name_ar, rating, is_active')
          .in('id', providerIds);

        const linked = data.map(vp => {
          const p = providers?.find(pr => pr.id === vp.provider_id);
          return {
            id: vp.id,
            provider_id: vp.provider_id,
            company_name: p?.company_name || null,
            company_name_ar: p?.company_name_ar || null,
            rating: p?.rating || null,
            is_active: p?.is_active || null,
          };
        });
        setVendorProviders(linked);
      } else {
        setVendorProviders([]);
      }
    } catch (error) {
      console.error('Error fetching vendor providers:', error);
    }
  };

  const fetchAllProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('id, company_name, rating')
        .eq('kyc_status', 'approved')
        .eq('is_active', true)
        .eq('is_suspended', false);
      if (error) throw error;
      setAllProviders(data || []);
    } catch (error) {
      console.error('Error fetching all providers:', error);
    }
  };

  const assignToProvider = async (bookingId: string, providerId: string) => {
    if (!vendor) return false;
    try {
      // Validate provider belongs to vendor
      const isLinked = vendorProviders.some(vp => vp.provider_id === providerId);
      if (!isLinked) {
        toast({ title: 'Error', description: 'Provider is not linked to your organization', variant: 'destructive' });
        return false;
      }

      const { error } = await supabase
        .from('bookings')
        .update({ provider_id: providerId, status: 'assigned_to_provider' as any })
        .eq('id', bookingId)
        .eq('vendor_id', vendor.id);

      if (error) throw error;

      // Log activity
      await supabase.from('booking_activities').insert({
        booking_id: bookingId,
        actor_id: user?.id,
        action: 'vendor_assigned_to_provider',
        details: { provider_id: providerId, vendor_id: vendor.id },
      });

      // Notify provider
      const { data: provider } = await supabase
        .from('providers')
        .select('user_id')
        .eq('id', providerId)
        .single();

      if (provider) {
        await supabase.from('notification_queue').insert({
          user_id: provider.user_id,
          notification_type: 'booking_assigned_to_provider',
          title: 'New Job Assigned',
          body: 'A new job has been assigned to you by your vendor',
          payload: { booking_id: bookingId },
        });
      }

      toast({ title: 'Success', description: 'Booking assigned to provider' });
      await fetchBookings();
      return true;
    } catch (error) {
      console.error('Error assigning to provider:', error);
      toast({ title: 'Error', description: 'Failed to assign booking', variant: 'destructive' });
      return false;
    }
  };

  const linkProvider = async (providerId: string) => {
    if (!vendor) return false;
    try {
      const { error } = await supabase
        .from('vendor_providers')
        .insert({ vendor_id: vendor.id, provider_id: providerId });
      if (error) throw error;
      toast({ title: 'Success', description: 'Provider linked successfully' });
      await fetchVendorProviders();
      return true;
    } catch (error) {
      console.error('Error linking provider:', error);
      toast({ title: 'Error', description: 'Failed to link provider', variant: 'destructive' });
      return false;
    }
  };

  const unlinkProvider = async (vendorProviderId: string) => {
    if (!vendor) return false;
    try {
      const { error } = await supabase
        .from('vendor_providers')
        .delete()
        .eq('id', vendorProviderId);
      if (error) throw error;
      toast({ title: 'Success', description: 'Provider unlinked' });
      await fetchVendorProviders();
      return true;
    } catch (error) {
      console.error('Error unlinking provider:', error);
      toast({ title: 'Error', description: 'Failed to unlink provider', variant: 'destructive' });
      return false;
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
      toast({ title: 'Success', description: 'Vendor profile updated' });
      return true;
    } catch (error) {
      console.error('Error updating vendor:', error);
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' });
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
      toast({ title: 'Success', description: 'Vendor profile created' });
      return true;
    } catch (error) {
      console.error('Error creating vendor:', error);
      toast({ title: 'Error', description: 'Failed to create vendor profile', variant: 'destructive' });
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchVendor();
      setIsLoading(false);
    };
    if (user) loadData();
  }, [user]);

  useEffect(() => {
    if (vendor) {
      Promise.all([fetchBookings(), fetchServices(), fetchVendorProviders(), fetchAllProviders()]);

      // Realtime for vendor bookings
      const channel = supabase
        .channel(`vendor-bookings-${vendor.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `vendor_id=eq.${vendor.id}` }, () => fetchBookings())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'services', filter: `vendor_id=eq.${vendor.id}` }, () => fetchServices())
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [vendor]);

  return {
    vendor,
    bookings,
    services,
    stats,
    isLoading,
    vendorProviders,
    allProviders,
    updateVendor,
    createVendor,
    assignToProvider,
    linkProvider,
    unlinkProvider,
    refetch: async () => {
      await fetchVendor();
      if (vendor) {
        await Promise.all([fetchBookings(), fetchServices(), fetchVendorProviders()]);
      }
    },
  };
}
