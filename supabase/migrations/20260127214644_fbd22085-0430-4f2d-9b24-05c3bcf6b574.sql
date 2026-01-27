-- Create vendors table (Travel Agency Companies)
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT NOT NULL,
  company_name_ar TEXT,
  commercial_registration TEXT,
  tax_number TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  address_ar TEXT,
  logo_url TEXT,
  subscription_plan TEXT DEFAULT 'basic',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  kyc_status public.kyc_status DEFAULT 'pending',
  kyc_submitted_at TIMESTAMP WITH TIME ZONE,
  kyc_reviewed_at TIMESTAMP WITH TIME ZONE,
  kyc_notes TEXT,
  is_active BOOLEAN DEFAULT false,
  is_suspended BOOLEAN DEFAULT false,
  suspension_reason TEXT,
  total_bookings INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  is_saudi_registered BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create donations table
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_id UUID,
  donor_name TEXT,
  donor_email TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'SAR',
  payment_method TEXT,
  payment_reference TEXT,
  payment_status TEXT DEFAULT 'pending',
  is_anonymous BOOLEAN DEFAULT false,
  message TEXT,
  allocated_amount NUMERIC DEFAULT 0,
  remaining_amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create charity_requests table
CREATE TABLE public.charity_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  beneficiary_id UUID REFERENCES public.beneficiaries(id) ON DELETE SET NULL,
  requester_id UUID,
  service_type public.service_type NOT NULL,
  requested_amount NUMERIC NOT NULL,
  approved_amount NUMERIC,
  status TEXT DEFAULT 'pending',
  priority INTEGER DEFAULT 0,
  reason TEXT,
  reason_ar TEXT,
  supporting_documents JSONB DEFAULT '[]',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create donation_allocations table
CREATE TABLE public.donation_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donation_id UUID REFERENCES public.donations(id) ON DELETE CASCADE NOT NULL,
  charity_request_id UUID REFERENCES public.charity_requests(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  allocated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system_settings table
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system_notices table
CREATE TABLE public.system_notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_ar TEXT,
  content TEXT NOT NULL,
  content_ar TEXT,
  notice_type TEXT DEFAULT 'info',
  target_roles JSONB DEFAULT '["all"]',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID,
  actor_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_allocations table
CREATE TABLE public.service_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.providers(id),
  vendor_id UUID REFERENCES public.vendors(id),
  allocation_type TEXT DEFAULT 'manual',
  status TEXT DEFAULT 'pending',
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  priority INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create provider_bids table
CREATE TABLE public.provider_bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
  bid_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'SAR',
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donation_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_bids ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendors
CREATE POLICY "Super admins can manage all vendors" ON public.vendors FOR ALL USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can view all vendors" ON public.vendors FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update vendors" ON public.vendors FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Vendors can view their own record" ON public.vendors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Vendors can update their own record" ON public.vendors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create vendor record" ON public.vendors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can view active approved vendors" ON public.vendors FOR SELECT USING (kyc_status = 'approved' AND is_active = true AND is_suspended = false);

-- RLS Policies for donations
CREATE POLICY "Super admins can manage all donations" ON public.donations FOR ALL USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can view all donations" ON public.donations FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view their own donations" ON public.donations FOR SELECT USING (auth.uid() = donor_id);
CREATE POLICY "Users can create donations" ON public.donations FOR INSERT WITH CHECK (true);

-- RLS Policies for charity_requests
CREATE POLICY "Super admins can manage charity requests" ON public.charity_requests FOR ALL USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can manage charity requests" ON public.charity_requests FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view their own requests" ON public.charity_requests FOR SELECT USING (auth.uid() = requester_id);
CREATE POLICY "Users can create charity requests" ON public.charity_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- RLS Policies for donation_allocations
CREATE POLICY "Super admins can manage allocations" ON public.donation_allocations FOR ALL USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can manage allocations" ON public.donation_allocations FOR ALL USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for system_settings
CREATE POLICY "Only super admins can manage system settings" ON public.system_settings FOR ALL USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can view system settings" ON public.system_settings FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for system_notices
CREATE POLICY "Super admins can manage notices" ON public.system_notices FOR ALL USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can manage notices" ON public.system_notices FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Everyone can view active notices" ON public.system_notices FOR SELECT USING (is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (expires_at IS NULL OR expires_at > now()));

-- RLS Policies for audit_logs
CREATE POLICY "Super admins can view all audit logs" ON public.audit_logs FOR SELECT USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can view recent audit logs" ON public.audit_logs FOR SELECT USING (has_role(auth.uid(), 'admin') AND created_at > now() - interval '30 days');

-- RLS Policies for service_allocations
CREATE POLICY "Super admins can manage service allocations" ON public.service_allocations FOR ALL USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can manage service allocations" ON public.service_allocations FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Providers can view their allocations" ON public.service_allocations FOR SELECT USING (EXISTS (SELECT 1 FROM providers WHERE providers.id = service_allocations.provider_id AND providers.user_id = auth.uid()));
CREATE POLICY "Vendors can view their allocations" ON public.service_allocations FOR SELECT USING (EXISTS (SELECT 1 FROM vendors WHERE vendors.id = service_allocations.vendor_id AND vendors.user_id = auth.uid()));

-- RLS Policies for provider_bids
CREATE POLICY "Super admins can manage all bids" ON public.provider_bids FOR ALL USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can view all bids" ON public.provider_bids FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Providers can manage their own bids" ON public.provider_bids FOR ALL USING (EXISTS (SELECT 1 FROM providers WHERE providers.id = provider_bids.provider_id AND providers.user_id = auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON public.donations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_charity_requests_updated_at BEFORE UPDATE ON public.charity_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_system_notices_updated_at BEFORE UPDATE ON public.system_notices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_allocations_updated_at BEFORE UPDATE ON public.service_allocations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_provider_bids_updated_at BEFORE UPDATE ON public.provider_bids FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'
  )
$$;

-- Function to log audit actions
CREATE OR REPLACE FUNCTION public.log_audit_action(
  _action TEXT,
  _entity_type TEXT,
  _entity_id UUID DEFAULT NULL,
  _old_values JSONB DEFAULT NULL,
  _new_values JSONB DEFAULT NULL,
  _metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _log_id UUID;
  _actor_role TEXT;
BEGIN
  SELECT role::TEXT INTO _actor_role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
  
  INSERT INTO public.audit_logs (actor_id, actor_role, action, entity_type, entity_id, old_values, new_values, metadata)
  VALUES (auth.uid(), _actor_role, _action, _entity_type, _entity_id, _old_values, _new_values, _metadata)
  RETURNING id INTO _log_id;
  
  RETURN _log_id;
END;
$$;

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description, category) VALUES
('maintenance_mode', '{"enabled": false, "message": "System is under maintenance"}', 'Enable/disable maintenance mode', 'system'),
('registration_enabled', '{"travelers": true, "providers": true, "vendors": true}', 'Enable/disable new registrations by role', 'registration'),
('booking_enabled', '{"enabled": true}', 'Enable/disable new bookings', 'bookings'),
('donations_enabled', '{"enabled": true, "minimum_amount": 10}', 'Donation settings', 'donations'),
('emergency_shutdown', '{"enabled": false, "reason": ""}', 'Emergency system shutdown', 'system'),
('platform_fees', '{"provider_percentage": 10, "vendor_percentage": 15}', 'Platform commission percentages', 'finance');

-- Add suspension columns to providers
ALTER TABLE public.providers ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
ALTER TABLE public.providers ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
ALTER TABLE public.providers ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'SA';