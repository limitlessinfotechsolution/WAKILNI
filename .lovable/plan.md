
# Service Creation, Backend Fetch & API Enhancements
## Comprehensive Implementation Plan

---

## Current State Analysis

### What's Already Implemented

| Component | Status | Location |
|-----------|--------|----------|
| **Services Table** | Complete | `services` table with price, title, description, duration, includes, currency |
| **API Service Layer** | Solid | `src/api/services/services.service.ts` with CRUD operations |
| **Provider Hook** | Working | `src/hooks/useProviderServices.ts` for provider-specific services |
| **Public Hook** | Working | `src/hooks/useServices.ts` for browsing |
| **Service Form** | Basic | `src/components/provider/ServiceForm.tsx` with Zod validation |
| **Provider Services Page** | Enhanced | `src/pages/provider/ServicesPage.tsx` with premium UI |
| **Create Booking Edge Function** | Production-ready | Server-side price calculation, validation |

### Gaps Identified

| Gap | Impact | Priority |
|-----|--------|----------|
| No "includes" field in ServiceForm | Missing package details | High |
| No image upload for services | Visual appeal lacking | High |
| Services hook doesn't use centralized API | Code duplication | Medium |
| No service validation Edge Function | Relies on client-side only | Medium |
| No bulk service operations | Admin efficiency | Low |
| No service templates | Provider onboarding friction | Medium |
| Missing service analytics | Business insights gap | Low |

---

## Phase 1: Enhanced Service Form (High Priority)

### 1.1 Add "Includes" Field to ServiceForm

**File**: `src/components/provider/ServiceForm.tsx`

**Changes**:
- Add dynamic list field for "What's Included" items
- Support bilingual entries (English + Arabic)
- Add/remove capability with animations
- Common suggestions dropdown (e.g., "Transportation", "Accommodation", "Meals")

```typescript
// Schema addition
includes: z.array(z.object({
  en: z.string().min(1),
  ar: z.string().optional(),
})).optional(),
```

**UI Components**:
- Dynamic list with add/remove buttons
- Pre-defined suggestions as chips
- Character counter per item

### 1.2 Service Image Upload

**New Component**: `src/components/provider/ServiceImageUpload.tsx`

**Features**:
- Upload hero image for service
- Optional gallery (up to 4 images)
- Drag-and-drop support
- Image preview with crop
- Compression before upload
- Store in `service-images` storage bucket

**Database Migration**:
```sql
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS hero_image_url text,
ADD COLUMN IF NOT EXISTS gallery_urls jsonb DEFAULT '[]'::jsonb;
```

**Storage Bucket**:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true);
```

---

## Phase 2: Refactor Hooks to Use Centralized API

### 2.1 Update useProviderServices Hook

**File**: `src/hooks/useProviderServices.ts`

**Changes**:
- Import from `@/api/services/services.service`
- Use TanStack Query instead of raw useState/useEffect
- Leverage centralized error handling
- Add optimistic updates

```typescript
// Before: Direct Supabase calls
const { data, error } = await supabase.from('services')...

// After: Centralized API
const result = await ServicesAPI.getProviderServices(providerId, true);
```

### 2.2 Update useServices Hook

**File**: `src/hooks/useServices.ts`

**Changes**:
- Use `ServicesAPI.getServices()` instead of direct Supabase
- Add proper typing from API layer
- Use TanStack Query with cache invalidation
- Support advanced filters

### 2.3 Create Unified Services Module

**File**: `src/modules/services/index.ts` (update existing)

**Exports**:
```typescript
export { useServices } from '@/hooks/useServices';
export { useProviderServices } from '@/hooks/useProviderServices';
export { useServiceById } from '@/hooks/useServiceById';
export * as ServicesAPI from '@/api/services/services.service';
export { ServiceForm } from '@/components/provider/ServiceForm';
export { ServiceCard } from '@/components/services/ServiceCard';
```

---

## Phase 3: Service Validation Schema

### 3.1 Centralized Service Schema

**File**: `src/api/schemas/service.schema.ts`

```typescript
export const ServiceCreateSchema = z.object({
  title: z.string().min(3).max(100),
  title_ar: z.string().max(100).optional(),
  description: z.string().min(20).max(2000),
  description_ar: z.string().max(2000).optional(),
  service_type: z.enum(['umrah', 'hajj', 'ziyarat']),
  price: z.number().min(1).max(1000000),
  currency: z.enum(['SAR', 'USD', 'EUR', 'GBP']).default('SAR'),
  duration_days: z.number().min(1).max(365).optional(),
  includes: z.array(z.object({
    en: z.string(),
    ar: z.string().optional(),
  })).optional(),
  is_active: z.boolean().default(true),
});

