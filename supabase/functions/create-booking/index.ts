import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateBookingRequest {
  service_id: string;
  beneficiary_id: string;
  scheduled_date: string | null;
  special_requests: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user from JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    const body: CreateBookingRequest = await req.json();
    
    // Validate required fields
    if (!body.service_id || typeof body.service_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid service_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!body.beneficiary_id || typeof body.beneficiary_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid beneficiary_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(body.service_id) || !uuidRegex.test(body.beneficiary_id)) {
      return new Response(
        JSON.stringify({ error: 'Invalid UUID format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch service details SERVER-SIDE (critical security fix)
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, price, currency, provider_id, is_active')
      .eq('id', body.service_id)
      .single();

    if (serviceError || !service) {
      return new Response(
        JSON.stringify({ error: 'Service not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!service.is_active) {
      return new Response(
        JSON.stringify({ error: 'Service is not available' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify beneficiary belongs to user
    const { data: beneficiary, error: beneficiaryError } = await supabase
      .from('beneficiaries')
      .select('id, user_id')
      .eq('id', body.beneficiary_id)
      .single();

    if (beneficiaryError || !beneficiary) {
      return new Response(
        JSON.stringify({ error: 'Beneficiary not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (beneficiary.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'You do not have access to this beneficiary' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate total amount SERVER-SIDE (5% service fee)
    const SERVICE_FEE_PERCENTAGE = 0.05;
    const calculatedTotal = Number(service.price) * (1 + SERVICE_FEE_PERCENTAGE);

    // Validate scheduled_date if provided
    let scheduledDate: string | null = null;
    if (body.scheduled_date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(body.scheduled_date)) {
        return new Response(
          JSON.stringify({ error: 'Invalid date format. Use YYYY-MM-DD' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      scheduledDate = body.scheduled_date;
    }

    // Sanitize special_requests (limit length, strip HTML)
    let specialRequests: string | null = null;
    if (body.special_requests) {
      const sanitized = String(body.special_requests)
        .replace(/<[^>]*>/g, '') // Strip HTML tags
        .trim()
        .slice(0, 1000); // Limit to 1000 characters
      if (sanitized.length > 0) {
        specialRequests = sanitized;
      }
    }

    // Create booking with server-calculated amount
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        service_id: service.id,
        beneficiary_id: beneficiary.id,
        provider_id: service.provider_id,
        traveler_id: user.id,
        scheduled_date: scheduledDate,
        special_requests: specialRequests,
        total_amount: calculatedTotal,
        currency: service.currency || 'SAR',
        status: 'pending',
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      return new Response(
        JSON.stringify({ error: 'Failed to create booking' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log booking activity
    await supabase.from('booking_activities').insert({
      booking_id: booking.id,
      actor_id: user.id,
      action: 'created',
      details: { status: 'pending', total_amount: calculatedTotal },
    });

    return new Response(
      JSON.stringify({ data: booking }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
