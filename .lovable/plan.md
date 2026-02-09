

# Fix: Database Error on Account Creation

## Problem

The `generate_display_id()` trigger function uses `FOR UPDATE` with `count(*)` (an aggregate function), which PostgreSQL does not allow. This causes every signup to fail with:

```
ERROR: FOR UPDATE is not allowed with aggregate functions
```

## Solution

Replace the `FOR UPDATE` locking with a simple `count(*)` query. To prevent race conditions, we can use an `ADVISORY LOCK` instead.

### Database Migration

Update the `generate_display_id()` function:

```sql
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

  -- Use advisory lock to prevent race conditions (hash the prefix)
  PERFORM pg_advisory_xact_lock(hashtext(_prefix));

  -- Count existing profiles with same prefix (no FOR UPDATE needed)
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
```

**Key change**: Removed `FOR UPDATE` from the aggregate query and replaced it with `pg_advisory_xact_lock` for safe concurrency handling. Advisory locks are transaction-scoped and work perfectly with aggregate functions.

### Files Changed

- One new database migration file to update the function (no frontend changes needed)

