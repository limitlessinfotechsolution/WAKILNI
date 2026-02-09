import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logAuditAction } from '@/hooks/useAuditLogger';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  fullNameAr?: string;
  phone?: string;
  role: AppRole;
}

export function useCreateUser() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const createUser = async (userData: CreateUserData): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Call the edge function instead of signUp to avoid logging out the admin
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('create-user-admin', {
        body: {
          email: userData.email,
          password: userData.password,
          fullName: userData.fullName,
          fullNameAr: userData.fullNameAr,
          phone: userData.phone,
          role: userData.role,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create user');
      }

      const result = response.data;
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to create user');
      }

      // Log audit action
      await logAuditAction({
        action: userData.role === 'admin' || userData.role === 'super_admin' ? 'admin_created' : 'user_created',
        entityType: 'user',
        entityId: result.user?.id,
        newValues: { 
          email: userData.email, 
          full_name: userData.fullName,
          role: userData.role 
        },
        metadata: { 
          created_role: userData.role,
          has_phone: !!userData.phone,
          has_arabic_name: !!userData.fullNameAr
        }
      });

      toast({
        title: 'Success',
        description: `User ${userData.fullName} created successfully with role: ${userData.role}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create user',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createUser,
    isLoading,
  };
}
