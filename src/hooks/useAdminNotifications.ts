import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface AdminNotification {
  id: string;
  type: 'kyc_submission' | 'new_booking' | 'donation' | 'dispute' | 'system';
  title: string;
  message: string;
  entityId?: string;
  entityType?: string;
  isRead: boolean;
  createdAt: Date;
}

export function useAdminNotifications() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const isAdmin = role === 'admin' || role === 'super_admin';

  const addNotification = useCallback((notification: Omit<AdminNotification, 'id' | 'isRead' | 'createdAt'>) => {
    const newNotification: AdminNotification = {
      ...notification,
      id: crypto.randomUUID(),
      isRead: false,
      createdAt: new Date(),
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
    setUnreadCount(prev => prev + 1);

    // Show toast for new notifications
    toast({
      title: notification.title,
      description: notification.message,
    });
  }, [toast]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (!user || !isAdmin) return;

    // Subscribe to KYC submissions (providers)
    const providerChannel = supabase
      .channel('admin-provider-kyc')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'providers',
          filter: 'kyc_status=eq.under_review',
        },
        (payload) => {
          if (payload.new.kyc_status === 'under_review' && payload.old.kyc_status !== 'under_review') {
            addNotification({
              type: 'kyc_submission',
              title: 'New Provider KYC Submission',
              message: `${payload.new.company_name || 'A provider'} has submitted KYC documents for review`,
              entityId: payload.new.id,
              entityType: 'provider',
            });
          }
        }
      )
      .subscribe();

    // Subscribe to KYC submissions (vendors)
    const vendorChannel = supabase
      .channel('admin-vendor-kyc')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vendors',
          filter: 'kyc_status=eq.under_review',
        },
        (payload) => {
          if (payload.new.kyc_status === 'under_review' && payload.old.kyc_status !== 'under_review') {
            addNotification({
              type: 'kyc_submission',
              title: 'New Vendor KYC Submission',
              message: `${payload.new.company_name || 'A vendor'} has submitted KYC documents for review`,
              entityId: payload.new.id,
              entityType: 'vendor',
            });
          }
        }
      )
      .subscribe();

    // Subscribe to new bookings
    const bookingChannel = supabase
      .channel('admin-bookings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          addNotification({
            type: 'new_booking',
            title: 'New Booking Created',
            message: `A new booking has been created for ${payload.new.service_id ? 'a service' : 'review'}`,
            entityId: payload.new.id,
            entityType: 'booking',
          });
        }
      )
      .subscribe();

    // Subscribe to new donations
    const donationChannel = supabase
      .channel('admin-donations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'donations',
        },
        (payload) => {
          if (payload.new.payment_status === 'completed') {
            addNotification({
              type: 'donation',
              title: 'New Donation Received',
              message: `A donation of SAR ${payload.new.amount} has been received`,
              entityId: payload.new.id,
              entityType: 'donation',
            });
          }
        }
      )
      .subscribe();

    // Subscribe to disputed bookings
    const disputeChannel = supabase
      .channel('admin-disputes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: 'status=eq.disputed',
        },
        (payload) => {
          if (payload.new.status === 'disputed' && payload.old.status !== 'disputed') {
            addNotification({
              type: 'dispute',
              title: 'Booking Disputed',
              message: 'A booking has been marked as disputed and requires attention',
              entityId: payload.new.id,
              entityType: 'booking',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(providerChannel);
      supabase.removeChannel(vendorChannel);
      supabase.removeChannel(bookingChannel);
      supabase.removeChannel(donationChannel);
      supabase.removeChannel(disputeChannel);
    };
  }, [user, isAdmin, addNotification]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    isAdmin,
  };
}
