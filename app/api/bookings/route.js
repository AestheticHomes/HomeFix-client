/**
 * File: /app/api/bookings/route.js
 * Version: v3.6 — Auto-fetch user email & fix schema mismatch
 */

import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    console.log("🧩 [Bookings API] Incoming POST");
    const supabase = supabaseServer();
    const body = await req.json();

    console.log("📦 [Bookings] Raw payload:", body);

    const {
      user_id,
      services = [],
      type = "service",
      quantity = 1,
      preferred_date,
      preferred_slot,
      address,
      professional_service,
      total_price,
      latitude,
      longitude
    } = body;

    if (!user_id) throw new Error("Missing user_id");

    // 🧭 Fetch user profile
    const { data: profile, error: profileErr } = await supabase
      .from("user_profiles")
      .select("name, email, phone")
      .eq("id", user_id)
      .maybeSingle();

    if (profileErr) throw profileErr;

    console.log("👤 [Bookings] Profile fetched:", profile);

    // ✅  Compute total from services if not provided
    let computedTotal = 0;
    if (Array.isArray(services)) {
      computedTotal = services.reduce((sum, s) => {
        const price = parseFloat(s.price || s.cost || 0);
        const qty = parseInt(s.quantity || 1);
        return sum + price * qty;
      }, 0);
    }

    const totalFinal = total_price || computedTotal;

    // ✅ Prepare site_location object (for better consistency)
    const site_location = {
      address: address || null,
      latitude: latitude || null,
      longitude: longitude || null,
    };

    // ✅ Build booking record safely
    const bookingData = {
      user_id,
      email: profile?.email || null,
      services,
      total_price: totalFinal,
      type,
      quantity,
      preferred_date: preferred_date || new Date().toISOString().split("T")[0],
      preferred_slot: preferred_slot || null,
      status: "upcoming",
      created_at: new Date().toISOString(),
      address: address || null,
      latitude: latitude || null,
      longitude: longitude || null,
      professional_service: professional_service || null,
      site_location,
    };

    console.log("🧾 [Bookings] Final Insert Payload:", bookingData);

    // ✅ Insert booking
    const { data, error } = await supabase
      .from("bookings")
      .insert([bookingData])
      .select();

    if (error) throw error;

    console.log("✅ [Bookings] Inserted successfully:", data);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("💥 [Bookings API] Fatal error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
