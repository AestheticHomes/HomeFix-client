// /app/api/admin/bookings/update/route.js
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseClient";

/**
 * ============================================================
 * 📘 HomeFix Admin API — Booking Update (v1.4)
 * ------------------------------------------------------------
 * ✅ Normalizes ISO date fields before update
 * ✅ Confirms affected row
 * ✅ Uses service role key (RLS bypass)
 * ✅ Logs to http_response_log
 * ============================================================
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = supabaseService();

export async function POST(req) {
  try {
    const body = await req.json();
    const { id, status, preferred_date } = body || {};

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Booking ID required" },
        { status: 400 },
      );
    }

    // 🧭 Build update payload safely
    const updateFields = {};

    if (typeof status === "string" && status.trim() !== "") {
      updateFields.status = status.trim();
    }

    if (preferred_date) {
      // Convert any date string to ISO timestamp
      const iso = new Date(preferred_date).toISOString();
      if (!isNaN(new Date(iso).getTime())) updateFields.preferred_date = iso;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 },
      );
    }

    console.log("🧭 [Admin API:update] Updating booking:", id, updateFields);

    const { data, error } = await supabase
      .from("bookings")
      .update(updateFields)
      .eq("id", id)
      .select(
        "*, user_profiles: user_id (id, name, email), services: service_id (id, title)",
      )
      .single();

    if (error) throw error;
    if (!data) {
      throw new Error(`No record returned after update (id: ${id})`);
    }

    console.log("✅ [Admin API:update] Booking updated:", data.id);

    await supabase.from("http_response_log").insert({
      status_code: 200,
      message: `Booking ${id} updated by admin`,
      request_url: "/api/admin/bookings/update",
      request_body: JSON.stringify(updateFields),
      response_body: JSON.stringify(data),
    });

    return NextResponse.json({
      success: true,
      booking: data,
      updatedFields: updateFields,
    });
  } catch (err) {
    console.error("💥 [Admin API:update] Error:", err);

    await supabase.from("http_response_log").insert({
      status_code: 500,
      message: "Admin booking update failed",
      request_url: "/api/admin/bookings/update",
      response_body: err.message || err,
    });

    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
