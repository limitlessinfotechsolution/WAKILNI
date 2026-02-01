/**
 * Process Payment Edge Function
 * Idempotent payment processor to prevent duplicate charges
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// API Version
const API_VERSION = '2026-02-01';

interface ProcessPaymentRequest {
  booking_id: string;
  amount: number;
  currency?: string;
  payment_method?: string;
  idempotency_key: string;
  metadata?: Record<string, unknown>;
}

interface StandardResponse<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    description?: string;
  } | null;
  meta: {
    timestamp: string;
    version: string;
    request_id: string;
  };
}

function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `req_${timestamp}_${random}`;
}

function createResponse<T>(
  data: T | null,
  error: { code: string; message: string; description?: string } | null,
  status: number,
  requestId: string
): Response {
  const response: StandardResponse<T> = {
    success: !error,
    data,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      version: API_VERSION,
      request_id: requestId,
    },
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'X-API-Version': API_VERSION,
    },
  });
}

Deno.serve(async (req: Request) => {
  const requestId = generateRequestId();

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return createResponse(null, {
      code: 'METHOD_NOT_ALLOWED',
      message: 'Only POST requests are allowed',
    }, 405, requestId);
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return createResponse(null, {
        code: 'AUTH_001',
        message: 'Authentication required',
        description: 'You must be logged in to process payments',
      }, 401, requestId);
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createResponse(null, {
        code: 'AUTH_001',
        message: 'Authentication required',
        description: 'Invalid or expired session',
      }, 401, requestId);
    }

    // Parse request body
    const body: ProcessPaymentRequest = await req.json();
    const {
      booking_id,
      amount,
      currency = 'SAR',
      payment_method = 'card',
      idempotency_key,
      metadata = {},
    } = body;

    // Validate required fields
    if (!booking_id || !amount || !idempotency_key) {
      return createResponse(null, {
        code: 'VALIDATION_002',
        message: 'Missing required fields',
        description: 'booking_id, amount, and idempotency_key are required',
      }, 400, requestId);
    }

    // Validate idempotency key format
    if (idempotency_key.length < 16 || idempotency_key.length > 64) {
      return createResponse(null, {
        code: 'VALIDATION_001',
        message: 'Invalid idempotency key',
        description: 'Idempotency key must be between 16 and 64 characters',
      }, 400, requestId);
    }

    // Check for existing idempotency key
    const { data: existingKey, error: keyError } = await supabase
      .from('payment_idempotency_keys')
      .select('*')
      .eq('idempotency_key', idempotency_key)
      .single();

    if (existingKey) {
      // Key exists - check status
      if (existingKey.status === 'completed') {
        // Return cached response for completed payment
        return createResponse(existingKey.response_data, null, 200, requestId);
      }

      if (existingKey.status === 'pending') {
        // Payment still processing
        return createResponse(null, {
          code: 'PAYMENT_005',
          message: 'Payment pending',
          description: 'A payment is already being processed for this request',
        }, 409, requestId);
      }

      // If failed, allow retry with same key
    }

    // Create request hash for duplicate detection
    const requestHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(JSON.stringify({ booking_id, amount, currency }))
    ).then(hash => 
      Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    );

    // Insert or update idempotency record
    const { error: insertError } = await supabase
      .from('payment_idempotency_keys')
      .upsert({
        idempotency_key,
        booking_id,
        user_id: user.id,
        status: 'pending',
        request_hash: requestHash,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }, { onConflict: 'idempotency_key' });

    if (insertError) {
      console.error('Failed to create idempotency record:', insertError);
      return createResponse(null, {
        code: 'SYSTEM_001',
        message: 'Internal server error',
        description: 'Failed to initialize payment processing',
      }, 500, requestId);
    }

    // Verify booking exists and belongs to user
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, service:services(price, currency)')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      await updateIdempotencyKey(supabase, idempotency_key, 'failed', null);
      return createResponse(null, {
        code: 'BOOKING_003',
        message: 'Booking not found',
        description: 'The requested booking could not be found',
      }, 404, requestId);
    }

    if (booking.traveler_id !== user.id) {
      await updateIdempotencyKey(supabase, idempotency_key, 'failed', null);
      return createResponse(null, {
        code: 'AUTH_002',
        message: 'Insufficient permissions',
        description: 'You do not have permission to pay for this booking',
      }, 403, requestId);
    }

    // Check booking status
    if (booking.status !== 'pending' && booking.status !== 'accepted') {
      await updateIdempotencyKey(supabase, idempotency_key, 'failed', null);
      return createResponse(null, {
        code: 'BOOKING_004',
        message: 'Invalid booking status',
        description: 'Payment can only be processed for pending or accepted bookings',
      }, 409, requestId);
    }

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        booking_id,
        user_id: user.id,
        amount,
        currency,
        payment_method,
        payment_status: 'processing',
      })
      .select()
      .single();

    if (txError) {
      console.error('Failed to create transaction:', txError);
      await updateIdempotencyKey(supabase, idempotency_key, 'failed', null);
      return createResponse(null, {
        code: 'PAYMENT_001',
        message: 'Payment failed',
        description: 'Failed to initialize transaction',
      }, 500, requestId);
    }

    // Simulate payment processing (in production, integrate with Stripe/payment gateway)
    // For now, we'll mark as completed
    const paymentReference = `PAY_${Date.now().toString(36).toUpperCase()}`;

    // Update transaction status
    const { error: updateTxError } = await supabase
      .from('transactions')
      .update({
        payment_status: 'completed',
        payment_reference: paymentReference,
      })
      .eq('id', transaction.id);

    if (updateTxError) {
      console.error('Failed to update transaction:', updateTxError);
    }

    // Update booking status
    await supabase
      .from('bookings')
      .update({ status: 'accepted' })
      .eq('id', booking_id);

    // Log activity
    await supabase.from('booking_activities').insert({
      booking_id,
      actor_id: user.id,
      action: 'payment_completed',
      details: {
        transaction_id: transaction.id,
        amount,
        currency,
        payment_reference: paymentReference,
      },
    });

    // Prepare response data
    const responseData = {
      transaction_id: transaction.id,
      booking_id,
      status: 'completed',
      amount,
      currency,
      payment_reference: paymentReference,
      processed_at: new Date().toISOString(),
    };

    // Update idempotency key with response
    await updateIdempotencyKey(supabase, idempotency_key, 'completed', responseData);

    return createResponse(responseData, null, 200, requestId);

  } catch (error) {
    console.error('Payment processing error:', error);
    return createResponse(null, {
      code: 'SYSTEM_001',
      message: 'Internal server error',
      description: error instanceof Error ? error.message : 'An unexpected error occurred',
    }, 500, requestId);
  }
});

// deno-lint-ignore no-explicit-any
async function updateIdempotencyKey(
  supabase: any,
  key: string,
  status: string,
  responseData: unknown
) {
  await supabase
    .from('payment_idempotency_keys')
    .update({
      status,
      response_data: responseData,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
    })
    .eq('idempotency_key', key);
}
