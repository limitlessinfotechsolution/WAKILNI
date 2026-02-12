import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Scheduled Maintenance Edge Function
 * Called by pg_cron every hour to:
 * 1. Refresh admin dashboard materialized view
 * 2. Run database cleanup (expired keys, stale sessions, old notifications)
 *
 * Can also be called manually by admins.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // 1. Refresh materialized view
    const { error: refreshError } = await adminClient.rpc("refresh_admin_dashboard_stats");

    // 2. Run cleanup
    const { data: cleanupResult, error: cleanupError } = await adminClient.rpc("cleanup_old_data");

    const results = {
      success: true,
      stats_refreshed: !refreshError,
      cleanup: cleanupResult || null,
      errors: {
        refresh: refreshError?.message || null,
        cleanup: cleanupError?.message || null,
      },
      executed_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
