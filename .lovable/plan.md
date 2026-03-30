

# Multi-Level Service Booking & Assignment System

## Current State
- **Booking statuses**: `pending`, `accepted`, `in_progress`, `completed`, `cancelled`, `disputed`
- **Flow**: Customer → booking created with `pending` → Admin assigns directly to Provider → Provider works
- **Missing**: No `vendor_id` on bookings/services, no `assigned_to_vendor`/`assigned_to_provider` statuses, no vendor-provider relationship table, vendors can't assign providers

## Changes

### 1. Database Migration

**A. Add new booking statuses to `booking_status` enum:**
- `assigned_to_vendor`
- `assigned_to_provider`

**B. Add `vendor_id` column to `bookings` table** (UUID, nullable)

**C. Add `vendor_id` column to `services` table** (UUID, nullable) — links services to vendor ownership

**D. Create `vendor_providers` table** — links providers to vendors:
- `id`, `vendor_id`, `provider_id`, `created_at`
- Unique constraint on (vendor_id, provider_id)
- RLS: vendors manage their own; admins/super_admins full access

**E. Update `validate_booking_transition()` function** — new state machine:
```text
pending → assigned_to_vendor / cancelled
assigned_to_vendor → assigned_to_provider / cancelled
assigned_to_provider → in_progress / cancelled
in_progress → completed / disputed
disputed → completed / cancelled
```
Super Admin bypass: skip validation if caller is super_admin.

**F. RLS policies on bookings for vendors:**
- Vendors can SELECT bookings where `vendor_id` matches their vendor record
- Vendors can UPDATE bookings assigned to them (to set provider)

**G. RLS on services for vendors:**
- Vendors can manage services where `vendor_id` matches their vendor record

### 2. Constants & Types (`src/config/constants.ts`)

Add `ASSIGNED_TO_VENDOR` and `ASSIGNED_TO_PROVIDER` to `BOOKING_STATUSES`, labels, and colors.

Update `ROLE_PERMISSIONS` for vendor:
- Add `services:write`, `services:create`, `providers:manage:own`, `bookings:assign_provider`

### 3. Edge Function: `create-booking`

- Remove direct `provider_id` assignment at creation — bookings start as `pending` with no provider
- Keep `service_id` lookup for pricing; store `vendor_id` from the service if present

### 4. Hook: `useBookingAllocations.ts` (Admin)

- Add `availableVendors` fetch from `vendors` table (active, approved)
- New `assignToVendor(bookingId, vendorId)` — sets `bookings.vendor_id`, status → `assigned_to_vendor`, creates allocation record
- Keep `assignToProvider` for Super Admin direct bypass
- Log all assignments to `booking_activities`

### 5. Hook: `useVendor.ts` (Vendor)

- Add `vendorProviders` state — fetch from `vendor_providers` join `providers`
- Add `assignToProvider(bookingId, providerId)` — validates provider belongs to vendor, sets `bookings.provider_id`, status → `assigned_to_provider`
- Add `linkProvider(providerId)` / `unlinkProvider(providerId)` for managing vendor-provider relationships
- Update `fetchBookings` to query bookings by `vendor_id` directly (not just allocations)

### 6. Hook: `useProviderBookings.ts` (Provider)

- Add `acceptBooking(bookingId)` — status `assigned_to_provider` → `in_progress`
- Add `rejectBooking(bookingId)` — status back to `assigned_to_vendor` (returns to vendor)
- Existing `updateBookingStatus` handles `in_progress` → `completed`

### 7. UI: `BookingAllocationPage.tsx` (Admin)

- Add "Assign to Vendor" button alongside existing "Assign to Provider"
- Vendor dropdown selection with available vendors
- Show current assignment stage in status badges (Pending → Assigned to Vendor → etc.)
- Super Admin sees both vendor and direct provider assignment options

### 8. UI: `VendorBookingsPage.tsx` (Vendor)

- Show bookings where status = `assigned_to_vendor`
- Add "Assign to Provider" action with dropdown of vendor's linked providers
- Show assignment history per booking
- Add provider management section (link/unlink providers)

### 9. UI: `VendorServicesPage.tsx` (Vendor)

- Wire service creation with `vendor_id` automatically set
- Allow vendor to assign providers to services via `vendor_providers`

### 10. Notifications

- Insert notification when Admin assigns to Vendor (`assigned_to_vendor`)
- Insert notification when Vendor assigns to Provider (`assigned_to_provider`)
- Insert notification when Provider accepts/rejects

### 11. Status Flow Display

Update `LiveStatusTracker`, badge components, and booking detail pages to show:
```text
Pending → Assigned to Vendor → Assigned to Provider → In Progress → Completed
```

## Implementation Order

1. Database migration (enum, columns, table, trigger, RLS)
2. Update constants and schemas
3. Update `create-booking` edge function
4. Admin allocation hook + page (vendor assignment)
5. Vendor hook + bookings page (provider assignment + provider management)
6. Provider hook (accept/reject)
7. Service-vendor linking
8. Notifications
9. Status display updates across all pages

## Files Changed

| File | Change |
|------|--------|
| New migration SQL | Enum, columns, vendor_providers table, trigger, RLS |
| `src/config/constants.ts` | New statuses, labels, colors, permissions |
| `supabase/functions/create-booking/index.ts` | Remove direct provider_id, add vendor_id from service |
| `src/hooks/useBookingAllocations.ts` | Add vendor assignment flow |
| `src/hooks/useVendor.ts` | Provider assignment, vendor-provider management |
| `src/hooks/useProviderBookings.ts` | Accept/reject logic |
| `src/pages/admin/BookingAllocationPage.tsx` | Vendor assignment UI |
| `src/pages/vendor/VendorBookingsPage.tsx` | Provider assignment UI |
| `src/pages/vendor/VendorServicesPage.tsx` | Vendor-service linking |
| `src/components/booking/LiveStatusTracker.tsx` | New status steps |
| `src/api/schemas/booking.schema.ts` | New status values |
| `src/api/services/bookings.service.ts` | New status types |