export const ServiceUpdateSchema = ServiceCreateSchema.partial();
```

### 3.2 Edge Function for Service CRUD

**File**: `supabase/functions/manage-service/index.ts`

**Purpose**: Server-side validation for service creation/updates

**Operations**:
- `POST /manage-service` - Create service (validates provider KYC status)
- `PUT /manage-service/:id` - Update service (validates ownership)
- `DELETE /manage-service/:id` - Soft delete (checks for active bookings)

**Security**:
- Verify provider owns the service
- Check KYC is approved before allowing creation
- Prevent deletion if active bookings exist
- Audit log all changes

---

## Phase 4: Enhanced Service Card Component

### 4.1 Reusable ServiceCard Component

**File**: `src/components/services/ServiceCard.tsx`

**Features**:
- Hero image with fallback gradient
- Provider avatar and rating
- Price formatting with currency
- Duration badge
- Service type indicator
- "Includes" preview (first 3 items)
- Quick book button
- Wishlist toggle
- Compare checkbox

**Variants**:
- `grid` - For services browsing page
- `compact` - For dashboard widgets
- `detailed` - For provider management

### 4.2 Service Detail Dialog

**File**: `src/components/services/ServiceDetailDialog.tsx`

**Features**:
- Full gallery viewer
- Complete "includes" list
- Provider profile preview
- Recent reviews for this service
- Book now CTA
- Share button

---

## Phase 5: Service Templates (Provider Onboarding)

### 5.1 Pre-defined Templates

**File**: `src/config/service-templates.ts`

```typescript
export const SERVICE_TEMPLATES = {
  umrah_basic: {
    title: 'Basic Umrah Package',
    title_ar: 'باقة العمرة الأساسية',
    description: 'Complete Umrah ritual performed on your behalf...',
    service_type: 'umrah',
    duration_days: 1,
    includes: [
      { en: 'Complete Tawaf', ar: 'طواف كامل' },
      { en: 'Sa\'i between Safa and Marwa', ar: 'سعي بين الصفا والمروة' },
      { en: 'Ihram from Miqat', ar: 'إحرام من الميقات' },
      { en: 'Dua for beneficiary', ar: 'دعاء للمستفيد' },
      { en: 'Photo/Video proof', ar: 'إثبات بالصور والفيديو' },
    ],
    suggested_price: 500,
  },
  // ... more templates
};
```

### 5.2 Template Selection UI

**Component**: `src/components/provider/ServiceTemplateSelector.tsx`

**Flow**:
1. Provider clicks "Add Service"
2. Shows template selector modal
3. Provider picks template or "Start from scratch"
4. Form pre-fills with template data
5. Provider customizes and saves

---

## Phase 6: Admin Service Management

### 6.1 Admin Services Overview Page

**File**: `src/pages/admin/ServicesManagementPage.tsx`

**Features**:
- All services across all providers
- Filter by type, status, provider, price range
- Bulk approve/reject (for future moderation)
- Service analytics summary
- Flag inappropriate services
- Export to CSV

### 6.2 Service Moderation Queue

**Table Addition**:
```sql
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS moderated_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS moderated_at timestamptz,
ADD COLUMN IF NOT EXISTS rejection_reason text;
```

**Workflow**:
1. Provider creates service (status: pending)
2. Admin reviews in moderation queue
3. Admin approves or rejects with reason
4. Service becomes visible (if approved)

---

## Phase 7: API Response Standardization

### 7.1 Update All Service Endpoints

Ensure all service-related API calls return:

```typescript
{
  success: boolean,
  data: Service | Service[] | null,
  error: {
    code: 'SERVICE_001' | 'SERVICE_002' | ...,
    message: string,
    details?: string,
  } | null,
  meta: {
    timestamp: string,
    version: '2026-02-01',
    count?: number,
    page?: number,
  }
}
```

### 7.2 Service-Specific Error Codes

**File**: `src/api/errors.ts` (update)

```typescript
export const SERVICE_ERRORS = {
  SERVICE_001: { status: 404, message: 'Service not found' },
  SERVICE_002: { status: 400, message: 'Service is inactive' },
  SERVICE_003: { status: 403, message: 'Not authorized to modify this service' },
  SERVICE_004: { status: 400, message: 'Cannot delete service with active bookings' },
  SERVICE_005: { status: 400, message: 'Provider KYC not approved' },
  SERVICE_006: { status: 400, message: 'Invalid service data' },
};
```

---

## Files to Create

```text
New Files:
  src/components/provider/ServiceImageUpload.tsx
  src/components/provider/ServiceTemplateSelector.tsx
  src/components/services/ServiceCard.tsx
  src/components/services/ServiceDetailDialog.tsx
  src/api/schemas/service.schema.ts
  src/config/service-templates.ts
  src/hooks/useServiceById.ts
  src/pages/admin/ServicesManagementPage.tsx
  supabase/functions/manage-service/index.ts
