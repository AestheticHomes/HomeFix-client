// /app/api/bookings/cancel/route.js
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseClient";
import { error, log } from "@/lib/console";

/**
 * ============================================================
 * 📘 HomeFix API: Cancel Booking (v3.2)
 * ------------------------------------------------------------
 * ✅ Cancels a booking safely with Supabase service role
 * ✅ Sends cancellation email through Edge Function
 * ✅ Uses Edith integrated logging for observability
 * ✅ Gracefully handles failures and returns normalized JSON
 * ============================================================
 */

export const dynamic = "force-dynamic";

export async function POST(req) {
  const supabase = supabaseService();

  try {
    const { booking_id } = await req.json();
    if (!booking_id) {
      return NextResponse.json(
        { success: false, error: "Missing booking_id" },
        { status: 400 },
      );
    }

    log(
      "API:bookings-cancel",
      `🧾 Cancel request for booking ID: ${booking_id}`,
    );

    // 🧩 Fetch existing booking
    const { data: booking, error: fetchErr } = await supabase
      .from("bookings")
      .select(
        `
        id,
        email,
        preferred_date,
        preferred_slot,
        user_profiles ( name ),
        services ( title )
      `,
      )
      .eq("id", booking_id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 },
      );
    }

    // 🧱 Update status → cancelled
    const { data: updated, error: cancelErr } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking_id)
      .select()
      .single();

    if (cancelErr) throw cancelErr;

    log(
      "API:bookings-cancel",
      `✅ Booking #${booking_id} marked as cancelled`,
    );

    // 📨 Prepare email payload
    const payload = {
      to: booking.email,
      subject: `Booking Cancelled — ${
        booking.services?.title || "HomeFix Service"
      }`,
      message: `
        <div style="font-family:sans-serif;padding:16px">
          <h3>❌ Booking Cancelled</h3>
          <p>Hi ${booking.user_profiles?.name || "Customer"},</p>
          <p>Your booking scheduled for <b>${booking.preferred_date}</b> (${booking.preferred_slot}) has been <b>cancelled</b> successfully.</p>
          <p style="font-size:12px;color:#777;">— HomeFix India</p>
        </div>
      `,
    };

    // 🚀 Trigger email via Edge Function
    const sendUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL ||
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-booking-email-core`;

    const sendRes = await fetch(sendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!sendRes.ok) {
      const errText = await sendRes.text();
      error(
        "API:bookings-cancel",
        `⚠️ Email send failed — ${sendRes.status}: ${errText}`,
      );
    } else {
      log(
        "API:bookings-cancel",
        `📧 Cancellation email sent to ${booking.email}`,
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
      booking: updated,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    error("API:bookings-cancel", "💥 Fatal error:", msg);

    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 },
    );
  }
}
