-- Fix Critical Privilege Escalation Vulnerability
-- Prevent users from self-assigning admin/super_admin roles during signup

-- 1. Replace the handle_new_user() trigger to block privileged role self-assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  requested_role app_role;
BEGIN
  -- Get the requested role from metadata, default to 'traveler'
  requested_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'traveler');
  
  -- CRITICAL SECURITY: Block self-assignment of privileged roles
  -- Only allow traveler, provider, vendor during self-registration
  IF requested_role IN ('admin', 'super_admin') THEN
    requested_role := 'traveler';
  END IF;
  
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Assign validated role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, requested_role);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Add RLS policy to prevent privileged role self-assignment via direct INSERT
-- (Defense in depth - even if someone bypasses the trigger)
DROP POLICY IF EXISTS "Prevent privileged role self-assignment" ON public.user_roles;
CREATE POLICY "Prevent privileged role self-assignment"
  ON public.user_roles FOR INSERT
  WITH CHECK (
    -- Allow non-privileged roles for anyone
    role NOT IN ('admin', 'super_admin') 
    -- OR allow privileged roles only if assigner is super_admin
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- 3. Add UPDATE policy to prevent unauthorized role changes
DROP POLICY IF EXISTS "Only super_admins can change roles" ON public.user_roles;
CREATE POLICY "Only super_admins can change roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'super_admin'));

-- 4. Add DELETE policy to prevent unauthorized role removal
DROP POLICY IF EXISTS "Only super_admins can delete roles" ON public.user_roles;
CREATE POLICY "Only super_admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'super_admin'));

-- 5. Add defense-in-depth for donations INSERT to validate donor_id matches authenticated user
DROP POLICY IF EXISTS "Authenticated users can create donations" ON public.donations;
CREATE POLICY "Users can create donations with valid donor_id"
  ON public.donations FOR INSERT
  WITH CHECK (
    -- Either unauthenticated/anonymous donation (donor_id null)
    (auth.uid() IS NULL AND donor_id IS NULL) OR
    -- OR authenticated with matching donor_id or anonymous
    (auth.uid() IS NOT NULL AND (
      donor_id IS NULL OR 
      donor_id = auth.uid() OR
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'super_admin')
    ))
  );