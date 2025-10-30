// /app/api/bookings/reschedule/route.js
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseClient";
import { error, log, warn } from "@/lib/console";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const supabase = supabaseService();

  try {
    const { booking_id, new_date, new_slot } = await req.json();

    if (!booking_id || !new_date || !new_slot) {
      return NextResponse.json(
        { success: false, error: "Missing booking_id, new_date, or new_slot" },
        { status: 400 },
      );
    }

    log(
      "API:bookings-reschedule",
      `🔁 Reschedule request: #${booking_id} → ${new_date} @ ${new_slot}`,
    );

    // 1️⃣ Fetch existing booking (with relations for email content)
    const { data: old, error: fetchErr } = await supabase
      .from("bookings")
      .select(
        `
        id,
        email,
        preferred_date,
        preferred_slot,
        user_profiles ( name, email ),
        services ( title )
      `,
      )
      .eq("id", booking_id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!old) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 },
      );
    }

    // 2️⃣ Update booking
    const { data: updated, error: updErr } = await supabase
      .from("bookings")
      .update({
        preferred_date: new_date,
        preferred_slot: new_slot,
        status: "rescheduled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking_id)
      .select(
        `
        id,
        email,
        status,
        preferred_date,
        preferred_slot,
        user_profiles ( name, email ),
        services ( title )
      `,
      )
      .single();

    if (updErr) throw updErr;

    log(
      "API:bookings-reschedule",
      `✅ Booking #${booking_id} marked rescheduled`,
    );

    // 3️⃣ Notify via Edge Function (best-effort; don’t fail the API if email fails)
    try {
      const sendUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL ||
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-booking-email-core`;

      const payload = {
        to: old.email || old.user_profiles?.email,
        subject: `Booking Rescheduled — ${
          old.services?.title || "HomeFix Service"
        }`,
        message: `
          <div style="font-family:sans-serif;padding:16px">
            <h3>🔁 Booking Rescheduled</h3>
            <p>Hi ${old.user_profiles?.name || "Customer"},</p>
            <p>Your booking has been <b>rescheduled</b>.</p>
            <p>
              <b>Old:</b> ${old.preferred_date} (${old.preferred_slot})<br/>
              <b>New:</b> ${new_date} (${new_slot})
            </p>
            <p style="font-size:12px;color:#777;">— HomeFix India</p>
          </div>
        `,
      };

      const res = await fetch(sendUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        warn(
          "API:bookings-reschedule",
          `⚠️ Email send failed (${res.status}): ${txt}`,
        );
      } else {
        log(
          "API:bookings-reschedule",
          `📧 Reschedule email sent to ${payload.to}`,
        );
      }
    } catch (mailErr) {
      warn("API:bookings-reschedule", "⚠️ Email dispatch error:", mailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Booking rescheduled successfully",
      booking: updated,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    error("API:bookings-reschedule", "💥 Fatal error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
