// /lib/bookingUtils.js
import { supabase } from "@/lib/supabaseClient";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function sendBookingEmail(type, booking) {
  try {
    const endpoint =
      "https://xnubmphixlpkyqfhghup.functions.supabase.co/send-booking-email-core";
    const payload = {
      to: booking.email,
      subject: type === "reschedule"
        ? "Booking Rescheduled — HomeFix India"
        : type === "update"
        ? "Booking Update — HomeFix India"
        : "Booking Confirmed — HomeFix India",
      message: `
        <h3>${
        type === "reschedule"
          ? "🔁 Booking Rescheduled"
          : "✅ Booking Confirmed"
      }</h3>
        <p>Dear ${booking.name || "Customer"},</p>
        <p>Your booking ${
        type === "reschedule"
          ? "has been successfully rescheduled."
          : "has been received."
      }</p>
        <p><b>Date:</b> ${booking.preferred_date}<br/>
        <b>Slot:</b> ${booking.preferred_slot}</p>
        <p><b>Services:</b> ${
        booking.services?.map((s) => s.name).join(", ") || "—"
      }</p>
        <p style="color:#777;font-size:12px;">— HomeFix India</p>
      `,
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    console.log("📧 [Email Trigger Response]", res.status, text);
  } catch (e) {
    console.error("💥 [sendBookingEmail] Failed:", e);
  }
}
