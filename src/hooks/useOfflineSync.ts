import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  table_name: string;
  record_id?: string;
  payload: Record<string, unknown>;
  synced: boolean;
  created_at: string;
}

const STORAGE_KEY = 'wakilni_offline_queue';

export function useOfflineSync() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Get local queue
  const getLocalQueue = useCallback((): SyncQueueItem[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // Save to local queue
  const saveLocalQueue = useCallback((queue: SyncQueueItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    setPendingCount(queue.filter(item => !item.synced).length);
  }, []);

  // Add to sync queue (for offline operations)
  const addToQueue = useCallback((
    operation: 'create' | 'update' | 'delete',
    tableName: string,
    payload: Record<string, unknown>,
    recordId?: string
  ) => {
    const queue = getLocalQueue();
    const newItem: SyncQueueItem = {
      id: crypto.randomUUID(),
      operation,
      table_name: tableName,
      record_id: recordId,
      payload,
      synced: false,
      created_at: new Date().toISOString(),
    };
    
    queue.push(newItem);
    saveLocalQueue(queue);
    
    return newItem.id;
  }, [getLocalQueue, saveLocalQueue]);

  // Process single sync item
  const processSyncItem = async (item: SyncQueueItem): Promise<boolean> => {
    try {
      switch (item.operation) {
        case 'create':
          const { error: createError } = await supabase
            .from(item.table_name as 'bookings')
            .insert(item.payload);
          if (createError) throw createError;
          break;
          
        case 'update':
          if (!item.record_id) return false;
          const { error: updateError } = await supabase
            .from(item.table_name as 'bookings')
            .update(item.payload)
            .eq('id', item.record_id);
          if (updateError) throw updateError;
          break;
          
        case 'delete':
          if (!item.record_id) return false;
          const { error: deleteError } = await supabase
            .from(item.table_name as 'bookings')
            .delete()
            .eq('id', item.record_id);
          if (deleteError) throw deleteError;
          break;
      }
      
      return true;
    } catch (error) {
      console.error('Sync item failed:', error);
      return false;
    }
  };

  // Sync all pending items
  const syncAll = useCallback(async () => {
    if (!isOnline || isSyncing || !user) return;

    setIsSyncing(true);
    const queue = getLocalQueue();
    const pending = queue.filter(item => !item.synced);
    
    if (pending.length === 0) {
      setIsSyncing(false);
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const item of pending) {
      const success = await processSyncItem(item);
      if (success) {
        item.synced = true;
        successCount++;
        
        // Also save to database sync log
        await supabase.from('offline_sync_queue').insert([{
          user_id: user.id,
          operation: item.operation,
          table_name: item.table_name,
          record_id: item.record_id,
          payload: JSON.parse(JSON.stringify(item.payload)),
          synced: true,
          synced_at: new Date().toISOString(),
        }]);
      } else {
        failCount++;
      }
    }

    // Remove synced items from local storage
    const updatedQueue = queue.filter(item => !item.synced);
    saveLocalQueue(updatedQueue);
    
    setLastSyncTime(new Date());
    setIsSyncing(false);

    if (successCount > 0 || failCount > 0) {
      toast({
        title: 'Sync Complete',
        description: `${successCount} items synced${failCount > 0 ? `, ${failCount} failed` : ''}`,
        variant: failCount > 0 ? 'destructive' : 'default',
      });
    }
  }, [isOnline, isSyncing, user, getLocalQueue, saveLocalQueue, toast]);

  // Clear synced items
  const clearSynced = useCallback(() => {
    const queue = getLocalQueue();
    const pending = queue.filter(item => !item.synced);
    saveLocalQueue(pending);
  }, [getLocalQueue, saveLocalQueue]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: 'Back Online',
        description: 'Syncing pending changes...',
      });
      syncAll();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: 'Offline Mode',
        description: 'Changes will be synced when back online',
        variant: 'destructive',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register for background sync if supported
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        // Register a sync event for bookings
        (registration as any).sync?.register('sync-bookings').catch((err: Error) => {
          console.log('Background sync registration failed:', err);
        });
      });
    }

    // Initial sync check
    if (isOnline && user) {
      syncAll();
    }

    // Update pending count on mount
    const queue = getLocalQueue();
    setPendingCount(queue.filter(item => !item.synced).length);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  // Auto sync when online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      const timer = setTimeout(syncAll, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, pendingCount]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncTime,
    addToQueue,
    syncAll,
    clearSynced,
  };
}
