// /app/api/admin/bookings/list/route.js
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseClient";

/**
 * ============================================================
 * 📘 HomeFix Admin API — Booking List
 * ------------------------------------------------------------
 * ✅ Uses Service Role (bypasses RLS)
 * ✅ Joins user_profiles + services
 * ✅ Returns latest-first
 * ✅ Disables caching
 * ✅ Structured error + debug logs
 * ============================================================
 */

export const dynamic = "force-dynamic"; // Disable static caching
export const revalidate = 0; // Prevent ISR cache

const supabase = supabaseService();

export async function GET() {
  try {
    console.log("📡 [Admin API:list] Fetching booking list...");

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        status,
        address,
        preferred_date,
        preferred_slot,
        created_at,
        user_profiles: user_id ( id, name, phone, email ),
        services: service_id ( id, title )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    console.log(`✅ [Admin API:list] Loaded ${data?.length || 0} rows`);

    return NextResponse.json(
      {
        success: true,
        bookings: data || [],
        fetchedAt: new Date().toISOString(),
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("💥 [Admin API:list] Failed:", err);

    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Internal Server Error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
