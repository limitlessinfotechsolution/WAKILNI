CREATE OR REPLACE FUNCTION public.generate_display_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _prefix text;
  _pad_length int;
  _next_num int;
  _display_id text;
BEGIN
  _prefix := CASE NEW.role
    WHEN 'traveler' THEN 'WKIU'
    WHEN 'provider' THEN 'WKIP'
    WHEN 'vendor' THEN 'WKIV'
    WHEN 'admin' THEN 'WKIA'
    WHEN 'super_admin' THEN 'WAKISU'
    ELSE 'WKIU'
  END;

  _pad_length := CASE WHEN NEW.role = 'super_admin' THEN 3 ELSE 5 END;

  PERFORM pg_advisory_xact_lock(hashtext(_prefix));

  SELECT count(*) + 1 INTO _next_num
  FROM public.profiles
  WHERE display_id LIKE _prefix || '%';

  _display_id := _prefix || lpad(_next_num::text, _pad_length, '0');

  UPDATE public.profiles
  SET display_id = _display_id
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;