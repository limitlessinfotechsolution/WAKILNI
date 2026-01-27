import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_role: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Json | null;
  new_values: Json | null;
  metadata: Json | null;
  created_at: string;
}

interface UseAuditLogsOptions {
  entityType?: string;
  entityId?: string;
  actorId?: string;
  limit?: number;
}

export function useAuditLogs(options: UseAuditLogsOptions = {}) {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(options.limit || 100);

      if (options.entityType) {
        query = query.eq('entity_type', options.entityType);
      }
      if (options.entityId) {
        query = query.eq('entity_id', options.entityId);
      }
      if (options.actorId) {
        query = query.eq('actor_id', options.actorId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs((data || []) as AuditLog[]);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch audit logs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logAction = async (
    action: string,
    entityType: string,
    entityId?: string,
    oldValues?: Json,
    newValues?: Json,
    metadata?: Json
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id || '')
        .maybeSingle();

      const { error } = await supabase.from('audit_logs').insert([{
        actor_id: user?.id || null,
        actor_role: roleData?.role || null,
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        old_values: oldValues || null,
        new_values: newValues || null,
        metadata: metadata || {},
      }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error logging action:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [options.entityType, options.entityId, options.actorId]);

  return {
    logs,
    isLoading,
    logAction,
    refetch: fetchLogs,
  };
}
