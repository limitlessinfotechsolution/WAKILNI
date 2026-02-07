
-- Add display_id column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_id text UNIQUE;

-- Create function to generate display_id from role
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
  -- Determine prefix based on role
  _prefix := CASE NEW.role
    WHEN 'traveler' THEN 'WKIU'
    WHEN 'provider' THEN 'WKIP'
    WHEN 'vendor' THEN 'WKIV'
    WHEN 'admin' THEN 'WKIA'
    WHEN 'super_admin' THEN 'WAKISU'
    ELSE 'WKIU'
  END;

  -- Super admin uses 3-digit padding, others use 5
  _pad_length := CASE WHEN NEW.role = 'super_admin' THEN 3 ELSE 5 END;

  -- Count existing profiles with same prefix (with lock to prevent races)
  SELECT count(*) + 1 INTO _next_num
  FROM public.profiles
  WHERE display_id LIKE _prefix || '%'
  FOR UPDATE;

  _display_id := _prefix || lpad(_next_num::text, _pad_length, '0');

  -- Update the profile
  UPDATE public.profiles
  SET display_id = _display_id
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Create trigger on user_roles insert
CREATE TRIGGER trg_generate_display_id
AFTER INSERT ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.generate_display_id();

-- Backfill existing users ordered by creation date
DO $$
DECLARE
  _rec record;
  _prefix text;
  _pad_length int;
  _counter int;
  _last_prefix text := '';
BEGIN
  FOR _rec IN
    SELECT ur.user_id, ur.role, p.created_at
    FROM public.user_roles ur
    JOIN public.profiles p ON p.user_id = ur.user_id
    WHERE p.display_id IS NULL
    ORDER BY ur.role, p.created_at
  LOOP
    _prefix := CASE _rec.role
      WHEN 'traveler' THEN 'WKIU'
      WHEN 'provider' THEN 'WKIP'
      WHEN 'vendor' THEN 'WKIV'
      WHEN 'admin' THEN 'WKIA'
      WHEN 'super_admin' THEN 'WAKISU'
      ELSE 'WKIU'
    END;
    _pad_length := CASE WHEN _rec.role = 'super_admin' THEN 3 ELSE 5 END;

    IF _prefix != _last_prefix THEN
      _counter := 0;
      _last_prefix := _prefix;
    END IF;

    _counter := _counter + 1;

    UPDATE public.profiles
    SET display_id = _prefix || lpad(_counter::text, _pad_length, '0')
    WHERE user_id = _rec.user_id;
  END LOOP;
END;
$$;
