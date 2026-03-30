/**
 * Bookings API Service
 * CRUD operations for bookings table
 */

import {
  supabase,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  handleError,
  createSuccessResponse,
  createErrorResponse,
  callEdgeFunction,
} from '../base';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';

export type Booking = Tables<'bookings'>;
export type BookingUpdate = TablesUpdate<'bookings'>;

export interface BookingWithDetails extends Booking {
  service?: {
    id: string;
    title: string;
    title_ar: string | null;
    service_type: string;
    price: number;
    currency: string | null;
  } | null;
  beneficiary?: {
    id: string;
    full_name: string;
    full_name_ar: string | null;
    status: string;
  } | null;
  provider?: {
    id: string;
    company_name: string | null;
    company_name_ar: string | null;
    rating: number | null;
  } | null;
}

export interface CreateBookingRequest {
  service_id: string;
  beneficiary_id: string;
  scheduled_date: string | null;
  special_requests: string | null;
}

// =============================================================================
// READ OPERATIONS
// =============================================================================

export async function getBookings(
  userId: string,
  pagination?: PaginationParams
): Promise<ApiResponse<BookingWithDetails[]>> {
  try {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        service:services(id, title, title_ar, service_type, price, currency),
        beneficiary:beneficiaries(id, full_name, full_name_ar, status),
        provider:providers(id, company_name, company_name_ar, rating)
      `)
      .eq('traveler_id', userId)
      .order('created_at', { ascending: false });

    if (pagination) {
      const { page = 1, pageSize = 10 } = pagination;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;
    if (error) throw error;

    return createSuccessResponse(data || []);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function getBookingById(
  bookingId: string
): Promise<ApiResponse<BookingWithDetails>> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        service:services(id, title, title_ar, service_type, price, currency),
        beneficiary:beneficiaries(id, full_name, full_name_ar, status),
        provider:providers(id, company_name, company_name_ar, rating)
      `)
      .eq('id', bookingId)
      .single();

    if (error) throw error;
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function getProviderBookings(
  providerId: string,
  status?: 'pending' | 'assigned_to_vendor' | 'assigned_to_provider' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
): Promise<ApiResponse<BookingWithDetails[]>> {
  try {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        service:services(id, title, title_ar, service_type, price, currency),
        beneficiary:beneficiaries(id, full_name, full_name_ar, status)
      `)
      .eq('provider_id', providerId)
      .order('scheduled_date', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return createSuccessResponse(data || []);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

// =============================================================================
// WRITE OPERATIONS
// =============================================================================

/**
 * Create booking via Edge Function (server-side price calculation)
 */
export async function createBooking(
  request: CreateBookingRequest
): Promise<ApiResponse<Booking>> {
  return callEdgeFunction<Booking>('create-booking', {
    method: 'POST',
    body: request,
  });
}

export async function updateBooking(
  bookingId: string,
  updates: BookingUpdate
): Promise<ApiResponse<Booking>> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: 'pending' | 'assigned_to_vendor' | 'assigned_to_provider' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
): Promise<ApiResponse<Booking>> {
  const updates: BookingUpdate = { status };
  
  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  return updateBooking(bookingId, updates);
}

// =============================================================================
// ADMIN OPERATIONS
// =============================================================================

export async function getAllBookings(
  filters?: {
    status?: 'pending' | 'assigned_to_vendor' | 'assigned_to_provider' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
    serviceType?: string;
    dateFrom?: string;
    dateTo?: string;
  },
  pagination?: PaginationParams
): Promise<PaginatedResponse<BookingWithDetails>> {
  try {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        service:services(id, title, title_ar, service_type, price, currency),
        beneficiary:beneficiaries(id, full_name, full_name_ar, status),
        provider:providers(id, company_name, company_name_ar, rating)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.dateFrom) {
      query = query.gte('scheduled_date', filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte('scheduled_date', filters.dateTo);
    }

    const { page = 1, pageSize = 10 } = pagination || {};
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      pageSize,
      hasMore: (count || 0) > page * pageSize,
    };
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    return {
      data: [],
      count: 0,
      page: 1,
      pageSize: 10,
      hasMore: false,
    };
  }
}
