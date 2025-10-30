import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseClient";

/**
 * 📘 API: /api/bookings/list
 * ------------------------------------------------------------
 * ✅ Fetch user bookings by user_id
 * ✅ Bypasses RLS via service role
 * ✅ Safe JSON contract for frontend
 */

export const dynamic = "force-dynamic";
const supabase = supabaseService();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: "Missing user_id" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        status,
        preferred_date,
        preferred_slot,
        quantity,
        total_price,
        type,
        services,
        created_at
      `)
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      bookings: data || [],
    });
  } catch (err) {
    console.error("💥 [API:user bookings]", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
