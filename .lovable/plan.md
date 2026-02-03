
# WAKILNI Improvements & Enhancements Implementation Plan
## Phase 1: Real Data Integration & Dashboard Enhancements

---

## Executive Summary

This implementation plan focuses on replacing mock data with real API integrations and enhancing the dashboard experience with live statistics.

---

## Implementation Batches

### Batch 1: New Hooks for Real Data (6 files)

**1.1 Prayer Times Hook**
- **File**: `src/hooks/usePrayerTimes.ts`
- **Purpose**: Integrate with Aladhan API for accurate prayer times
- **Features**:
  - Fetch prayer times based on user's geolocation
  - 24-hour caching to minimize API calls
  - Countdown timer to next prayer
  - Fallback to Makkah times if API fails
  - Automatic "passed" status updates

**1.2 Hijri Date Hook**
- **File**: `src/hooks/useHijriDate.ts`
- **Purpose**: Convert Gregorian to Hijri dates via API
- **Features**:
  - Accurate Hijri date calculation via Aladhan API
  - Islamic holiday detection (Eid, Ramadan, etc.)
  - Arabic/English month names
  - Weekday information
  - 1-hour cache for efficiency

**1.3 Qibla Direction Hook**
- **File**: `src/hooks/useQiblaDirection.ts`
- **Purpose**: Calculate Qibla direction with compass integration
- **Features**:
  - Great circle bearing calculation to Kaaba
  - Device compass integration (where supported)
  - iOS 13+ permission handling
  - Relative direction calculation
  - Cardinal direction text (N, NE, E, etc.)

**1.4 Traveler Stats Hook**
- **File**: `src/hooks/useTravelerStats.ts`
- **Purpose**: Fetch real booking/beneficiary counts
- **Features**:
  - Active bookings count (accepted + in_progress)
  - Completed bookings count
  - Beneficiaries count
  - Total spent calculation
  - TanStack Query with 5-minute stale time

**1.5 Provider Stats Hook**
- **File**: `src/hooks/useProviderStats.ts`
- **Purpose**: Fetch real provider earnings and performance
- **Features**:
  - Monthly/total earnings calculation
  - Month-over-month growth percentage
  - 12-month earnings trend for sparkline
  - Completion rate calculation
  - Average rating from reviews

---

### Batch 2: Update TravelerWidgets with Real Data

**File**: `src/components/dashboard/TravelerWidgets.tsx`

**Changes**:

1. **PrayerTimeWidget**: Replace mock data with `usePrayerTimes()` hook
   - Show loading skeleton while fetching
   - Display countdown to next prayer
   - Mark passed prayers with opacity
   - Show location name

2. **HijriDateWidget**: Replace hardcoded date with `useHijriDate()` hook
   - Show real Hijri day, month, year
   - Display holiday name if applicable
   - Bilingual support (Arabic/English)

3. **QiblaWidget**: Implement real compass
   - Show Qibla bearing in degrees
   - Animate compass needle when device supported
   - Fallback to static direction text
   - "Tap to enable compass" button

---

### Batch 3: Update Traveler Dashboard with Live Stats

**File**: `src/pages/dashboard/TravelerDashboard.tsx`

**Changes**:

1. **StatCards**: Replace "0" values with real data
   - Active bookings from `useTravelerStats()`
   - Completed bookings count
   - Beneficiaries count

2. **Recent Bookings Section**: Show actual bookings
   - Integrate with `useBookings()` hook
   - Display 3 most recent bookings
   - Link to booking detail page

---

### Batch 4: Update Provider Dashboard with Live Stats

**File**: `src/pages/dashboard/ProviderDashboard.tsx`

**Changes**:

1. **Earnings Card**: Replace mock earnings
   - Real monthly earnings from `useProviderStats()`
   - Actual growth percentage
   - Real sparkline data from 12-month history

2. **Performance Rings**: Real data
   - Actual completion rate
   - Real average rating
   - True booking count

3. **Today's Schedule**: Query today's bookings
   - Filter bookings by today's date
   - Show time-sorted list

---

### Batch 5: Stripe Webhook Edge Function

**File**: `supabase/functions/stripe-webhook/index.ts`

**Purpose**: Handle Stripe payment confirmations

**Flow**:
```text
1. Verify Stripe signature
2. Parse event type (payment_intent.succeeded, etc.)
3. Find booking by payment_intent_id
4. Update transaction status to 'completed'
5. Update booking status to 'accepted'
6. Create notification for traveler
7. Log to audit_logs
```

**Required Secrets**: `STRIPE_WEBHOOK_SECRET`

---

### Batch 6: Test Coverage

**File**: `src/tests/api/services.test.ts`

Add tests for:
- Prayer times API caching
- Stats calculation accuracy
- Qibla direction math

---

## Files to Create

```text
src/hooks/usePrayerTimes.ts      # Prayer times from Aladhan API
src/hooks/useHijriDate.ts        # Hijri date conversion
src/hooks/useQiblaDirection.ts   # Qibla compass direction
src/hooks/useTravelerStats.ts    # Real traveler statistics
src/hooks/useProviderStats.ts    # Real provider statistics
supabase/functions/stripe-webhook/index.ts  # Payment webhook
```

## Files to Modify

```text
src/components/dashboard/TravelerWidgets.tsx  # Use real prayer/Hijri data
src/pages/dashboard/TravelerDashboard.tsx     # Use real stats
src/pages/dashboard/ProviderDashboard.tsx     # Use real earnings
src/tests/api/services.test.ts                # Add hook tests
```

---

## Technical Implementation Details

### Prayer Times API Integration

```typescript
// API Call
const response = await fetch(
  `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=4`
);

// Caching Strategy
localStorage.setItem('wakilni_prayer_times', JSON.stringify({
  data: timings,
  timestamp: Date.now(),
  location: { lat, lng },
}));
```

### Stats Calculation

```typescript
// Traveler Stats Query
const { count: activeBookings } = await supabase
  .from('bookings')
  .select('id', { count: 'exact', head: true })
  .eq('traveler_id', user.id)
  .in('status', ['accepted', 'in_progress']);
```

### Qibla Calculation

```typescript
// Great Circle Bearing Formula
const y = Math.sin(dLng);
const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLng);
const bearing = Math.atan2(y, x) * (180 / Math.PI);
```

---

## Implementation Order

1. Create new hooks (usePrayerTimes, useHijriDate, useQiblaDirection)
2. Create stats hooks (useTravelerStats, useProviderStats)
3. Update TravelerWidgets to use new hooks
4. Update TravelerDashboard with live stats
5. Update ProviderDashboard with real earnings
6. Create Stripe webhook handler
7. Add tests

---

## Success Criteria

- Prayer times show accurate times for user's location
- Hijri date is accurate and shows holidays
- Qibla compass animates with device orientation
- Dashboard stats reflect actual database counts
- Provider earnings show real transaction amounts
- Stripe webhook processes payment confirmations
- All existing tests continue to pass
