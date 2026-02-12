
-- ============================================================================
-- 1. RATE LIMITING: Booking Creation
-- Limit: max 10 bookings per user per hour
-- ============================================================================

CREATE OR REPLACE FUNCTION public.rate_limit_booking_creation()
RETURNS TRIGGER AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.bookings
  WHERE traveler_id = NEW.traveler_id
    AND created_at > now() - interval '1 hour';

  IF recent_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 10 bookings per hour';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_rate_limit_bookings
BEFORE INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.rate_limit_booking_creation();

-- ============================================================================
-- 2. RATE LIMITING: Message Sending
-- Limit: max 60 messages per user per minute
-- ============================================================================

CREATE OR REPLACE FUNCTION public.rate_limit_message_sending()
RETURNS TRIGGER AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.messages
  WHERE sender_id = NEW.sender_id
    AND created_at > now() - interval '1 minute';

  IF recent_count >= 60 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 60 messages per minute';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_rate_limit_messages
BEFORE INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.rate_limit_message_sending();

-- ============================================================================
-- 3. RATE LIMITING: Donation Creation
-- Limit: max 5 donations per user per hour
-- ============================================================================

CREATE OR REPLACE FUNCTION public.rate_limit_donation_creation()
RETURNS TRIGGER AS $$
DECLARE
  recent_count integer;
BEGIN
  IF NEW.donor_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO recent_count
  FROM public.donations
  WHERE donor_id = NEW.donor_id
    AND created_at > now() - interval '1 hour';

  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded: maximum 5 donations per hour';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trg_rate_limit_donations
BEFORE INSERT ON public.donations
FOR EACH ROW
EXECUTE FUNCTION public.rate_limit_donation_creation();
