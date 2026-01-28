import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            full_name_ar: userData.fullNameAr,
            role: userData.role,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('User creation failed');
      }

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
