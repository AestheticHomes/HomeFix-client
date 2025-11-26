/**
 * ============================================================
 * File: /app/api/services/route.js
 * Module: HomeFix Public Services API (v3.3)
 * ------------------------------------------------------------
 * ✅ Fetches active services (and optionally products)
 * ✅ Supports filters: ?type=service&category=Painter
 * ✅ Uses supabaseService() (RLS bypass)
 * ✅ Case-insensitive filters via ilike()
 * ✅ Edge-safe + PWA cache headers
 * ✅ Structured Edith logging via /lib/console
 * ============================================================
 */

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServerClient";
import { log, error } from "@/lib/console";

export const dynamic = "force-dynamic"; // ✅ SSR fetch on each request
const supabase = supabaseServer;

/* ------------------------------------------------------------
   ✅ GET — Fetch all active services
------------------------------------------------------------ */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "service";
  const category = searchParams.get("category");

  try {
    log(
      "API:services",
      `📦 Fetching '${type}' listings${category ? ` (category: ${category})` : ""} ...`
    );

    // Base query
    let query = supabase
      .from("services")
      .select(
        `
        id,
        title,
        description,
        price,
        unit,
        icon,
        image_url,
        slug,
        category,
        type,
        is_active
      `
      )
      .eq("is_active", true)
      .eq("type", type)
      .order("id", { ascending: true });

    // Apply case-insensitive category filter
    if (category) query = query.ilike("category", category);

    const { data, error: fetchErr } = await query;
    if (fetchErr) throw fetchErr;

    const services = (data || []).map((s) => ({
      id: s.id,
      name: s.title,
      description: s.description,
      price: parseFloat(s.price) || 0,
      unit: s.unit,
      icon: s.icon,
      image_url: s.image_url,
      slug: s.slug,
      category: s.category?.toLowerCase(),
      type: s.type?.toLowerCase(),
    }));

    log("API:services", `✅ ${services.length} active ${type}s fetched successfully`);

    return new NextResponse(JSON.stringify({ success: true, count: services.length, services }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    error("API:services", "💥 Fetch failed:", err.message);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch services",
        error: err.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
