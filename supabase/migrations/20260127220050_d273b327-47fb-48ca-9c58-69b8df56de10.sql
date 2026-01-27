-- Enable realtime for admin notifications (bookings already added)
ALTER PUBLICATION supabase_realtime ADD TABLE public.providers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;