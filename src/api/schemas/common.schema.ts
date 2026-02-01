/**
 * Common Validation Schemas
 * Shared schemas used across multiple domains
 */

import { z } from 'zod';

// =============================================================================
// PRIMITIVE SCHEMAS
// =============================================================================

export const UUIDSchema = z.string().uuid('Invalid UUID format');

export const EmailSchema = z.string().email('Invalid email format');

export const PhoneSchema = z.string().regex(
  /^\+?[1-9]\d{1,14}$/,
  'Invalid phone number format'
);

export const DateStringSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  'Invalid date format'
);

export const PositiveNumberSchema = z.number().positive('Must be a positive number');

export const NonEmptyStringSchema = z.string().min(1, 'Cannot be empty');

// =============================================================================
// PAGINATION SCHEMAS
// =============================================================================

export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

// =============================================================================
// FILTER SCHEMAS
// =============================================================================

export const DateRangeSchema = z.object({
  dateFrom: DateStringSchema.optional(),
  dateTo: DateStringSchema.optional(),
}).refine(
  (data) => {
    if (data.dateFrom && data.dateTo) {
      return new Date(data.dateFrom) <= new Date(data.dateTo);
    }
    return true;
  },
  { message: 'Start date must be before end date' }
);

export type DateRangeInput = z.infer<typeof DateRangeSchema>;

// =============================================================================
// STATUS SCHEMAS
// =============================================================================

export const BookingStatusSchema = z.enum([
  'pending',
  'accepted',
  'in_progress',
  'completed',
  'cancelled',
  'disputed',
]);

export type BookingStatus = z.infer<typeof BookingStatusSchema>;

export const KycStatusSchema = z.enum([
  'pending',
  'submitted',
  'approved',
  'rejected',
]);

export type KycStatus = z.infer<typeof KycStatusSchema>;

export const PaymentStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
]);

export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

// =============================================================================
// SERVICE TYPE SCHEMAS
// =============================================================================

export const ServiceTypeSchema = z.enum([
  'umrah_badal',
  'hajj_badal',
  'qurbani',
  'zakat',
  'sadaqah',
  'fidyah',
  'kaffarah',
  'aqiqah',
]);

export type ServiceType = z.infer<typeof ServiceTypeSchema>;

// =============================================================================
// CURRENCY SCHEMA
// =============================================================================

export const CurrencyCodeSchema = z.enum(['SAR', 'USD', 'EUR', 'GBP', 'AED']);

export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;

// =============================================================================
// ROLE SCHEMAS
// =============================================================================

export const AppRoleSchema = z.enum([
  'traveler',
  'provider',
  'vendor',
  'admin',
  'super_admin',
]);

export type AppRole = z.infer<typeof AppRoleSchema>;
