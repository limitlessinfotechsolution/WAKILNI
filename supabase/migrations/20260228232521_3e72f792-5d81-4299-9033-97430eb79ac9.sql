
-- 1. Notification preferences table
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email_bookings boolean DEFAULT true,
  email_kyc boolean DEFAULT true,
  email_messages boolean DEFAULT true,
  email_marketing boolean DEFAULT false,
  push_bookings boolean DEFAULT true,
  push_kyc boolean DEFAULT true,
  push_messages boolean DEFAULT true,
  push_reviews boolean DEFAULT true,
  push_system boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences"
  ON public.notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences"
  ON public.notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- 2. Wishlists table
CREATE TABLE public.wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, service_id)
);

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlists"
  ON public.wishlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlists"
  ON public.wishlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlists"
  ON public.wishlists FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Redeploy missing triggers
CREATE OR REPLACE TRIGGER trg_validate_booking_transition
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_booking_transition();

CREATE OR REPLACE TRIGGER trg_log_booking_status_change
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.log_booking_status_change();

CREATE OR REPLACE TRIGGER trg_update_provider_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_provider_stats();

CREATE OR REPLACE TRIGGER trg_rate_limit_bookings
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.rate_limit_booking_creation();

CREATE OR REPLACE TRIGGER trg_rate_limit_messages
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.rate_limit_message_sending();

CREATE OR REPLACE TRIGGER trg_rate_limit_donations
  BEFORE INSERT ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.rate_limit_donation_creation();

CREATE OR REPLACE TRIGGER generate_display_id
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_display_id();
