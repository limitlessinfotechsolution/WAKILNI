

# Platform Improvements Plan

## Overview

A set of targeted improvements across security, UX, and functionality to make the platform more robust and production-ready.

---

## 1. Fix: Admin "Create User" Logs Out Current Admin

**Problem**: The `CreateUserDialog` uses `supabase.auth.signUp()` which automatically signs in as the new user, logging out the admin.

**Solution**: Create a backend function (`create-user-admin`) that uses the Supabase Admin API to create users without affecting the current session.

- New edge function: `supabase/functions/create-user-admin/index.ts`
- Update `useCreateUser.ts` to call the edge function instead of `signUp()`
- The edge function verifies the caller is an admin before proceeding

---

## 2. Forgot Password Flow

**Problem**: The login page links to `/forgot-password` which doesn't exist (404).

**Solution**: Create a working password reset page.

- New page: `src/pages/auth/ForgotPasswordPage.tsx`
- Uses `supabase.auth.resetPasswordForEmail()` 
- Add route in `App.tsx`
- Bilingual (EN/AR) with the same premium styling as login/signup

---

## 3. Email Search in Admin User Management

**Problem**: Admin search only filters by name and phone -- no way to search by email or display ID.

**Solution**: Extend the search to include email (from auth metadata) and display_id.

- Update `useAdminUsers.ts` to fetch email from user metadata
- Update search filter in `UsersManagementPage.tsx` to match against email and display_id
- Add email column to the users table

---

## 4. "Last Seen" Column in Admin Users Table

**Problem**: Admin can see when users joined but not when they were last active.

**Solution**: Show `last_login_at` from profiles in the users table.

- Update `useAdminUsers.ts` to include `last_login_at`, `last_login_device`, `last_login_location`
- Add "Last Active" column to `UsersManagementPage.tsx` showing relative time (e.g., "2 hours ago")

---

## 5. User Detail View in Admin Panel

**Problem**: Admins can only see basic info in the table. No way to view full user details.

**Solution**: Add a user detail dialog/sheet showing complete profile info.

- Display ID, full name (EN + AR), email, phone, role, joined date
- Last login info (device, location, time)
- Active sessions list
- Booking stats (active, completed)

---

## 6. Session Termination (Real)

**Problem**: "Sign out all devices" in profile settings only clears the local state, doesn't actually invalidate sessions.

**Solution**: 

- Update `handleSignOutAllSessions` to delete sessions from the `user_sessions` table
- Mark old sessions as `is_current = false`

---

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `supabase/functions/create-user-admin/index.ts` | Secure user creation for admins |
| `src/pages/auth/ForgotPasswordPage.tsx` | Password reset page |

### Files to Modify
| File | Change |
|------|--------|
| `src/hooks/useCreateUser.ts` | Call edge function instead of signUp |
| `src/hooks/useAdminUsers.ts` | Add email, last_login fields |
| `src/pages/admin/UsersManagementPage.tsx` | Email column, last active column, user detail dialog |
| `src/pages/settings/ProfileSettingsPage.tsx` | Real session termination |
| `src/App.tsx` | Add forgot-password route |

### Edge Function: create-user-admin
- Accepts: email, password, fullName, fullNameAr, phone, role
- Validates caller is admin/super_admin via JWT
- Uses Supabase service role key to create user via admin API
- Returns created user data
- Enforces role hierarchy (admins can't create super_admins)

