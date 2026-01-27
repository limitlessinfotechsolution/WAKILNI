-- Create enums for the platform
CREATE TYPE public.app_role AS ENUM ('admin', 'traveler', 'provider');
CREATE TYPE public.beneficiary_status AS ENUM ('deceased', 'sick', 'elderly', 'disabled', 'other');
CREATE TYPE public.kyc_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');
CREATE TYPE public.booking_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'disputed');
CREATE TYPE public.service_type AS ENUM ('umrah', 'hajj', 'ziyarat');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'traveler',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  full_name_ar TEXT,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT false,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'ar')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Providers table (for provider-specific data)
CREATE TABLE public.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name TEXT,
  company_name_ar TEXT,
  bio TEXT,
  bio_ar TEXT,
  certifications JSONB DEFAULT '[]'::jsonb,
  kyc_status kyc_status DEFAULT 'pending',
  kyc_submitted_at TIMESTAMP WITH TIME ZONE,
  kyc_reviewed_at TIMESTAMP WITH TIME ZONE,
  kyc_notes TEXT,
  rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Beneficiaries table
CREATE TABLE public.beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  full_name_ar TEXT,
  date_of_birth DATE,
  nationality TEXT,
  status beneficiary_status NOT NULL,
  status_notes TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
  service_type service_type NOT NULL,
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT,
  description_ar TEXT,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'SAR',
  duration_days INTEGER,
  includes JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  traveler_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES public.providers(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  beneficiary_id UUID REFERENCES public.beneficiaries(id) ON DELETE SET NULL,
  status booking_status DEFAULT 'pending',
  special_requests TEXT,
  total_amount NUMERIC(10,2),
  currency TEXT DEFAULT 'SAR',
  scheduled_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  proof_gallery JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Booking activities (audit trail)
CREATE TABLE public.booking_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'SAR',
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  comment_ar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1 
      WHEN 'provider' THEN 2 
      ELSE 3 
    END
  LIMIT 1
$$;

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON public.providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_beneficiaries_updated_at BEFORE UPDATE ON public.beneficiaries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile and role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'traveler'));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);

-- RLS Policies for providers
CREATE POLICY "Providers can view their own record" ON public.providers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Providers can update their own record" ON public.providers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view approved providers" ON public.providers FOR SELECT USING (kyc_status = 'approved' AND is_active = true);
CREATE POLICY "Admins can view all providers" ON public.providers FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage providers" ON public.providers FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create their own provider record" ON public.providers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for beneficiaries
CREATE POLICY "Users can view their own beneficiaries" ON public.beneficiaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own beneficiaries" ON public.beneficiaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own beneficiaries" ON public.beneficiaries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own beneficiaries" ON public.beneficiaries FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all beneficiaries" ON public.beneficiaries FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for services
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Providers can manage their own services" ON public.services FOR ALL USING (
  EXISTS (SELECT 1 FROM public.providers WHERE id = provider_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage all services" ON public.services FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for bookings
CREATE POLICY "Travelers can view their own bookings" ON public.bookings FOR SELECT USING (auth.uid() = traveler_id);
CREATE POLICY "Providers can view bookings assigned to them" ON public.bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.providers WHERE id = provider_id AND user_id = auth.uid())
);
CREATE POLICY "Travelers can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = traveler_id);
CREATE POLICY "Providers can update their bookings" ON public.bookings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.providers WHERE id = provider_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can view all bookings" ON public.bookings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all bookings" ON public.bookings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for booking_activities
CREATE POLICY "Booking participants can view activities" ON public.booking_activities FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.bookings b 
    WHERE b.id = booking_id 
    AND (b.traveler_id = auth.uid() OR EXISTS (SELECT 1 FROM public.providers p WHERE p.id = b.provider_id AND p.user_id = auth.uid()))
  )
);
CREATE POLICY "Admins can view all activities" ON public.booking_activities FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Booking participants can create activities" ON public.booking_activities FOR INSERT WITH CHECK (auth.uid() = actor_id);

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Reviewers can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Reviewers can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = reviewer_id);
CREATE POLICY "Admins can manage reviews" ON public.reviews FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for messages
CREATE POLICY "Users can view messages they sent or received" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Recipients can mark messages as read" ON public.messages FOR UPDATE USING (auth.uid() = recipient_id);
CREATE POLICY "Admins can view all messages" ON public.messages FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_activities;