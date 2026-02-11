
-- Create a secure function to read admin dashboard stats (since the materialized view is not directly accessible)
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS jsonb AS $$
BEGIN
  IF NOT (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  RETURN (
    SELECT jsonb_build_object(
      'total_travelers', total_travelers,
      'total_providers', total_providers,
      'total_vendors', total_vendors,
      'total_bookings', total_bookings,
      'pending_bookings', pending_bookings,
      'completed_bookings', completed_bookings,
      'total_donations', total_donations,
      'donation_amount', donation_amount,
      'pending_kyc', pending_kyc,
      'active_services', active_services,
      'refreshed_at', refreshed_at
    )
    FROM public.admin_dashboard_stats
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
