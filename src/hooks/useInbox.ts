import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface Conversation {
  booking_id: string | null;
  other_user_id: string;
  other_user_name: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export function useInbox() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [activeMessages, setActiveMessages] = useState<any[]>([]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Get all messages where user is sender or recipient
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by booking_id + other_user_id
      const convMap = new Map<string, Conversation>();
      for (const msg of messages || []) {
        const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        const key = `${msg.booking_id || 'none'}_${otherId}`;
        if (!convMap.has(key)) {
          convMap.set(key, {
            booking_id: msg.booking_id,
            other_user_id: otherId,
            other_user_name: null,
            last_message: msg.content,
            last_message_at: msg.created_at,
            unread_count: 0,
          });
        }
        const conv = convMap.get(key)!;
        if (msg.recipient_id === user.id && !msg.is_read) {
          conv.unread_count++;
        }
      }

      const convList = Array.from(convMap.values());

      // Fetch profile names for other users
      const otherIds = [...new Set(convList.map(c => c.other_user_id))];
      if (otherIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, full_name_ar')
          .in('user_id', otherIds);
        
        const nameMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
        convList.forEach(c => {
          c.other_user_name = nameMap.get(c.other_user_id) || 'Unknown';
        });
      }

      // Sort by last message time
      convList.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
      setConversations(convList);
    } catch (error) {
      console.error('Error fetching inbox:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchMessages = useCallback(async (conv: Conversation) => {
    if (!user) return;
    setActiveConversation(conv);

    const query = supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: true });

    if (conv.booking_id) {
      query.eq('booking_id', conv.booking_id);
    }

    const { data } = await query;
    // Filter to only messages between these two users
    const filtered = (data || []).filter(m =>
      (m.sender_id === user.id && m.recipient_id === conv.other_user_id) ||
      (m.sender_id === conv.other_user_id && m.recipient_id === user.id)
    );
    setActiveMessages(filtered);

    // Mark unread as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('recipient_id', user.id)
      .eq('sender_id', conv.other_user_id)
      .eq('is_read', false);
  }, [user]);

  const sendMessage = useCallback(async (content: string, recipientId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content,
        booking_id: activeConversation?.booking_id || null,
      });
      if (error) throw error;
      if (activeConversation) await fetchMessages(activeConversation);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, [user, activeConversation, fetchMessages]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('inbox-messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
      }, () => {
        fetchConversations();
        if (activeConversation) fetchMessages(activeConversation);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchConversations, activeConversation, fetchMessages]);

  return {
    conversations,
    isLoading,
    activeConversation,
    activeMessages,
    setActiveConversation: fetchMessages,
    sendMessage,
    markAsRead: () => {},
    refetch: fetchConversations,
    totalUnread: conversations.reduce((sum, c) => sum + c.unread_count, 0),
  };
}
