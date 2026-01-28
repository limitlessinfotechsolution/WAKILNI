-- Certified Pilgrim Engine: Trust & Proof System
-- This implements the core certification system for verified pilgrims

-- 1. Create enum for pilgrim certification status
CREATE TYPE public.pilgrim_status AS ENUM ('pending', 'under_review', 'verified', 'suspended', 'inactive');

-- 2. Create pilgrim certifications table for detailed verification
CREATE TABLE public.pilgrim_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  
  -- Personal verification
  government_id_url TEXT,
  government_id_verified BOOLEAN DEFAULT false,
  photo_verification_url TEXT,
  photo_verified BOOLEAN DEFAULT false,
  
  -- Religious qualifications
  has_completed_own_umrah BOOLEAN DEFAULT false,
  own_umrah_date DATE,
  has_completed_own_hajj BOOLEAN DEFAULT false,
  own_hajj_date DATE,
  umrah_permit_history JSONB DEFAULT '[]'::jsonb,
  
  -- Video oath (niyyah declaration)
  video_oath_url TEXT,
  video_oath_transcript TEXT,
  video_oath_verified BOOLEAN DEFAULT false,
  video_oath_verified_by UUID,
  video_oath_verified_at TIMESTAMPTZ,
  
  -- Scholar verification
  scholar_approved BOOLEAN DEFAULT false,
  scholar_id UUID,
  scholar_approval_date TIMESTAMPTZ,
  scholar_notes TEXT,
  
  -- Status and limits
  status pilgrim_status DEFAULT 'pending',
  max_active_badal INTEGER DEFAULT 1,
  current_active_badal INTEGER DEFAULT 0,
  
  -- Violation tracking
  violation_count INTEGER DEFAULT 0,
  violations JSONB DEFAULT '[]'::jsonb,
  last_violation_date TIMESTAMPTZ,
  
  -- Trust score (0-100)
  trust_score INTEGER DEFAULT 0,
  total_completed_rituals INTEGER DEFAULT 0,
  
  -- Timestamps
  submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,
  suspension_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Unique constraint
  UNIQUE(provider_id)
);

-- 3. Create ritual event ledger for immutable proof tracking
CREATE TABLE public.ritual_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.providers(id),
  beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id),
  
  -- Ritual step details
  ritual_step TEXT NOT NULL, -- 'ihram', 'tawaf', 'sai', 'halq_taqsir', 'completion_dua'
  step_order INTEGER NOT NULL,
  
  -- Verification data
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  geo_location JSONB, -- {lat, lng, accuracy, place_name}
  media_url TEXT,
  media_hash TEXT, -- SHA-256 for tamper detection
  media_type TEXT, -- 'photo', 'video', 'audio'
  
  -- Audio dua proof
  dua_audio_url TEXT,
  dua_transcript TEXT,
  beneficiary_name_mentioned BOOLEAN DEFAULT false,
  
  -- Verification status
  verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,
  
  -- Anti-fraud
  exif_data JSONB,
  device_fingerprint TEXT,
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create completion certificates table
CREATE TABLE public.completion_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE,
  
  -- Certificate data
  certificate_number TEXT NOT NULL UNIQUE,
  beneficiary_name TEXT NOT NULL,
  beneficiary_name_ar TEXT,
  pilgrim_id UUID NOT NULL REFERENCES public.providers(id),
  service_type service_type NOT NULL,
  
  -- Completion details
  completed_date DATE NOT NULL,
  hijri_date TEXT,
  location TEXT DEFAULT 'Masjid al-Haram, Makkah',
  
  -- Verification
  all_steps_verified BOOLEAN DEFAULT false,
  qr_verification_code TEXT NOT NULL UNIQUE,
  
  -- Timestamps
  issued_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable RLS on all tables
ALTER TABLE public.pilgrim_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ritual_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completion_certificates ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for pilgrim_certifications
CREATE POLICY "Providers can view their own certification"
  ON public.pilgrim_certifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM providers p 
      WHERE p.id = pilgrim_certifications.provider_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can insert their own certification"
  ON public.pilgrim_certifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM providers p 
      WHERE p.id = pilgrim_certifications.provider_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can update their own certification"
  ON public.pilgrim_certifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM providers p 
      WHERE p.id = pilgrim_certifications.provider_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all certifications"
  ON public.pilgrim_certifications FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Public can view verified pilgrim status (limited fields via view)
CREATE POLICY "Public can view verified pilgrims"
  ON public.pilgrim_certifications FOR SELECT
  USING (status = 'verified');

-- 7. RLS Policies for ritual_events
CREATE POLICY "Providers can insert their ritual events"
  ON public.ritual_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM providers p 
      WHERE p.id = ritual_events.provider_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Providers can view their ritual events"
  ON public.ritual_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM providers p 
      WHERE p.id = ritual_events.provider_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Travelers can view ritual events for their bookings"
  ON public.ritual_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings b 
      WHERE b.id = ritual_events.booking_id 
      AND b.traveler_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all ritual events"
  ON public.ritual_events FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- 8. RLS Policies for completion_certificates
CREATE POLICY "Travelers can view certificates for their bookings"
  ON public.completion_certificates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings b 
      WHERE b.id = completion_certificates.booking_id 
      AND b.traveler_id = auth.uid()
    )
  );

CREATE POLICY "Providers can view certificates they issued"
  ON public.completion_certificates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM providers p 
      WHERE p.id = completion_certificates.pilgrim_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all certificates"
  ON public.completion_certificates FOR ALL
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Public can verify certificates via QR code
CREATE POLICY "Public can verify certificates"
  ON public.completion_certificates FOR SELECT
  USING (true);

-- 9. Create indexes for performance
CREATE INDEX idx_pilgrim_certifications_provider ON public.pilgrim_certifications(provider_id);
CREATE INDEX idx_pilgrim_certifications_status ON public.pilgrim_certifications(status);
CREATE INDEX idx_ritual_events_booking ON public.ritual_events(booking_id);
CREATE INDEX idx_ritual_events_provider ON public.ritual_events(provider_id);
CREATE INDEX idx_completion_certificates_booking ON public.completion_certificates(booking_id);
CREATE INDEX idx_completion_certificates_qr ON public.completion_certificates(qr_verification_code);

-- 10. Create trigger to update updated_at
CREATE TRIGGER update_pilgrim_certifications_updated_at
  BEFORE UPDATE ON public.pilgrim_certifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Enable realtime for ritual events (live tracking)
ALTER PUBLICATION supabase_realtime ADD TABLE public.ritual_events;