

# Unique Display IDs Implementation Plan

## Overview

Add human-readable, role-based unique IDs to every user across the platform. These IDs will be auto-generated on account creation and displayed throughout the UI.

### ID Format

| Role | Prefix | Example |
|------|--------|---------|
| Traveler (User) | WKIU | WKIU00001 |
| Provider | WKIP | WKIP00001 |
| Vendor | WKIV | WKIV00001 |
| Admin | WKIA | WKIA00001 |
| Super Admin | WAKISU | WAKISU001 |

Each prefix has its own independent counter, so the first provider is WKIP00001 regardless of how many travelers exist.

---

## Technical Approach

### 1. Database Changes

**Add `display_id` column to `profiles` table:**

```sql
ALTER TABLE profiles ADD COLUMN display_id text UNIQUE;
```

**Create a function to auto-generate IDs on profile creation:**

The function will:
- Look up the user's role from `user_roles`
- Count existing profiles with the same prefix
- Generate the next sequential ID (zero-padded to 5 digits, or 3 for Super Admin)

**Create a trigger** that fires after a row is inserted into `user_roles`, updating the corresponding profile's `display_id`. This ensures the ID is set once the role is assigned.

### 2. Backfill Existing Users

A one-time migration query will assign `display_id` to all 9 existing users based on their current roles, ordered by `created_at` so early users get lower numbers.

### 3. Frontend Display

Update these areas to show the display ID:

- **Profile Settings Page** -- Show ID as a read-only badge
- **Admin Users Management** -- Show display ID in the users table
- **Admin Providers/Vendors Management** -- Show provider/vendor display IDs
- **Sidebar/Header** -- Show current user's display ID under their name
- **Booking Detail Page** -- Show traveler and provider IDs

### 4. Files to Modify

| File | Change |
|------|--------|
| `profiles` table (migration) | Add `display_id` column + trigger function |
| `src/lib/auth/AuthContext.tsx` | Include `display_id` in Profile interface and fetch |
| `src/components/layout/EnhancedSidebar.tsx` | Show display ID badge |
| `src/components/layout/EnhancedHeader.tsx` | Show display ID in user menu |
| `src/pages/settings/ProfileSettingsPage.tsx` | Display ID as read-only field |
| `src/hooks/useAdminUsers.ts` | Include display_id in query |
| `src/pages/admin/UsersManagementPage.tsx` | Show display ID column |

### 5. Database Function Logic

```text
1. On user_roles INSERT trigger:
   a. Determine prefix from role (traveler->WKIU, provider->WKIP, etc.)
   b. Count existing profiles with that prefix pattern
   c. Next number = count + 1
   d. Format: prefix + zero-padded number
   e. UPDATE profiles SET display_id = generated_id WHERE user_id = NEW.user_id
```

The function uses `FOR UPDATE` locking to prevent race conditions on concurrent signups.

