import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Provider = Tables<'providers'>;

interface PublicProviderData extends Provider {
  services: Array<{
    id: string;
    title: string;
    title_ar: string | null;
    description: string | null;
    description_ar: string | null;
    service_type: string;
    price: number;
    currency: string | null;
    duration_days: number | null;
    includes: unknown;
    is_active: boolean;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    comment_ar: string | null;
    created_at: string;
    reviewer_profile?: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  }>;
}

export function usePublicProvider(providerId: string | undefined) {
  const [provider, setProvider] = useState<PublicProviderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProvider = async () => {
      if (!providerId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch provider data
        const { data: providerData, error: providerError } = await supabase
          .from('providers')
          .select('*')
          .eq('id', providerId)
          .eq('kyc_status', 'approved')
          .eq('is_active', true)
          .single();

        if (providerError) {
          if (providerError.code === 'PGRST116') {
            setError('Provider not found');
          } else {
            throw providerError;
          }
          setIsLoading(false);
          return;
        }

        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('provider_id', providerId)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (servicesError) throw servicesError;

        // Fetch reviews with reviewer info
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            id,
            rating,
            comment,
            comment_ar,
            created_at,
            reviewer_id
          `)
          .eq('provider_id', providerId)
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;

        // Fetch reviewer profiles separately
        const reviewerIds = reviewsData?.map(r => r.reviewer_id).filter(Boolean) || [];
        let reviewerProfiles: Record<string, { full_name: string | null; avatar_url: string | null }> = {};

        if (reviewerIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('user_id, full_name, avatar_url')
            .in('user_id', reviewerIds);

          if (profilesData) {
            reviewerProfiles = profilesData.reduce((acc, p) => {
              acc[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url };
              return acc;
            }, {} as Record<string, { full_name: string | null; avatar_url: string | null }>);
          }
        }

        const reviewsWithProfiles = reviewsData?.map(review => ({
          ...review,
          reviewer_profile: review.reviewer_id ? reviewerProfiles[review.reviewer_id] : null,
        })) || [];

        setProvider({
          ...providerData,
          services: servicesData || [],
          reviews: reviewsWithProfiles,
        });
      } catch (err) {
        console.error('Error fetching provider:', err);
        setError('Failed to load provider');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProvider();
  }, [providerId]);

  return {
    provider,
    isLoading,
    error,
  };
}
