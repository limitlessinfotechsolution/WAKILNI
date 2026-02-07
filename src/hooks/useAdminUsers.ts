import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logAuditAction } from '@/hooks/useAuditLogger';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  profile?: {
    full_name: string | null;
    full_name_ar: string | null;
    phone: string | null;
    avatar_url: string | null;
    display_id: string | null;
  } | null;
}

type RoleFilter = 'all' | AppRole;

export function useAdminUsers(roleFilter: RoleFilter = 'all') {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('user_roles')
        .select(`
          *,
          profile:profiles!inner(
            full_name,
            full_name_ar,
            phone,
            avatar_url,
            display_id
          )
        `)
        .order('created_at', { ascending: false });

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const transformedData = (data || []).map(item => ({
        ...item,
        profile: Array.isArray(item.profile) ? item.profile[0] : item.profile
      }));
      
      setUsers(transformedData as UserWithRole[]);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: AppRole, userName?: string) => {
    try {
      // Get current role for audit
      const currentUser = users.find(u => u.user_id === userId);
      const oldRole = currentUser?.role;

      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      // Log audit action
      await logAuditAction({
        action: 'role_changed',
        entityType: 'user',
        entityId: userId,
        oldValues: { role: oldRole, user_name: userName || currentUser?.profile?.full_name },
        newValues: { role: newRole },
        metadata: { changed_from: oldRole, changed_to: newRole }
      });

      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });

      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteUser = async (userId: string, userName?: string) => {
    try {
      const currentUser = users.find(u => u.user_id === userId);

      // Note: This only removes the role, actual user deletion requires admin API
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      // Log audit action
      await logAuditAction({
        action: 'user_deleted',
        entityType: 'user',
        entityId: userId,
        oldValues: { 
          role: currentUser?.role, 
          user_name: userName || currentUser?.profile?.full_name 
        },
        metadata: { deleted_role: currentUser?.role }
      });

      toast({
        title: 'Success',
        description: 'User removed successfully',
      });

      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  return {
    users,
    isLoading,
    updateUserRole,
    deleteUser,
    refetch: fetchUsers,
  };
}
