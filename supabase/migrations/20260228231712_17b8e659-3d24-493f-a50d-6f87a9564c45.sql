
-- =============================================
-- 1. DROP AND RECREATE ALL TRIGGERS
-- =============================================

DROP TRIGGER IF EXISTS trg_validate_booking_transition ON public.bookings;
DROP TRIGGER IF EXISTS trg_log_booking_status_change ON public.bookings;
DROP TRIGGER IF EXISTS trg_update_provider_stats ON public.reviews;
DROP TRIGGER IF EXISTS trg_rate_limit_bookings ON public.bookings;
DROP TRIGGER IF EXISTS trg_rate_limit_messages ON public.messages;
DROP TRIGGER IF EXISTS trg_rate_limit_donations ON public.donations;
DROP TRIGGER IF EXISTS trg_generate_display_id ON public.user_roles;
DROP TRIGGER IF EXISTS trg_update_bookings_updated_at ON public.bookings;
DROP TRIGGER IF EXISTS trg_update_providers_updated_at ON public.providers;
DROP TRIGGER IF EXISTS trg_update_vendors_updated_at ON public.vendors;
DROP TRIGGER IF EXISTS trg_update_services_updated_at ON public.services;
DROP TRIGGER IF EXISTS trg_update_beneficiaries_updated_at ON public.beneficiaries;

CREATE TRIGGER trg_validate_booking_transition
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_booking_transition();

CREATE TRIGGER trg_log_booking_status_change
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.log_booking_status_change();

CREATE TRIGGER trg_update_provider_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_provider_stats();

CREATE TRIGGER trg_rate_limit_bookings
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.rate_limit_booking_creation();

CREATE TRIGGER trg_rate_limit_messages
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.rate_limit_message_sending();

CREATE TRIGGER trg_rate_limit_donations
  BEFORE INSERT ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.rate_limit_donation_creation();

CREATE TRIGGER trg_generate_display_id
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_display_id();

CREATE TRIGGER trg_update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_update_providers_updated_at
  BEFORE UPDATE ON public.providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_update_vendors_updated_at
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_update_beneficiaries_updated_at
  BEFORE UPDATE ON public.beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 2. CREATE MISSING STORAGE BUCKETS
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Avatars: public read, users upload to their own folder
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Documents: private, user-scoped
CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- KYC Documents: private, user-scoped + admin read
CREATE POLICY "Users can upload KYC documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own KYC documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all KYC documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'kyc-documents' AND (
    public.has_role(auth.uid(), 'admin'::public.app_role) OR 
    public.has_role(auth.uid(), 'super_admin'::public.app_role)
  ));
