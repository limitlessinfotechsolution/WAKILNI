/**
 * Service Validation Schemas
 * Centralized Zod schemas for service validation
 */

import { z } from 'zod';

// Service include item schema (bilingual)
export const ServiceIncludeSchema = z.object({
  en: z.string().min(1, 'English text is required').max(100),
  ar: z.string().max(100).optional(),
});

export type ServiceInclude = z.infer<typeof ServiceIncludeSchema>;

// Service type enum (matches database enum 'service_type')
const ServiceTypeEnumSchema = z.enum(['umrah', 'hajj', 'ziyarat']);

// Currency enum
export const CurrencySchema = z.enum(['SAR', 'USD', 'EUR', 'GBP']);
export type Currency = z.infer<typeof CurrencySchema>;

// Moderation status enum
export const ModerationStatusSchema = z.enum(['pending', 'approved', 'rejected']);
export type ModerationStatus = z.infer<typeof ModerationStatusSchema>;

// Create service schema
export const ServiceCreateSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be at most 100 characters'),
  title_ar: z.string().max(100).optional(),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be at most 2000 characters'),
  description_ar: z.string().max(2000).optional(),
  service_type: ServiceTypeEnumSchema,
  price: z.number()
    .min(1, 'Price must be at least 1')
    .max(1000000, 'Price cannot exceed 1,000,000'),
  currency: CurrencySchema.default('SAR'),
  duration_days: z.number().min(1).max(365).optional(),
  includes: z.array(ServiceIncludeSchema).max(20).optional(),
  is_active: z.boolean().default(true),
  hero_image_url: z.string().url().optional().nullable(),
  gallery_urls: z.array(z.string().url()).max(10).optional(),
});

export type ServiceCreateInput = z.infer<typeof ServiceCreateSchema>;

// Update service schema (all fields optional)
export const ServiceUpdateSchema = ServiceCreateSchema.partial();
export type ServiceUpdateInput = z.infer<typeof ServiceUpdateSchema>;

// Service form schema (for react-hook-form)
export const ServiceFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  title_ar: z.string().max(100).optional(),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  description_ar: z.string().max(2000).optional(),
  service_type: ServiceTypeEnumSchema,
  price: z.number().min(1, 'Price must be at least 1'),
  currency: z.string().default('SAR'),
  duration_days: z.number().min(1).max(365).optional(),
  includes: z.array(ServiceIncludeSchema).optional(),
  is_active: z.boolean().default(true),
  hero_image_url: z.string().nullable().optional(),
  gallery_urls: z.array(z.string()).optional(),
});

export type ServiceFormData = z.infer<typeof ServiceFormSchema>;

// Common service suggestions for "includes" field
export const SERVICE_INCLUDE_SUGGESTIONS = [
  { en: 'Complete Tawaf', ar: 'طواف كامل' },
  { en: "Sa'i between Safa and Marwa", ar: 'سعي بين الصفا والمروة' },
  { en: 'Ihram from Miqat', ar: 'إحرام من الميقات' },
  { en: 'Dua for beneficiary', ar: 'دعاء للمستفيد' },
  { en: 'Photo/Video proof', ar: 'إثبات بالصور والفيديو' },
  { en: 'Transportation', ar: 'المواصلات' },
  { en: 'Accommodation', ar: 'الإقامة' },
  { en: 'Meals', ar: 'الوجبات' },
  { en: 'Zamzam water', ar: 'ماء زمزم' },
  { en: 'Visit to Prophet\'s Mosque', ar: 'زيارة المسجد النبوي' },
  { en: 'Historical sites tour', ar: 'جولة المواقع التاريخية' },
  { en: 'Guide services', ar: 'خدمات المرشد' },
  { en: 'Hair cutting service', ar: 'خدمة قص الشعر' },
  { en: 'Certificate of completion', ar: 'شهادة إتمام' },
];
