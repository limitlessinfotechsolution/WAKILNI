

# Advanced Database System Improvements

## Overview

After a thorough audit of the database, here are the critical gaps and improvements needed to bring the system to production-grade quality.

---

## 1. Performance Indexes (Critical)

The database is missing indexes on almost every foreign key and frequently-queried column. This means every RLS policy check and every filtered query does a full table scan.

**Missing indexes to add:**

| Table | Column(s) | Reason |
|-------|-----------|--------|
| bookings | traveler_id | RLS checks, dashboard queries |
| bookings | provider_id | RLS checks, provider dashboard |
| bookings | service_id | Service lookup joins |
| bookings | status | Filtered queries by status |
| bookings | scheduled_date | Calendar/date range queries |
| booking_activities | booking_id | Timeline lookups |
| messages | sender_id, recipient_id | RLS checks on every message query |
| messages | booking_id | Conversation thread lookups |
| messages | is_read | Unread count queries |
| audit_logs | actor_id | Filter by admin |
| audit_logs | entity_type, entity_id | Filter by entity |
| audit_logs | created_at DESC | Chronological listing |
| beneficiaries | user_id | RLS checks |
| services | provider_id | Provider service listings |
| services | service_type | Filter by type |
| reviews | provider_id | Provider rating queries |
| reviews | reviewer_id | RLS checks |
| transactions | user_id | RLS checks |
| transactions | booking_id | Booking payment lookup |
| providers | kyc_status | KYC queue filtering |
| profiles | user_id | Already indexed (unique), good |
| user_roles | user_id | has_role() function calls on every RLS check |
| donation_allocations | donation_id, charity_request_id | Allocation joins |

---

## 2. Fix Audit Logging (Broken)

The `audit_logs` table has **no INSERT RLS policy**, which means every call to `logAuditAction()` from the frontend silently fails. Zero audit records exist in the database.

**Fix:** Add an INSERT policy allowing authenticated admins and super_admins to insert audit logs. Also add a server-side trigger to automatically log critical booking status changes, so audit logging doesn't depend solely on the frontend.

---

## 3. Auto-Update Provider Stats via Triggers

Currently, `providers.rating`, `providers.total_reviews`, and `providers.total_bookings` are manually managed and likely out of sync.

**Add triggers to:**
- Recalculate `rating` and `total_reviews` on reviews INSERT/UPDATE/DELETE
- Increment `total_bookings` when a booking status changes to 'completed'

---

## 4. Booking Status Transition Validation

Currently any status can be changed to any other status. Add a validation trigger to enforce valid transitions:

```text
pending -> accepted, cancelled
accepted -> in_progress, cancelled
in_progress -> completed, disputed
completed -> (terminal)
cancelled -> (terminal)
disputed -> completed, cancelled
```

This prevents invalid state changes like going from "completed" back to "pending".

---

## 5. Automatic Booking Activity Logging

Add a trigger on the `bookings` table that automatically inserts a record into `booking_activities` whenever the `status` column changes. This ensures a complete audit trail regardless of which client or edge function made the change.

---

## 6. Database Cleanup Functions

Add scheduled-ready cleanup functions:
- **Expired idempotency keys**: Delete keys older than 24 hours (function exists but no scheduled execution)
- **Old session cleanup**: Mark sessions older than 30 days as logged out
- **Stale notification cleanup**: Remove processed notifications older than 90 days

These can be called via a cron edge function later.

---

## 7. Materialized Stats View for Admin Dashboard

Create a materialized view for dashboard statistics to avoid expensive COUNT queries on every admin page load:

```text
- Total users by role
- Total bookings by status
- Revenue totals
- Active providers count
- Pending KYC count
```

---

## Technical Implementation

### Migration SQL Summary

One migration file containing:

1. ~25 CREATE INDEX statements for performance
2. Updated audit_logs INSERT policy for admins/super_admins + a service-role policy
3. Trigger function `update_provider_stats()` on reviews table
4. Trigger function `validate_booking_transition()` on bookings table
5. Trigger function `log_booking_status_change()` on bookings table
6. `cleanup_old_data()` function for maintenance
7. Materialized view `admin_dashboard_stats` with refresh function

### Frontend Changes

| File | Change |
|------|--------|
| `src/hooks/useAuditLogger.ts` | No change needed -- it will start working once INSERT policy is added |
| `src/hooks/useAdminStats.ts` | Update to query from materialized view for faster load |
| `src/pages/super-admin/AnalyticsPage.tsx` | Minor update to use new stats source |

### Edge Function (New)

| File | Purpose |
|------|---------|
| `supabase/functions/db-maintenance/index.ts` | Calls cleanup functions, can be triggered by cron or manually |

### Impact

- Query performance improvement across all RLS-protected tables (indexes)
- Audit trail starts actually recording (INSERT policy fix)
- Provider ratings stay accurate automatically (triggers)
- Invalid booking state transitions become impossible (validation)
- Admin dashboard loads faster (materialized view)
- Database stays clean over time (maintenance functions)

