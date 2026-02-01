/**
 * Payment Validation Schemas
 * Request/response validation for payment operations
 */

import { z } from 'zod';
import {
  UUIDSchema,
  PositiveNumberSchema,
  CurrencyCodeSchema,
  PaymentStatusSchema,
} from './common.schema';

// =============================================================================
// IDEMPOTENCY KEY SCHEMA
// =============================================================================

export const IdempotencyKeySchema = z.string()
  .min(16, 'Idempotency key too short')
  .max(64, 'Idempotency key too long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid idempotency key format');

// =============================================================================
// PROCESS PAYMENT SCHEMAS
// =============================================================================

export const ProcessPaymentRequestSchema = z.object({
  booking_id: UUIDSchema,
  amount: PositiveNumberSchema,
  currency: CurrencyCodeSchema.default('SAR'),
  payment_method: z.enum(['card', 'bank_transfer', 'wallet']).default('card'),
  idempotency_key: IdempotencyKeySchema,
  metadata: z.record(z.string()).optional(),
});

export type ProcessPaymentRequest = z.infer<typeof ProcessPaymentRequestSchema>;

export const ProcessPaymentResponseSchema = z.object({
  transaction_id: UUIDSchema,
  status: PaymentStatusSchema,
  amount: PositiveNumberSchema,
  currency: CurrencyCodeSchema,
  payment_reference: z.string().optional(),
  processed_at: z.string().datetime(),
});

export type ProcessPaymentResponse = z.infer<typeof ProcessPaymentResponseSchema>;

// =============================================================================
// DONATION SCHEMAS
// =============================================================================

export const CreateDonationSchema = z.object({
  amount: PositiveNumberSchema.min(1, 'Minimum donation is 1'),
  currency: CurrencyCodeSchema.default('SAR'),
  donor_name: z.string().max(100).optional(),
  donor_email: z.string().email().optional(),
  is_anonymous: z.boolean().default(false),
  message: z.string().max(500).optional(),
  is_recurring: z.boolean().default(false),
  recurring_interval: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
  service_type: z.enum(['zakat', 'sadaqah', 'qurbani', 'general']).optional(),
  idempotency_key: IdempotencyKeySchema.optional(),
});

export type CreateDonationRequest = z.infer<typeof CreateDonationSchema>;

// =============================================================================
// REFUND SCHEMAS
// =============================================================================

export const RefundRequestSchema = z.object({
  transaction_id: UUIDSchema,
  amount: PositiveNumberSchema.optional(), // If not provided, full refund
  reason: z.string().max(500),
  idempotency_key: IdempotencyKeySchema,
});

export type RefundRequest = z.infer<typeof RefundRequestSchema>;

// =============================================================================
// TRANSACTION QUERY SCHEMAS
// =============================================================================

export const TransactionQuerySchema = z.object({
  booking_id: UUIDSchema.optional(),
  user_id: UUIDSchema.optional(),
  status: PaymentStatusSchema.optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  page_size: z.number().int().positive().max(100).default(10),
});

export type TransactionQuery = z.infer<typeof TransactionQuerySchema>;

// =============================================================================
// WEBHOOK SCHEMAS
// =============================================================================

export const StripeWebhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  created: z.number(),
  data: z.object({
    object: z.record(z.unknown()),
  }),
  livemode: z.boolean(),
});

export type StripeWebhookEvent = z.infer<typeof StripeWebhookEventSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

export function validateProcessPayment(data: unknown): ProcessPaymentRequest {
  return ProcessPaymentRequestSchema.parse(data);
}

export function validateDonation(data: unknown): CreateDonationRequest {
  return CreateDonationSchema.parse(data);
}

export function validateRefundRequest(data: unknown): RefundRequest {
  return RefundRequestSchema.parse(data);
}

export function safeValidatePayment(data: unknown) {
  return ProcessPaymentRequestSchema.safeParse(data);
}

export function safeValidateDonation(data: unknown) {
  return CreateDonationSchema.safeParse(data);
}

// =============================================================================
// IDEMPOTENCY KEY GENERATOR
// =============================================================================

export function generateIdempotencyKey(prefix: string = 'pay'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${prefix}_${timestamp}_${random}`;
}
