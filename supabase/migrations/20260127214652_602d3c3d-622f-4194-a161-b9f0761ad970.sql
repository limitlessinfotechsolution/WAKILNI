-- Fix the overly permissive INSERT policy for donations
DROP POLICY IF EXISTS "Users can create donations" ON public.donations;
CREATE POLICY "Authenticated users can create donations" ON public.donations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);