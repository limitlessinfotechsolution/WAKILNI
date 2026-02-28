

## Root Cause

The `useAdminUsers` hook joins `user_roles` with `profiles` via `profiles!inner(...)`, but there is **no foreign key relationship** between these two tables. Both have a `user_id` column referencing `auth.users`, but PostgREST cannot resolve an implicit join between them. This causes the PGRST200 error on every admin user management page.

## Fix

**Change `useAdminUsers.ts`** to use two separate queries instead of a join:

1. Fetch all `user_roles` (with optional role filter)
2. Collect all `user_id` values from the result
3. Fetch matching `profiles` rows using `.in('user_id', userIds)`
4. Merge profiles into the roles data client-side by matching on `user_id`

This avoids the missing FK relationship entirely and follows the existing project pattern noted in memory: "Explicit foreign key hints in queries are avoided to prevent 'Failed to fetch' errors."

No database migration needed — this is a code-only fix.

### Changes

**`src/hooks/useAdminUsers.ts`** — Replace `fetchUsers` function:
- Query `user_roles` with `select('*')` + optional role filter
- Extract `user_id` array from results  
- Query `profiles` with `.in('user_id', userIds)` selecting the needed columns
- Map profiles by `user_id` and merge into role records

