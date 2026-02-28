

# Wakilni — Complete Project Audit & Remaining Tasks

---

## A. MISSING STORAGE BUCKETS

The code references storage buckets that don't exist in the backend:

| Bucket | Used In | Status |
|--------|---------|--------|
| `avatars` | ProfileSettingsPage avatar upload | **Missing** — uploads silently fail |
| `documents` | Constants reference | **Missing** |
| `kyc-documents` | Constants reference | **Missing** |
| `proof-gallery` | Exists | OK |
| `service-images` | Exists | OK |

**Fix**: Create `avatars`, `documents`, and `kyc-documents` storage buckets with appropriate RLS policies.

---

## B. MOCK/HARDCODED DATA (Must Replace with Real Queries)

| File | Issue |
|------|-------|
| `VendorDashboard.tsx` | Mock sparkline arrays (`revenueSparkline`, `bookingsSparkline`) — hardcoded, not from DB |
| `VendorDashboard.tsx` | Hardcoded "+18% vs last month" growth |
| `AnalyticsPage.tsx` | `mockBookingTrends`, `mockRevenueData`, `mockUserGrowth` — entire charts are fake |
| `DonatePage.tsx` | `CHARITY_STATS` mock object — `totalRaised`, `beneficiariesHelped` are hardcoded |
| `AdminDashboard.tsx` | "Approved KYC: 0", "Active bookings: 0", "Charity Requests/Fulfilled: 0" — hardcoded zeros instead of real counts |
| `VendorSubscriptionPage.tsx` | Subscription upgrade is mocked — no real payment integration |
| `PilgrimCertificationForm.tsx` | Upload handlers are mocked ("will be connected to real storage later") |

---

## C. MISSING EDGE FUNCTIONS / API LOGIC

| Feature | Status |
|---------|--------|
| **Email notifications** | No email sending — notification_queue table exists but nothing processes it |
| **Payment gateway** | `process-payment` edge function exists but has no real payment provider (Stripe/Tap) integration |
| **Subscription billing** | Vendor subscription plans have no payment processing — just updates a DB field |
| **Data export** | Profile settings "Export Data" button shows a toast but does nothing real |
| **Account deletion** | "Delete Account" shows a toast but doesn't actually delete anything |
| **Forgot password** | Page exists — need to verify it actually sends reset emails |
| **Certificate PDF generation** | `CompletionCertificate` renders in-browser but `downloadDocument.ts` may not produce real PDFs |

---

## D. MISSING PAGES / INCOMPLETE SCREENS

| Page | Issue |
|------|-------|
| **Messaging/Chat** | `BookingMessages` component exists, `messages` table exists, but there's no dedicated messaging page or inbox |
| **Admin Recent Activity** | AdminDashboard shows "No recent activity" — should query `audit_logs` or `booking_activities` |
| **Provider Today's Schedule** | ProviderDashboard shows "No bookings today" placeholder — should query real bookings by `scheduled_date = today` |
| **Compare Services** | Compare button on ServicesPage collects IDs but clicking "Compare (N)" does nothing |
| **Wishlist** | Wishlist toggle on ServicesPage is client-side only — not persisted |
| **Vendor Team Management** | "Team" link goes to `/vendor/kyc` instead of a dedicated team page |
| **Provider Gallery** | `GalleryPage` exists but need to verify it's functional with real service images |

---

## E. PROCESS / LOGIC GAPS

| Process | Gap |
|---------|-----|
| **Booking cancellation** | No UI for traveler to cancel a pending booking |
| **Provider accept/reject** | No UI for provider to accept or reject an assigned booking |
| **Dispute resolution** | No admin UI to resolve disputed bookings |
| **Notification preferences** | Save button in settings does a `setTimeout` — not persisted to DB |
| **Real-time updates** | `messages` table not added to `supabase_realtime` publication — no live chat |
| **Booking search by provider** | Provider bookings hook `useProviderBookings` may not filter by provider's own bookings correctly |
| **Service moderation** | Services have `moderation_status` field but no admin moderation queue page |

---

## F. DATABASE TRIGGERS NOT DEPLOYED

The audit shows triggers were created in migration SQL, but the `<db-triggers>` section shows: **"There are no triggers in the database."** This means either:
- Migrations failed silently, OR
- Triggers were dropped

**Affected triggers that should exist:**
- `trg_validate_booking_transition` on bookings
- `trg_log_booking_status_change` on bookings
- `trg_update_provider_stats` on reviews
- `trg_rate_limit_bookings` on bookings
- `trg_rate_limit_messages` on messages
- `trg_rate_limit_donations` on donations
- `generate_display_id` on user_roles

**This is critical** — without these triggers, booking validation, rate limiting, and provider stats are non-functional.

---

## G. UI/UX REMAINING ITEMS

| Item | Detail |
|------|--------|
| **No loading state on login** | Login redirects but no route-level transition animation |
| **Password reset flow** | `ForgotPasswordPage` exists but needs end-to-end verification |
| **Empty service browse** | If no services exist, users see "No Services Available" — need seed data or provider onboarding guidance |
| **Biometric login** | Button exists on login page but is disabled/visual only |
| **Dark mode persistence** | Theme toggle exists but verify it persists across sessions |
| **RTL layout testing** | Arabic layout is implemented but needs thorough end-to-end RTL testing |

---

## H. RECOMMENDED IMPLEMENTATION PRIORITY

### Phase 1 — Critical (Broken/Non-functional)
1. **Verify and redeploy database triggers** — all rate limiting, validation, and auto-logging are offline
2. **Create missing storage buckets** (avatars, kyc-documents, documents)
3. **Replace mock data** in VendorDashboard, AnalyticsPage, DonatePage with real DB queries
4. **Enable realtime** on messages table for live chat
5. **Wire Admin Recent Activity** to query audit_logs/booking_activities

### Phase 2 — Core Features
6. **Add booking action buttons** — Provider accept/reject, Traveler cancel
7. **Build messaging inbox page** — dedicated chat/messages route
8. **Persist notification preferences** to database
9. **Wire data export** and account deletion to real backend logic
10. **Add service moderation queue** for admin

### Phase 3 — Enhancement
11. **Implement service comparison** modal with side-by-side view
12. **Add wishlist persistence** to database
13. **Build vendor team management** page
14. **Integrate real payment gateway** (Stripe or Tap)
15. **Add email notification processing** edge function

---

## I. FRONTEND FILE CHANGES SUMMARY

| File | Change Needed |
|------|--------------|
| `VendorDashboard.tsx` | Replace mock sparklines with real vendor booking/revenue queries |
| `AnalyticsPage.tsx` | Replace all mock chart data with real aggregate queries |
| `DonatePage.tsx` | Query real donation totals from DB |
| `AdminDashboard.tsx` | Wire "Recent Activity" section to audit_logs |
| `ProviderDashboard.tsx` | Wire "Today's Schedule" to bookings filtered by today |
| `ProfileSettingsPage.tsx` | Fix notification prefs save, wire data export and account deletion |
| `BookingDetailPage.tsx` | Add action buttons (accept/reject/cancel) based on user role and booking status |
| New: `src/pages/messages/InboxPage.tsx` | Messaging inbox for booking conversations |
| New: `src/pages/admin/ServiceModerationPage.tsx` | Service approval queue |

