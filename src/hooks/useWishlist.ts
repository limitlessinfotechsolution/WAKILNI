import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export function useWishlist() {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) { setWishlistIds([]); return; }
    setIsLoading(true);
    const { data } = await supabase
      .from('wishlists')
      .select('service_id')
      .eq('user_id', user.id);
    setWishlistIds(data?.map(w => w.service_id) || []);
    setIsLoading(false);
  }, [user]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const toggleWishlist = useCallback(async (serviceId: string) => {
    if (!user) return;
    if (wishlistIds.includes(serviceId)) {
      setWishlistIds(prev => prev.filter(id => id !== serviceId));
      await supabase.from('wishlists').delete().eq('user_id', user.id).eq('service_id', serviceId);
    } else {
      setWishlistIds(prev => [...prev, serviceId]);
      await supabase.from('wishlists').insert({ user_id: user.id, service_id: serviceId });
    }
  }, [user, wishlistIds]);

  const isWishlisted = useCallback((serviceId: string) => wishlistIds.includes(serviceId), [wishlistIds]);

  return { wishlistIds, isLoading, toggleWishlist, isWishlisted, refetch: fetchWishlist };
}
