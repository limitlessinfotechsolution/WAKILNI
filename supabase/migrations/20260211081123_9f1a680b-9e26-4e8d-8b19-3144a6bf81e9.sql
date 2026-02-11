
-- Fix: Remove materialized view from public API exposure
REVOKE SELECT ON public.admin_dashboard_stats FROM anon, authenticated;
-- Only allow service_role and direct function access
GRANT SELECT ON public.admin_dashboard_stats TO service_role;
