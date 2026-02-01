/**
 * Booking Validation Schemas
 * Request/response validation for booking operations
 */

import { z } from 'zod';
import {
  UUIDSchema,
  DateStringSchema,
  BookingStatusSchema,
  PaginationSchema,
  DateRangeSchema,
  ServiceTypeSchema,
} from './common.schema';

// =============================================================================
// CREATE BOOKING SCHEMAS
// =============================================================================

export const CreateBookingRequestSchema = z.object({
  service_id: UUIDSchema,
  beneficiary_id: UUIDSchema,
  scheduled_date: DateStringSchema.nullable().optional(),
  special_requests: z.string().max(1000, 'Special requests too long').nullable().optional(),
});

export type CreateBookingRequest = z.infer<typeof CreateBookingRequestSchema>;

// =============================================================================
// UPDATE BOOKING SCHEMAS
// =============================================================================

export const UpdateBookingStatusSchema = z.object({
  status: BookingStatusSchema,
  notes: z.string().max(500).optional(),
});

export type UpdateBookingStatusRequest = z.infer<typeof UpdateBookingStatusSchema>;

export const UpdateBookingSchema = z.object({
  scheduled_date: DateStringSchema.nullable().optional(),
  special_requests: z.string().max(1000).nullable().optional(),
  proof_gallery: z.array(z.string().url()).optional(),
});

export type UpdateBookingRequest = z.infer<typeof UpdateBookingSchema>;

// =============================================================================
// QUERY SCHEMAS
// =============================================================================

export const GetBookingsQuerySchema = z.object({
  status: BookingStatusSchema.optional(),
  service_type: ServiceTypeSchema.optional(),
  provider_id: UUIDSchema.optional(),
  dateFrom: DateStringSchema.optional(),
  dateTo: DateStringSchema.optional(),
}).merge(PaginationSchema);

export type GetBookingsQuery = z.infer<typeof GetBookingsQuerySchema>;

export const GetBookingByIdSchema = z.object({
  booking_id: UUIDSchema,
});

export type GetBookingByIdRequest = z.infer<typeof GetBookingByIdSchema>;

// =============================================================================
// PROVIDER BOOKING SCHEMAS
// =============================================================================

export const ProviderBookingsQuerySchema = z.object({
  status: BookingStatusSchema.optional(),
}).merge(PaginationSchema);

export type ProviderBookingsQuery = z.infer<typeof ProviderBookingsQuerySchema>;

export const AcceptBookingSchema = z.object({
  booking_id: UUIDSchema,
  estimated_completion: DateStringSchema.optional(),
  provider_notes: z.string().max(500).optional(),
});

export type AcceptBookingRequest = z.infer<typeof AcceptBookingSchema>;

// =============================================================================
// ADMIN BOOKING SCHEMAS
// =============================================================================

export const AdminBookingsFilterSchema = z.object({
  status: BookingStatusSchema.optional(),
  service_type: ServiceTypeSchema.optional(),
  provider_id: UUIDSchema.optional(),
  traveler_id: UUIDSchema.optional(),
  dateFrom: DateStringSchema.optional(),
  dateTo: DateStringSchema.optional(),
}).merge(PaginationSchema);

export type AdminBookingsFilter = z.infer<typeof AdminBookingsFilterSchema>;

export const AllocateBookingSchema = z.object({
  booking_id: UUIDSchema,
  provider_id: UUIDSchema,
  priority: z.number().int().min(1).max(10).default(5),
  notes: z.string().max(500).optional(),
});

export type AllocateBookingRequest = z.infer<typeof AllocateBookingSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

export function validateCreateBookingRequest(data: unknown): CreateBookingRequest {
  return CreateBookingRequestSchema.parse(data);
}

export function validateUpdateBookingStatus(data: unknown): UpdateBookingStatusRequest {
  return UpdateBookingStatusSchema.parse(data);
}

export function validateGetBookingsQuery(data: unknown): GetBookingsQuery {
  return GetBookingsQuerySchema.parse(data);
}

export function safeValidateCreateBooking(data: unknown) {
  return CreateBookingRequestSchema.safeParse(data);
}

export function safeValidateUpdateStatus(data: unknown) {
  return UpdateBookingStatusSchema.safeParse(data);
}