```

## Files to Modify

```text
Modified Files:
  src/components/provider/ServiceForm.tsx (add includes, images)
  src/hooks/useProviderServices.ts (use centralized API)
  src/hooks/useServices.ts (use centralized API, TanStack Query)
  src/modules/services/index.ts (add new exports)
  src/api/errors.ts (add service error codes)
  src/api/index.ts (export service schemas)
```

---

## Database Migrations

### Migration 1: Service Enhancements
```sql
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS hero_image_url text,
ADD COLUMN IF NOT EXISTS gallery_urls jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS moderated_by uuid,
ADD COLUMN IF NOT EXISTS moderated_at timestamptz,
ADD COLUMN IF NOT EXISTS rejection_reason text;
```

### Migration 2: Service Images Storage Bucket
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy for service images
CREATE POLICY "Providers can upload service images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'service-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Anyone can view service images"
ON storage.objects FOR SELECT
USING (bucket_id = 'service-images');
```

---

## Implementation Priority

| Phase | Task | Priority | Effort |
|-------|------|----------|--------|
| 1 | Enhanced ServiceForm with includes | P1 | 3 hrs |
| 1 | Service image upload | P1 | 4 hrs |
| 2 | Refactor useProviderServices | P2 | 2 hrs |
| 2 | Refactor useServices | P2 | 2 hrs |
| 3 | Service validation schema | P2 | 1 hr |
| 3 | manage-service Edge Function | P2 | 4 hrs |
| 4 | ServiceCard component | P1 | 3 hrs |
| 4 | ServiceDetailDialog | P2 | 2 hrs |
| 5 | Service templates | P3 | 3 hrs |
| 6 | Admin services page | P3 | 4 hrs |
| 7 | API standardization | P2 | 2 hrs |

---

## Success Metrics

After implementation:
- Providers can add rich service descriptions with "includes" list
- Service images display in browsing and detail views
- All service hooks use centralized API layer
- Server-side validation for all service mutations
- Admin can moderate and manage services across providers
- Reusable ServiceCard component used consistently
- Service templates reduce provider onboarding time
