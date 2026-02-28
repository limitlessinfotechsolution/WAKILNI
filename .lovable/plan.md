

## Root Cause

The `user_roles` table has two **RESTRICTIVE** SELECT policies:
1. "Admins can view all roles" — `has_role(auth.uid(), 'admin')`
2. "Users can view their own roles" — `auth.uid() = user_id`

With restrictive (non-permissive) policies, **ALL** must pass simultaneously. An admin must satisfy BOTH conditions, meaning they can only see their own row. This is why only 1 user appears despite 10 existing in the database.

The same issue likely affects `profiles` — its SELECT policy "Users can view profiles of booking participants" is also restrictive, compounding the problem.

## Fix

**Database migration** to convert the conflicting policies from RESTRICTIVE to PERMISSIVE:

### For `user_roles`:
- Drop the two restrictive SELECT policies
- Recreate them as PERMISSIVE — so either condition grants access (OR logic instead of AND)

### For `profiles`:
- Drop the restrictive SELECT policies  
- Recreate them as PERMISSIVE — so admins/super_admins can see all profiles, and users can see their own + booking participants

No code changes needed — the `useAdminUsers` hook logic is correct; it's purely a database policy issue.

