
-- Create user_sessions table for login tracking
CREATE TABLE public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  logged_in_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  device_type text,
  browser text,
  os text,
  country text,
  city text,
  is_current boolean DEFAULT false,
  logged_out_at timestamptz
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
ON public.user_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
ON public.user_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
ON public.user_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
ON public.user_sessions FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add last_login_at to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_ip text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_device text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_location text;

-- Create index for performance
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_logged_in_at ON public.user_sessions(logged_in_at DESC);
