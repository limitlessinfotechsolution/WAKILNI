

## Problem

The `user_roles` policies use `has_role(auth.uid(), 'admin')` which does **not** match `super_admin` users — they have a different role value. Super admins can only see their own row, and admins cannot see super_admin rows (both sides are broken).

## Fix — Single Migration

Update two policies on `user_roles` to include `super_admin`:

1. **Drop & recreate "Admins can manage roles"** (ALL) — add `OR has_role(auth.uid(), 'super_admin')`
2. **Drop & recreate "Admins can view all roles"** (SELECT) — add `OR has_role(auth.uid(), 'super_admin')`

```sql
DROP POLICY "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

DROP POLICY "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));
```

No code changes needed. The `profiles` table already has `super_admin` in its SELECT policy, so profile data will load correctly once `user_roles` returns all rows.

