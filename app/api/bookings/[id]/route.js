// app/api/bookings/[id]/route.js
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseClient";
import { error, log, warn } from "@/lib/console";

/**
 * ============================================================
 * 📘 HomeFix API: PATCH /api/bookings/[id]
 * ------------------------------------------------------------
 * ✅ Allows admin/staff to update or reschedule bookings
 * ✅ Uses Supabase service-role client (bypass RLS safely)
 * ✅ Triggers Edge Function emails when applicable
 * ✅ Edith-logged for traceability in Admin Console
 * ============================================================
 */

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  const supabase = supabaseService();

  try {
    const id = params?.id;
    const { status, new_date } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing booking ID" },
        { status: 400 },
      );
    }

    const updates = {
      updated_at: new Date().toISOString(),
      ...(status && { status }),
      ...(new_date && { preferred_date: new_date, preferred_slot: null }),
    };

    log("API:bookings-update", `🔧 Updating booking ${id} →`, updates);

    const { data, error: updateErr } = await supabase
      .from("bookings")
      .update(updates)
      .eq("id", id)
      .select(
        `
        id,
        email,
        status,
        preferred_date,
        preferred_slot,
        user_profiles ( name, phone, email ),
        services ( title )
      `,
      )
      .single();

    if (updateErr) throw updateErr;

    log("API:bookings-update", `✅ Booking ${id} updated successfully`);

    // 📨 Trigger notification email
    try {
      const sendUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL ||
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-booking-email-core`;

      const subject = status === "rescheduled"
        ? "Booking Rescheduled"
        : `Booking ${status?.toUpperCase() || "Updated"}`;

      const message = `
        <div style="font-family:sans-serif;padding:16px">
          <h3>📅 ${subject}</h3>
          <p>Hi ${data.user_profiles?.name || "Customer"},</p>
          <p>Your booking for <b>${
        data.services?.title || "HomeFix Service"
      }</b> has been <b>${status}</b>.</p>
          ${new_date ? `<p>New Date: <b>${new_date}</b></p>` : ""}
          <p style="font-size:12px;color:#777;">— HomeFix India</p>
        </div>
      `;

      const payload = {
        to: data.email || data.user_profiles?.email,
        subject,
        message,
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
          "API:bookings-update",
          `⚠️ Email send failed (${res.status}):`,
          txt,
        );
      } else {
        log("API:bookings-update", `📧 Email sent to ${payload.to}`);
      }
    } catch (mailErr) {
      warn(
        "API:bookings-update",
        "⚠️ Failed to send booking update email:",
        mailErr,
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully",
      booking: data,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    error("API:bookings-update", "💥 Fatal error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
