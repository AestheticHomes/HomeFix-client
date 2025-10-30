/**
 * Route: /api/bookings/list
 * Purpose: Returns user-specific booking list (RLS-safe)
 */
export const dynamic = "force-dynamic"; // ✅ prevents static optimization

import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseClient";
import { error, log } from "@/lib/console";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    if (!userId) throw new Error("Missing user_id param");

    const supabase = supabaseService();
    const { data, error: fetchErr } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (fetchErr) throw fetchErr;

    return NextResponse.json({ success: true, bookings: data || [] }, {
      status: 200,
    });
  } catch (err) {
    error("Bookings API", "Error:", err.message);
    return NextResponse.json({ success: false, error: err.message }, {
      status: 500,
    });
  }
}
