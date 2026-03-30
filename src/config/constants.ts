/**
 * Centralized Application Constants
 * All constant values, enums, and configuration options
 */

// =============================================================================
// APPLICATION METADATA
// =============================================================================

export const APP_CONFIG = {
  name: 'Wakilni',
  description: 'Proxy pilgrimage services for Umrah, Hajj, and Ziyarat',
  version: '1.0.0',
  defaultLanguage: 'en' as const,
  supportedLanguages: ['en', 'ar'] as const,
  defaultCurrency: 'SAR',
  supportedCurrencies: ['SAR', 'USD', 'EUR', 'GBP'] as const,
} as const;

// =============================================================================
// USER ROLES & PERMISSIONS
// =============================================================================

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TRAVELER: 'traveler',
  PROVIDER: 'provider',
  VENDOR: 'vendor',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 5,
  admin: 4,
  vendor: 3,
  provider: 2,
  traveler: 1,
} as const;

export const ROLE_LABELS: Record<UserRole, { en: string; ar: string }> = {
  super_admin: { en: 'Super Admin', ar: 'المدير العام' },
  admin: { en: 'Admin', ar: 'مدير' },
  traveler: { en: 'Traveler', ar: 'مسافر' },
  provider: { en: 'Provider', ar: 'مزود خدمة' },
  vendor: { en: 'Vendor', ar: 'وكيل' },
} as const;

export const ROLE_PERMISSIONS = {
  super_admin: ['*'], // Full access
  admin: [
    'users:read', 'users:write',
    'providers:read', 'providers:write', 'providers:approve',
    'vendors:read', 'vendors:write', 'vendors:approve',
    'bookings:read', 'bookings:write', 'bookings:allocate',
    'donations:read', 'donations:allocate',
    'reports:read',
    'settings:read',
    'audit:read',
  ],
  vendor: [
    'providers:read', 'providers:manage:own',
    'bookings:read', 'bookings:manage', 'bookings:assign_provider',
    'services:read', 'services:write', 'services:create',
    'reports:read:own',
  ],
  provider: [
    'bookings:read:own', 'bookings:update:own',
    'services:read', 'services:write:own',
    'availability:write',
    'rituals:record',
    'reviews:read:own',
  ],
  traveler: [
    'bookings:read:own', 'bookings:create',
    'beneficiaries:read:own', 'beneficiaries:write:own',
    'services:read',
    'providers:read:public',
    'donations:create',
    'reviews:write',
  ],
} as const;

// =============================================================================
// SERVICE TYPES
// =============================================================================

export const SERVICE_TYPES = {
  UMRAH: 'umrah',
  HAJJ: 'hajj',
  ZIYARAT: 'ziyarat',
} as const;

export type ServiceType = typeof SERVICE_TYPES[keyof typeof SERVICE_TYPES];

export const SERVICE_TYPE_LABELS: Record<ServiceType, { en: string; ar: string }> = {
  umrah: { en: 'Umrah', ar: 'عمرة' },
  hajj: { en: 'Hajj', ar: 'حج' },
  ziyarat: { en: 'Ziyarat', ar: 'زيارة' },
} as const;

// =============================================================================
// BOOKING STATUSES
// =============================================================================

export const BOOKING_STATUSES = {
  PENDING: 'pending',
  ASSIGNED_TO_VENDOR: 'assigned_to_vendor',
  ASSIGNED_TO_PROVIDER: 'assigned_to_provider',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
} as const;

