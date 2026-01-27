

# Wakilni — Full Platform Implementation Plan

A faith-first, accessible platform enabling authorized proxies to perform Hajj & Umrah on behalf of those who cannot attend personally.

---

## Design Vision

**Faith-Inspired Premium Design**
- Deep, rich color palette: emerald greens, warm golds, and cream backgrounds
- Subtle Islamic geometric patterns as decorative elements
- Elegant Arabic typography paired with clean English fonts
- Generous whitespace and premium feel that conveys trust and spiritual significance
- Full RTL support with seamless Arabic ↔ English toggle

---

## Phase 1: Foundation & Core Setup

### 1.1 Design System & Layout
- Premium component library with faith-inspired styling
- Responsive layout system (mobile-first, works beautifully on all devices)
- Bilingual infrastructure: Arabic (RTL) and English (LTR) with instant language switching
- Shared navigation with role-based menu items
- Accessible design following WCAG AA guidelines

### 1.2 Authentication System
- Multi-method signup/login:
  - Email & password
  - Phone number with SMS OTP verification
  - Google Sign-in
- Role selection during onboarding (Traveler or Provider)
- Phone verification for all users (required for bookings)
- Profile management with ID document upload capability

### 1.3 Database Schema
- Users table (core identity, linked to Supabase Auth)
- Separate user_roles table for RBAC (Admin, Traveler, Provider)
- Beneficiaries table (people receiving proxy services)
- Providers table (certified service providers with KYC status)
- Services table (Umrah, Hajj, Ziyarat offerings)
- Bookings table with full lifecycle status tracking
- Transactions table (payment records)
- Booking activities table (audit trail)
- Reviews table (post-service feedback)
- Messages table (in-app communication)

---

## Phase 2: Traveler Experience

### 2.1 Traveler Dashboard
- Overview of active and past bookings
- Quick stats: bookings in progress, completed pilgrimages
- Recent activity feed
- Quick action buttons for common tasks

### 2.2 Beneficiary Management
- Add/edit beneficiaries (name, date of birth, nationality, status)
- Status categories: deceased, sick, elderly, disabled, other
- Document upload for verification (ID, medical certificates)
- Beneficiary listing with search and filters

### 2.3 Service Discovery
- Browse available services (Umrah, Hajj, Ziyarat)
- Filter by service type, price range, provider rating
- Provider profiles with certifications and reviews
- Service detail pages with full description and pricing

### 2.4 Booking Creation Wizard
- Step-by-step guided flow:
  1. Select service type
  2. Choose a provider (with ratings and reviews)
  3. Select or add beneficiary
  4. Add special requests (wheelchair, medical assistance, etc.)
  5. Review and confirm
- Payment UI (mock Stripe integration, ready for real integration)
- Booking confirmation with summary

### 2.5 Booking Tracking
- Real-time status updates (Pending → Accepted → In Progress → Completed)
- Activity timeline showing all booking events
- Provider proof gallery (photos from the rites)
- In-app messaging with provider

---

## Phase 3: Provider Experience

### 3.1 Provider Onboarding & KYC
- Provider registration with company details
- Certification upload (religious training, licenses)
- KYC status tracking (Pending → Under Review → Approved/Rejected)
- Profile completion progress indicator

### 3.2 Provider Dashboard
- Incoming booking requests
- Active bookings with status
- Earnings overview
- Performance metrics (rating, completion rate)

### 3.3 Service Management
- Create/edit service offerings
- Set pricing and duration
- Manage availability calendar
- Service capacity controls

### 3.4 Booking Execution Flow
- View incoming requests with beneficiary details
- Accept or decline with reason
- Status update workflow (mark as in progress, complete stages)
- Proof upload (photos, videos from holy sites)
- Mark as completed with summary

### 3.5 Communication
- In-app messaging with travelers
- Notification center for booking updates

---

## Phase 4: Admin Console

### 4.1 Admin Dashboard
- Platform-wide analytics (bookings today, this month, revenue)
- Key metrics visualized with charts
- Recent activity across the platform
- Alert indicators for items needing attention

### 4.2 KYC & Provider Verification
- Provider applications queue
- Document review interface
- Approve/reject with feedback
- Verification status management

### 4.3 Booking Oversight
- All bookings list with advanced filters
- Booking detail view with full audit trail
- Status override capability for disputes
- Manual assignment if provider unavailable

### 4.4 User Management
- User search and listing
- Role management
- Account status (active, suspended)
- User detail view with activity history

### 4.5 Dispute Resolution
- Flagged bookings queue
- Communication thread view
- Resolution actions and notes

---

## Phase 5: Platform Features

### 5.1 In-App Messaging
- Real-time messaging between Travelers ↔ Providers
- Admin can join any conversation
- Message history tied to bookings
- Push notification for new messages

### 5.2 Notification System
- Push notifications (browser)
- In-app notification center
- Email notifications for critical events
- Notification preferences per user

### 5.3 Reviews & Ratings
- Post-booking review prompt
- Star rating (1-5) with written comment
- Provider rating aggregation
- Review display on provider profiles

### 5.4 Basic Analytics (Admin)
- Booking counts over time
- Revenue tracking
- Provider performance rankings
- Completion rates and average times

---

## Phase 6: Polish & Accessibility

### 6.1 Accessibility Compliance
- WCAG AA for all critical flows
- Keyboard navigation support
- Screen reader compatibility
- Large text and high contrast options

### 6.2 Performance Optimization
- Lazy loading for images and heavy content
- Optimized database queries
- Caching strategy for frequently accessed data

### 6.3 Error Handling & Feedback
- Friendly error messages in both languages
- Loading states and progress indicators
- Toast notifications for actions
- Empty states with helpful guidance

---

## Security & Compliance

- Row-Level Security (RLS) on all tables
- Separate user_roles table to prevent privilege escalation
- Audit trail for all booking state changes
- Secure file storage for documents
- Phone verification for transaction security

---

## What's Included

| Feature | Status |
|---------|--------|
| User registration & verification | ✅ Included |
| Provider KYC workflow | ✅ Included |
| Create proxy bookings | ✅ Included |
| Full booking lifecycle | ✅ Included |
| Payment UI (mock Stripe) | ✅ Included |
| Real-time status updates | ✅ Included |
| In-app messaging | ✅ Included |
| Admin console | ✅ Included |
| Basic analytics | ✅ Included |
| Arabic & English + RTL | ✅ Included |
| Stripe integration | 🔌 Ready (connect later) |

---

## Future Enhancements (v1.x)

- Digital permit / proof-of-performance card
- Live geo-tracking during rites
- Donation flows and charity integration
- Hajj season scheduling with capacity controls
- PWA for mobile installation

