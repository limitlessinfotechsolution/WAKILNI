
-- Restore trigger: generate display_id when role is assigned
DROP TRIGGER IF EXISTS on_role_assigned_generate_display_id ON public.user_roles;
CREATE TRIGGER on_role_assigned_generate_display_id
  AFTER INSERT ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.generate_display_id();

-- Restore trigger: validate booking status transitions
DROP TRIGGER IF EXISTS validate_booking_status_transition ON public.bookings;
CREATE TRIGGER validate_booking_status_transition
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.validate_booking_transition();

-- Restore trigger: log booking status changes
DROP TRIGGER IF EXISTS log_booking_status_changes ON public.bookings;
CREATE TRIGGER log_booking_status_changes
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.log_booking_status_change();

-- Restore trigger: update provider stats on review changes
DROP TRIGGER IF EXISTS update_provider_stats_trigger ON public.reviews;
CREATE TRIGGER update_provider_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_provider_stats();

-- Restore trigger: rate limit booking creation
DROP TRIGGER IF EXISTS rate_limit_bookings ON public.bookings;
CREATE TRIGGER rate_limit_bookings
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.rate_limit_booking_creation();

-- Restore trigger: rate limit message sending
DROP TRIGGER IF EXISTS rate_limit_messages ON public.messages;
CREATE TRIGGER rate_limit_messages
  BEFORE INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.rate_limit_message_sending();

-- Restore trigger: rate limit donation creation
DROP TRIGGER IF EXISTS rate_limit_donations ON public.donations;
CREATE TRIGGER rate_limit_donations
  BEFORE INSERT ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.rate_limit_donation_creation();

-- Restore updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_providers_updated_at ON public.providers;
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON public.providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_vendors_updated_at ON public.vendors;
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_beneficiaries_updated_at ON public.beneficiaries;
CREATE TRIGGER update_beneficiaries_updated_at BEFORE UPDATE ON public.beneficiaries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
