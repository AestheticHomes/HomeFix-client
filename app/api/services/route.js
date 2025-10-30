/**
 * ============================================================
 * File: /app/api/services/route.js
 * Purpose: Public/Client API — Fetch active service listings
 * ------------------------------------------------------------
 * ✅ Uses supabaseService() for safe reads (bypasses RLS)
 * ✅ Normalizes columns for frontend use
 * ✅ Integrated with Edith logging stream (/lib/console)
 * ✅ Clean error handling + JSON response contract
 * ============================================================
 */

import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseClient";
import { error, log, warn } from "@/lib/console";

export const dynamic = "force-dynamic";

// 🧩 Supabase service-role client
const supabase = supabaseService();

/* ------------------------------------------------------------
   ✅ GET — Fetch all active services
------------------------------------------------------------ */
export async function GET() {
  try {
    log("API:services", "🪴 Fetching active services...");

    const { data, error: fetchErr } = await supabase
      .from("services")
      .select(
        `
          id,
          title,
          description,
          price,
          unit,
          icon,
          slug,
          is_active
        `,
      )
      .eq("is_active", true)
      .order("id", { ascending: true });

    if (fetchErr) throw fetchErr;

    const services = (data || []).map((s) => ({
      id: s.id,
      name: s.title,
      description: s.description,
      price: s.price,
      unit: s.unit,
      icon: s.icon,
      slug: s.slug,
    }));

    log("API:services", `✅ ${services.length} active services fetched`);
    return NextResponse.json({ success: true, services }, { status: 200 });
  } catch (err) {
    error("API:services", "💥 Failed to fetch services:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Internal server error",
      },
      { status: 500 },
    );
  }
}