export type BookingStatus = typeof BOOKING_STATUSES[keyof typeof BOOKING_STATUSES];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, { en: string; ar: string }> = {
  pending: { en: 'Pending Admin Approval', ar: 'بانتظار موافقة الإدارة' },
  assigned_to_vendor: { en: 'Assigned to Vendor', ar: 'مُعيَّن للوكيل' },
  assigned_to_provider: { en: 'Assigned to Provider', ar: 'مُعيَّن لمقدم الخدمة' },
  accepted: { en: 'Accepted', ar: 'مقبول' },
  in_progress: { en: 'In Progress', ar: 'جاري التنفيذ' },
  completed: { en: 'Completed', ar: 'مكتمل' },
  cancelled: { en: 'Cancelled', ar: 'ملغي' },
  disputed: { en: 'Disputed', ar: 'متنازع عليه' },
} as const;

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'bg-warning/20 text-warning border-warning/30',
  assigned_to_vendor: 'bg-info/20 text-info border-info/30',
  assigned_to_provider: 'bg-accent/20 text-accent-foreground border-accent/30',
  accepted: 'bg-info/20 text-info border-info/30',
  in_progress: 'bg-primary/20 text-primary border-primary/30',
  completed: 'bg-success/20 text-success border-success/30',
  cancelled: 'bg-muted text-muted-foreground border-muted',
  disputed: 'bg-destructive/20 text-destructive border-destructive/30',
} as const;

// =============================================================================
// KYC STATUSES
// =============================================================================

export const KYC_STATUSES = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type KycStatus = typeof KYC_STATUSES[keyof typeof KYC_STATUSES];

export const KYC_STATUS_LABELS: Record<KycStatus, { en: string; ar: string }> = {
  pending: { en: 'Pending', ar: 'قيد الانتظار' },
  under_review: { en: 'Under Review', ar: 'قيد المراجعة' },
  approved: { en: 'Approved', ar: 'موافق عليه' },
  rejected: { en: 'Rejected', ar: 'مرفوض' },
} as const;

// =============================================================================
// BENEFICIARY STATUSES
// =============================================================================

export const BENEFICIARY_STATUSES = {
  DECEASED: 'deceased',
  SICK: 'sick',
  ELDERLY: 'elderly',
  DISABLED: 'disabled',
  OTHER: 'other',
} as const;

export type BeneficiaryStatus = typeof BENEFICIARY_STATUSES[keyof typeof BENEFICIARY_STATUSES];

export const BENEFICIARY_STATUS_LABELS: Record<BeneficiaryStatus, { en: string; ar: string }> = {
  deceased: { en: 'Deceased', ar: 'متوفى' },
  sick: { en: 'Sick', ar: 'مريض' },
  elderly: { en: 'Elderly', ar: 'كبير السن' },
  disabled: { en: 'Disabled', ar: 'ذوي احتياجات خاصة' },
  other: { en: 'Other', ar: 'أخرى' },
} as const;

// =============================================================================
// PILGRIM CERTIFICATION STATUSES
// =============================================================================

export const PILGRIM_STATUSES = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  VERIFIED: 'verified',
  SUSPENDED: 'suspended',
  INACTIVE: 'inactive',
} as const;

export type PilgrimStatus = typeof PILGRIM_STATUSES[keyof typeof PILGRIM_STATUSES];

// =============================================================================
// PAYMENT STATUSES
// =============================================================================

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUSES[keyof typeof PAYMENT_STATUSES];

// =============================================================================
// API ENDPOINTS (for edge functions)
// =============================================================================

export const API_ENDPOINTS = {
  CREATE_BOOKING: '/functions/v1/create-booking',
  // Add more edge function endpoints as needed
} as const;

// =============================================================================
// PAGINATION DEFAULTS
// =============================================================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100] as const,
  MAX_PAGE_SIZE: 100,
} as const;

// =============================================================================
// UI BREAKPOINTS (matches Tailwind config)
// =============================================================================

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1400,
} as const;

// =============================================================================
// RITUAL STEPS (for Umrah/Hajj)
// =============================================================================

