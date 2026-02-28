

# Wakilni — Phase 2 & 3 Implementation Plan

This plan covers 6 major workstreams: messaging inbox, provider today's schedule, notification persistence, service moderation, service comparison/wishlist/payments, and full UI redesign.

---

## 1. Messaging Inbox Page

**New files:**
- `src/pages/messages/InboxPage.tsx` — Dedicated messaging page showing all conversations grouped by booking
- `src/hooks/useInbox.ts` — Hook to fetch all conversations (distinct booking_id + recipient pairs from messages table)

**Changes:**
- `src/App.tsx` — Add route `/messages` with ProtectedRoute
- `src/components/layout/EnhancedSidebar.tsx` — Add "Messages" nav item to all role groups
- `src/components/app-shell/FloatingTabBar.tsx` — Replace "Family" tab for travelers with "Messages", add Messages to other roles

**Database migration:**
- `ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;` — Enable realtime for live chat

**Logic:**
- InboxPage lists conversations with last message preview, unread count badge, and booking reference
- Clicking a conversation opens an inline chat panel (reusing `BookingMessages` component)
- Realtime subscription for new messages via `supabase.channel('messages')`

---

## 2. Provider Dashboard — Today's Schedule

**File:** `src/pages/dashboard/ProviderDashboard.tsx`

**Changes:**
- Import `useProviderBookings` hook
- Filter bookings where `scheduled_date === today` (using `format(new Date(), 'yyyy-MM-dd')`)
- Replace the static "No bookings today" placeholder (lines 253-263) with a list of today's bookings showing: service title, beneficiary name, status badge, and time
- Each booking links to `/bookings/:id`

---

## 3. Persist Notification Preferences

**Database migration:**
- Create `notification_preferences` table:
  ```sql
  CREATE TABLE notification_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE,
    email_bookings boolean DEFAULT true,
    email_kyc boolean DEFAULT true,
    email_messages boolean DEFAULT true,
    email_marketing boolean DEFAULT false,
    push_bookings boolean DEFAULT true,
    push_kyc boolean DEFAULT true,
    push_messages boolean DEFAULT true,
    push_reviews boolean DEFAULT true,
    push_system boolean DEFAULT true,
    updated_at timestamptz DEFAULT now()
  );
  ```
- RLS: users can read/update/insert their own row only

**File:** `src/pages/settings/ProfileSettingsPage.tsx`
- Replace `handleSaveNotificationPrefs` (line 169-178) mock `setTimeout` with real upsert to `notification_preferences`
- On mount, fetch existing preferences and populate state
- Add `useEffect` to load preferences when user loads settings

---

## 4. Service Moderation Queue (Admin)

**New files:**
- `src/pages/admin/ServiceModerationPage.tsx` — Table of services with `moderation_status = 'pending'`, with Approve/Reject buttons
- Uses `supabase.from('services').select('*, provider:providers(company_name)').eq('moderation_status', 'pending')`
- Approve: update `moderation_status` to `approved`, set `moderated_by` and `moderated_at`
- Reject: update to `rejected` with `rejection_reason` text input

**Changes:**
- `src/App.tsx` — Add route `/admin/services-moderation`
- `src/components/layout/EnhancedSidebar.tsx` — Add "Service Moderation" to admin Operations group with badge count

---

## 5. Service Comparison, Wishlist Persistence & Payment Integration

### 5a. Service Comparison Modal
**File:** `src/pages/services/ServicesPage.tsx`
- Wire the existing "Compare (N)" button (line 356-359) to open a Dialog/Sheet
- New component `src/components/services/ServiceComparisonModal.tsx` — Side-by-side grid showing price, duration, rating, includes list for 2-3 selected services

### 5b. Wishlist Persistence
**Database migration:**
- Create `wishlists` table: `id, user_id, service_id, created_at` with unique constraint on (user_id, service_id)
- RLS: users manage their own rows

**File:** `src/pages/services/ServicesPage.tsx`
- Replace in-memory `wishlist` state with DB-backed hook `useWishlist`
- New file `src/hooks/useWishlist.ts` — fetch/add/remove wishlist items

### 5c. Payment Gateway (Stripe)
- Enable Stripe integration via the Stripe tool
- This will provide further instructions for implementation once enabled

---

## 6. Full UI Redesign — All Screens & Sidebar

### 6a. Sidebar Redesign
**File:** `src/components/layout/EnhancedSidebar.tsx`
- Add "Messages" link to all role nav groups
- Add "Service Moderation" to admin group
- Refine collapsed state icons and tooltip styling
- Add unread message count badge dynamically

### 6b. Login/Signup Pages
**Files:** `src/pages/auth/LoginPage.tsx`, `src/pages/auth/SignupPage.tsx`
- Add loading spinner overlay during auth redirect
- Social login buttons placeholder (Google, Apple) styled but disabled
- Improve form field focus animations

### 6c. All Dashboard Screens
**Files:** All 4 dashboard files
- Standardize card spacing to 8px grid system
- Ensure all stat cards use consistent `StatCard` or `GlassCard` components
- VendorDashboard: wire "Recent Activity" section to booking_activities query
- AdminDashboard: add "Active Bookings" count from real query (replace hardcoded 0 on line 280)

### 6d. Booking Pages
**Files:** `BookingsPage.tsx`, `BookingDetailPage.tsx`, `NewBookingPage.tsx`
- Add swipe-to-refresh consistency
- BookingDetailPage: already has provider accept/reject/start/complete actions — verify they work with triggers
- Add animated status transitions

### 6e. Services Browsing
**File:** `src/pages/services/ServicesPage.tsx`
- Add hero image to service cards when `hero_image_url` exists
- Lazy load images
- Animate card entry with staggered fade-in

### 6f. Settings Page
**File:** `src/pages/settings/ProfileSettingsPage.tsx`
- Wire data export to generate and download JSON of user's bookings, beneficiaries, reviews
- Wire account deletion to set a `deletion_requested_at` flag on profiles (or call an edge function)

---

## Implementation Order

1. Database migration (notification_preferences, wishlists, realtime for messages)
2. Messaging inbox page + hook + realtime
3. Provider dashboard today's schedule
4. Notification preferences persistence
5. Service moderation page + routing
6. Service comparison modal
7. Wishlist persistence
8. UI refinements across all screens
9. Stripe integration (requires user enabling Stripe connector)

