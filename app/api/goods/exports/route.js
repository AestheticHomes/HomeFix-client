/**
 * ============================================================
 * 📦 API: /api/goods/exports
 * HomeFix India — Goods Export Endpoint v2.1 🌿
 * ------------------------------------------------------------
 * ✅ Uses unified Supabase Service client
 * ✅ Handles errors gracefully with full console + response
 * ✅ Includes CORS headers for external tool access
 * ✅ Returns clean JSON array of goods
 * ============================================================
 */

import { supabaseService } from "@/lib/supabaseClient";
import { error, log } from "@/lib/console";

/* ------------------------------------------------------------
   🌐 GET /api/goods/exports
   ------------------------------------------------------------
   Fetches all items from the "goods" table.
   Used for admin exports, dashboards, or backup sync.
------------------------------------------------------------ */
export async function GET(req) {
  const supabase = supabaseService();
  log("API:goods/exports", "📦 Fetching goods for export…");

  try {
    // ✅ Query the goods table
    const { data, error: dbError } = await supabase
      .from("goods")
      .select("*")
      .order("created_at", { ascending: false });

    // ⚠️ Handle DB error
    if (dbError) {
      error("API:goods/exports", "❌ Supabase query failed:", dbError.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: dbError.message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // 🧾 Success
    log(
      "API:goods/exports",
      `✅ Exported ${data?.length || 0} goods successfully`,
    );
    return new Response(
      JSON.stringify({
        success: true,
        count: data?.length || 0,
        goods: data || [],
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (err) {
    // 🧱 Deno/Node-safe error handling
    const message = err instanceof Error ? err.message : String(err);
    error("API:goods/exports", "💥 Unexpected runtime error:", message);

    return new Response(
      JSON.stringify({
        success: false,
        error: message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
}

/* ------------------------------------------------------------
   🧩 OPTIONS — For CORS Preflight
------------------------------------------------------------ */
export async function OPTIONS() {
  return new Response("OK", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
