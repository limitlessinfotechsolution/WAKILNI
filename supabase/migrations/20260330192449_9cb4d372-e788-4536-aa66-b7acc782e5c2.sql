
-- A. Add new booking statuses to enum
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'assigned_to_vendor';
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'assigned_to_provider';

-- B. Add vendor_id to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES public.vendors(id);
CREATE INDEX IF NOT EXISTS idx_bookings_vendor_id ON public.bookings(vendor_id);

-- C. Add vendor_id to services
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES public.vendors(id);
CREATE INDEX IF NOT EXISTS idx_services_vendor_id ON public.services(vendor_id);

-- D. Create vendor_providers table
CREATE TABLE IF NOT EXISTS public.vendor_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, provider_id)
);

ALTER TABLE public.vendor_providers ENABLE ROW LEVEL SECURITY;

-- RLS for vendor_providers
CREATE POLICY "Vendors can view their own providers" ON public.vendor_providers
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM vendors WHERE vendors.id = vendor_providers.vendor_id AND vendors.user_id = auth.uid()));

CREATE POLICY "Vendors can manage their own providers" ON public.vendor_providers
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM vendors WHERE vendors.id = vendor_providers.vendor_id AND vendors.user_id = auth.uid()));

CREATE POLICY "Admins can manage vendor_providers" ON public.vendor_providers
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- E. Update validate_booking_transition function
CREATE OR REPLACE FUNCTION public.validate_booking_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF OLD.status IS NULL THEN
    RETURN NEW;
  END IF;

  -- Super Admin bypass
  IF is_super_admin(auth.uid()) THEN
    IF NEW.status::text = 'completed' AND NEW.completed_at IS NULL THEN
      NEW.completed_at := now();
    END IF;
    RETURN NEW;
  END IF;

  -- Validate transitions
  CASE OLD.status::text
    WHEN 'pending' THEN
      IF NEW.status::text NOT IN ('assigned_to_vendor', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid transition from pending to %', NEW.status;
      END IF;
    WHEN 'assigned_to_vendor' THEN
      IF NEW.status::text NOT IN ('assigned_to_provider', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid transition from assigned_to_vendor to %', NEW.status;
      END IF;
    WHEN 'assigned_to_provider' THEN
      IF NEW.status::text NOT IN ('in_progress', 'assigned_to_vendor', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid transition from assigned_to_provider to %', NEW.status;
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
$function$;

-- F. RLS policies on bookings for vendors
CREATE POLICY "Vendors can view assigned bookings" ON public.bookings
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM vendors WHERE vendors.id = bookings.vendor_id AND vendors.user_id = auth.uid()));

CREATE POLICY "Vendors can update assigned bookings" ON public.bookings
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM vendors WHERE vendors.id = bookings.vendor_id AND vendors.user_id = auth.uid()));

-- G. RLS on services for vendors
CREATE POLICY "Vendors can manage their services" ON public.services
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM vendors WHERE vendors.id = services.vendor_id AND vendors.user_id = auth.uid()));

-- Recreate the booking transition trigger
DROP TRIGGER IF EXISTS validate_booking_status_transition ON public.bookings;
CREATE TRIGGER validate_booking_status_transition
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.validate_booking_transition();

-- Recreate log trigger
DROP TRIGGER IF EXISTS log_booking_status_changes ON public.bookings;
CREATE TRIGGER log_booking_status_changes
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.log_booking_status_change();

-- Enable realtime for vendor_providers
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendor_providers;
