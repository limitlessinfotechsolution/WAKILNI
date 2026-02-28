
-- Fix user_roles: Drop restrictive SELECT policies and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Fix profiles: Drop restrictive SELECT policies and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Users can view profiles of booking participants" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view profiles of booking participants"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM bookings b
    JOIN providers p ON p.id = b.provider_id
    WHERE (p.user_id = auth.uid() AND b.traveler_id = profiles.user_id)
       OR (b.traveler_id = auth.uid() AND p.user_id = profiles.user_id)
  )
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);
