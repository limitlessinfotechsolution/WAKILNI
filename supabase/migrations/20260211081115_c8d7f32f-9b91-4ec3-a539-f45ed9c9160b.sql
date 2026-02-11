
-- ============================================================================
-- 1. PERFORMANCE INDEXES
-- ============================================================================

-- Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_traveler_id ON public.bookings(traveler_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON public.bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON public.bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_date ON public.bookings(scheduled_date);

-- Booking activities
CREATE INDEX IF NOT EXISTS idx_booking_activities_booking_id ON public.booking_activities(booking_id);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_booking_id ON public.messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read) WHERE is_read = false;

-- Audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Beneficiaries
CREATE INDEX IF NOT EXISTS idx_beneficiaries_user_id ON public.beneficiaries(user_id);

-- Services
CREATE INDEX IF NOT EXISTS idx_services_provider_id ON public.services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_service_type ON public.services(service_type);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON public.reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);

-- Transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_booking_id ON public.transactions(booking_id);

-- Providers
CREATE INDEX IF NOT EXISTS idx_providers_kyc_status ON public.providers(kyc_status);

-- User roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Donation allocations
CREATE INDEX IF NOT EXISTS idx_donation_allocations_donation_id ON public.donation_allocations(donation_id);
CREATE INDEX IF NOT EXISTS idx_donation_allocations_charity_request_id ON public.donation_allocations(charity_request_id);

-- ============================================================================
-- 2. FIX AUDIT LOGGING - ADD INSERT POLICIES
-- ============================================================================

CREATE POLICY "Admins can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Service role can manage audit logs"
ON public.audit_logs
FOR ALL
USING (auth.role() = 'service_role'::text);

-- ============================================================================
-- 3. AUTO-UPDATE PROVIDER STATS TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_provider_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_provider_id uuid;
  new_rating numeric;
  new_count integer;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_provider_id := OLD.provider_id;
  ELSE
    target_provider_id := NEW.provider_id;
  END IF;

  SELECT COALESCE(AVG(rating), 0), COUNT(*)
  INTO new_rating, new_count
  FROM public.reviews
  WHERE provider_id = target_provider_id;

  UPDATE public.providers
  SET rating = ROUND(new_rating, 2),
      total_reviews = new_count,
      updated_at = now()
  WHERE id = target_provider_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_update_provider_stats_on_review
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_provider_stats();

-- ============================================================================
-- 4. BOOKING STATUS TRANSITION VALIDATION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_booking_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF OLD.status IS NULL THEN
    RETURN NEW;
  END IF;

  -- Validate transitions
  CASE OLD.status::text
    WHEN 'pending' THEN
      IF NEW.status::text NOT IN ('accepted', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid transition from pending to %', NEW.status;
      END IF;
    WHEN 'accepted' THEN
      IF NEW.status::text NOT IN ('in_progress', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid transition from accepted to %', NEW.status;
      END IF;
    WHEN 'in_progress' THEN
      IF NEW.status::text NOT IN ('completed', 'disputed') THEN
        RAISE EXCEPTION 'Invalid transition from in_progress to %', NEW.status;
      END IF;
    WHEN 'completed' THEN
      RAISE EXCEPTION 'Cannot transition from completed status';
    WHEN 'cancelled' THEN
      RAISE EXCEPTION 'Cannot transition from cancelled status';
    WHEN 'disputed' THEN
      IF NEW.status::text NOT IN ('completed', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid transition from disputed to %', NEW.status;
      END IF;
    ELSE
      NULL;
  END CASE;

  -- Auto-set completed_at
  IF NEW.status::text = 'completed' AND NEW.completed_at IS NULL THEN
    NEW.completed_at := now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_validate_booking_transition
BEFORE UPDATE ON public.bookings
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.validate_booking_transition();

-- ============================================================================
-- 5. AUTOMATIC BOOKING ACTIVITY LOGGING
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.booking_activities (booking_id, action, actor_id, details)
  VALUES (
    NEW.id,
    'status_changed',
    auth.uid(),
    jsonb_build_object(
      'old_status', OLD.status::text,
      'new_status', NEW.status::text,
      'changed_at', now()
    )
  );

  -- Also increment provider total_bookings on completion
  IF NEW.status::text = 'completed' AND OLD.status::text != 'completed' AND NEW.provider_id IS NOT NULL THEN
    UPDATE public.providers
    SET total_bookings = COALESCE(total_bookings, 0) + 1,
        updated_at = now()
    WHERE id = NEW.provider_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_log_booking_status_change
AFTER UPDATE ON public.bookings
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.log_booking_status_change();

-- ============================================================================
-- 6. DATABASE CLEANUP FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS jsonb AS $$
DECLARE
  deleted_keys integer;
  closed_sessions integer;
  cleaned_notifications integer;
BEGIN
  -- Clean expired idempotency keys
  DELETE FROM public.payment_idempotency_keys
  WHERE expires_at < now();
  GET DIAGNOSTICS deleted_keys = ROW_COUNT;

  -- Close stale sessions (older than 30 days)
  UPDATE public.user_sessions
  SET logged_out_at = now(), is_current = false
  WHERE logged_out_at IS NULL
    AND logged_in_at < now() - interval '30 days';
  GET DIAGNOSTICS closed_sessions = ROW_COUNT;

  -- Remove old processed notifications (90 days)
  DELETE FROM public.notification_queue
  WHERE status IN ('sent', 'failed')
    AND created_at < now() - interval '90 days';
  GET DIAGNOSTICS cleaned_notifications = ROW_COUNT;

  RETURN jsonb_build_object(
    'deleted_idempotency_keys', deleted_keys,
    'closed_stale_sessions', closed_sessions,
    'cleaned_notifications', cleaned_notifications,
    'run_at', now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 7. MATERIALIZED VIEW FOR ADMIN DASHBOARD
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.admin_dashboard_stats AS
SELECT
  (SELECT count(*) FROM public.user_roles WHERE role = 'traveler') AS total_travelers,
  (SELECT count(*) FROM public.providers) AS total_providers,
  (SELECT count(*) FROM public.vendors) AS total_vendors,
  (SELECT count(*) FROM public.bookings) AS total_bookings,
  (SELECT count(*) FROM public.bookings WHERE status = 'pending') AS pending_bookings,
  (SELECT count(*) FROM public.bookings WHERE status = 'completed') AS completed_bookings,
  (SELECT count(*) FROM public.donations) AS total_donations,
  (SELECT COALESCE(sum(amount), 0) FROM public.donations) AS donation_amount,
  (SELECT count(*) FROM public.providers WHERE kyc_status = 'pending') AS pending_kyc,
  (SELECT count(*) FROM public.services WHERE is_active = true) AS active_services,
  now() AS refreshed_at;

CREATE OR REPLACE FUNCTION public.refresh_admin_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.admin_dashboard_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
