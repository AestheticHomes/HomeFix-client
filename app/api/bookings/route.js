/**
 * File: /app/api/bookings/route.js
 * Version: v4.0 — SmartMail Integration (Edith Final)
 * -----------------------------------------------
 * ✅ Inserts booking record into Supabase
 * ✅ Automatically triggers notification_queue via DB triggers
 * ✅ Prepares optional invoice/layout uploads (future)
 */

import { supabaseServer } from "@/lib/supabaseServerClient";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    console.log("🧩 [Bookings API] Incoming POST");
    const supabase = supabaseServer;
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
      longitude,
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

    // ✅ Compute total if not passed
    const computedTotal = Array.isArray(services)
      ? services.reduce((sum, s) => {
          const price = parseFloat(s.price || s.cost || 0);
          const qty = parseInt(s.quantity || 1);
          return sum + price * qty;
        }, 0)
      : 0;

    const totalFinal = total_price || computedTotal;

    // ✅ Prepare structured payload
    const site_location = {
      address: address || null,
      latitude: latitude || null,
      longitude: longitude || null,
    };

    const bookingData = {
      user_id,
      services,
      total_price: totalFinal,
      type,
      quantity,
      preferred_date: preferred_date || new Date().toISOString().split("T")[0],
      preferred_slot: preferred_slot || null,
      status: "upcoming",
      professional_service: professional_service || null,
      site_location,
      address: address || null,
      latitude: latitude || null,
      longitude: longitude || null,
      created_at: new Date().toISOString(),
    };

    console.log("🧾 [Bookings] Final Insert Payload:", bookingData);

    // ✅ Insert booking (trigger auto-runs)
    const { data, error } = await supabase
      .from("bookings")
      .insert([bookingData])
      .select();

    if (error) throw error;
    const booking = data?.[0];
    console.log("✅ [Bookings] Inserted successfully:", booking);

    // 📨 [Optional] Future: enqueue invoice/layout upload here
    // Example:
    // await supabase.from("invoices").insert({
    //   booking_id: booking.id,
    //   invoice_url: invoiceUrl,
    //   layout_url: layoutUrl,
    //   total: totalFinal,
    // });

    return NextResponse.json({ success: true, data: booking });
  } catch (err) {
    console.error("💥 [Bookings API] Fatal error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