export const UMRAH_RITUAL_STEPS = [
  { order: 1, key: 'ihram', en: 'Ihram', ar: 'الإحرام' },
  { order: 2, key: 'tawaf', en: 'Tawaf', ar: 'الطواف' },
  { order: 3, key: 'sai', en: 'Sa\'i', ar: 'السعي' },
  { order: 4, key: 'maqam_ibrahim', en: 'Maqam Ibrahim', ar: 'مقام إبراهيم' },
  { order: 5, key: 'zamzam', en: 'Zamzam Water', ar: 'ماء زمزم' },
  { order: 6, key: 'halq_taqsir', en: 'Halq/Taqsir', ar: 'الحلق/التقصير' },
  { order: 7, key: 'dua_completion', en: 'Completion Dua', ar: 'دعاء الختام' },
] as const;

export const HAJJ_RITUAL_STEPS = [
  { order: 1, key: 'ihram', en: 'Ihram', ar: 'الإحرام' },
  { order: 2, key: 'mina_8th', en: 'Day of Tarwiyah (Mina)', ar: 'يوم التروية (منى)' },
  { order: 3, key: 'arafat', en: 'Day of Arafah', ar: 'يوم عرفة' },
  { order: 4, key: 'muzdalifah', en: 'Muzdalifah', ar: 'المزدلفة' },
  { order: 5, key: 'rami_10th', en: 'Rami (10th)', ar: 'رمي الجمرات (10)' },
  { order: 6, key: 'sacrifice', en: 'Sacrifice', ar: 'الذبح' },
  { order: 7, key: 'halq', en: 'Halq/Taqsir', ar: 'الحلق/التقصير' },
  { order: 8, key: 'tawaf_ifadah', en: 'Tawaf al-Ifadah', ar: 'طواف الإفاضة' },
  { order: 9, key: 'sai', en: 'Sa\'i', ar: 'السعي' },
  { order: 10, key: 'mina_11_12_13', en: 'Days in Mina', ar: 'أيام منى' },
  { order: 11, key: 'tawaf_wada', en: 'Tawaf al-Wada', ar: 'طواف الوداع' },
] as const;

// =============================================================================
// STORAGE BUCKETS
// =============================================================================

export const STORAGE_BUCKETS = {
  PROOF_GALLERY: 'proof-gallery',
  AVATARS: 'avatars',
  DOCUMENTS: 'documents',
  KYC_DOCUMENTS: 'kyc-documents',
} as const;

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================

export const NOTIFICATION_TYPES = {
  BOOKING_CREATED: 'booking_created',
  BOOKING_ASSIGNED_TO_VENDOR: 'booking_assigned_to_vendor',
  BOOKING_ASSIGNED_TO_PROVIDER: 'booking_assigned_to_provider',
  BOOKING_ACCEPTED: 'booking_accepted',
  BOOKING_COMPLETED: 'booking_completed',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_REJECTED_BY_PROVIDER: 'booking_rejected_by_provider',
  KYC_APPROVED: 'kyc_approved',
  KYC_REJECTED: 'kyc_rejected',
  NEW_REVIEW: 'new_review',
  PAYMENT_RECEIVED: 'payment_received',
  SYSTEM_NOTICE: 'system_notice',
} as const;

// =============================================================================
// DATE/TIME FORMATS
// =============================================================================

export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
  INPUT: 'yyyy-MM-dd',
  TIME_ONLY: 'HH:mm',
} as const;

// =============================================================================
// VALIDATION RULES
// =============================================================================

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MAX_LENGTH: 100,
  BIO_MAX_LENGTH: 500,
  MESSAGE_MAX_LENGTH: 1000,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// =============================================================================
// GEOLOCATION (Holy sites coordinates for verification)
// =============================================================================

export const HOLY_SITES = {
  MASJID_AL_HARAM: { lat: 21.4225, lng: 39.8262, radius: 500 }, // 500m radius
  MASJID_AN_NABAWI: { lat: 24.4672, lng: 39.6111, radius: 400 },
  ARAFAT: { lat: 21.3549, lng: 39.9843, radius: 2000 },
  MINA: { lat: 21.4134, lng: 39.8933, radius: 1500 },
  MUZDALIFAH: { lat: 21.3817, lng: 39.9367, radius: 1500 },
} as const;
