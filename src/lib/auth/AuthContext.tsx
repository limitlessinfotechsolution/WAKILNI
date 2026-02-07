import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'super_admin' | 'traveler' | 'provider' | 'vendor';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  full_name_ar: string | null;
  phone: string | null;
  phone_verified: boolean;
  avatar_url: string | null;
  preferred_language: 'en' | 'ar';
  display_id: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string, role: AppRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin' || role === 'super_admin';

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return;
      }

      setProfile(profileData as Profile | null);

      // Fetch role - prioritize super_admin > admin > others
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('role');

      if (roleError) {
        console.error('Error fetching role:', roleError);
        return;
      }

      // Determine highest priority role
      if (roleData && roleData.length > 0) {
        const roles = roleData.map(r => r.role);
        if (roles.includes('super_admin')) {
          setRole('super_admin');
        } else if (roles.includes('admin')) {
          setRole('admin');
        } else if (roles.includes('vendor')) {
          setRole('vendor');
        } else if (roles.includes('provider')) {
          setRole('provider');
        } else {
          setRole('traveler');
        }
      } else {
        setRole('traveler');
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const loginTrackedRef = useRef(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Use setTimeout to avoid potential deadlock
          setTimeout(() => fetchProfile(currentSession.user.id), 0);
          
          // Track login on SIGNED_IN event
          if (event === 'SIGNED_IN' && !loginTrackedRef.current) {
            loginTrackedRef.current = true;
            setTimeout(async () => {
              try {
                const ua = navigator.userAgent;
                let browser = 'Unknown', os = 'Unknown', deviceType = 'desktop';
                if (ua.includes('Firefox/')) browser = 'Firefox';
                else if (ua.includes('Edg/')) browser = 'Edge';
                else if (ua.includes('Chrome/')) browser = 'Chrome';
                else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
                if (ua.includes('Windows')) os = 'Windows';
                else if (ua.includes('Mac OS')) os = 'macOS';
                else if (ua.includes('Android')) os = 'Android';
                else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
                else if (ua.includes('Linux')) os = 'Linux';
                if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) deviceType = 'mobile';
                else if (ua.includes('iPad') || ua.includes('Tablet')) deviceType = 'tablet';
                
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const city = tz.split('/').pop()?.replace(/_/g, ' ') || '';

                await supabase.from('user_sessions').insert({
                  user_id: currentSession.user.id,
                  user_agent: ua,
                  device_type: deviceType,
                  browser,
                  os,
                  city,
                  is_current: true,
                });

                await supabase.from('profiles').update({
                  last_login_at: new Date().toISOString(),
                  last_login_device: `${browser} on ${os}`,
                  last_login_location: city,
                }).eq('user_id', currentSession.user.id);
              } catch (e) {
                console.error('Login tracking error:', e);
              }
            }, 100);
          }
        } else {
          loginTrackedRef.current = false;
          setProfile(null);
          setRole(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        fetchProfile(existingSession.user.id);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, selectedRole: AppRole) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: fullName,
            role: selectedRole,
          },
        },
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        isLoading,
        isSuperAdmin,
        isAdmin,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
