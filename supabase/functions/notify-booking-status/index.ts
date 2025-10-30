/**
 * Supabase Edge Function: notify-booking-status
 * ---------------------------------------------
 * ✅ Updates booking in DB
 * ✅ Inserts status log
 * ✅ Sends email via send-booking-email-core
 * ✅ Fully Deno-lint compliant
 */

import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

interface BookingUpdatePayload {
  action: "reschedule" | "cancel" | "complete" | "create";
  bookingId: string;
  date?: string;
  slot?: string;
  _userId?: string; // optional, currently unused
  note?: string;
}

serve(async (req: Request) => {
  try {
    const payload = (await req.json()) as BookingUpdatePayload;
    const { action, bookingId, date, slot } = payload;

    console.log("📦 notify-booking-status payload:", payload);

    if (!bookingId || !action) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing bookingId or action",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    /* 1️⃣ Update booking */
    if (action === "reschedule" && (date || slot)) {
      const { error } = await supabase
        .from("bookings")
        .update({
          date,
          slot,
          status: "upcoming",
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);
      if (error) throw error;
      console.log(`🪄 Booking ${bookingId} rescheduled to ${date} / ${slot}`);
    }

    if (action === "cancel") {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", bookingId);
      if (error) throw error;
      console.log(`🚫 Booking ${bookingId} cancelled`);
    }

    if (action === "complete") {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", bookingId);
      if (error) throw error;
      console.log(`✅ Booking ${bookingId} completed`);
    }

    /* 2️⃣ Insert status log */
    await supabase.from("booking_status_log").insert([
      {
        booking_id: bookingId,
        action,
        message: action === "reschedule"
          ? `Booking rescheduled to ${date} (${slot})`
          : `Booking marked as ${action}`,
        created_at: new Date().toISOString(),
      },
    ]);

    /* 3️⃣ Fetch for email */
    const { data: bookingData, error: fetchError } = await supabase
      .from("bookings")
      .select("id, title, date, slot, client_email, client_name, status")
      .eq("id", bookingId)
      .single();

    if (fetchError) throw fetchError;

    /* 4️⃣ Notify via send-booking-email-core */
    const emailFnUrl = Deno.env.get("SUPABASE_EDGE_URL_SEND_BOOKING_EMAIL") ||
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-booking-email-core`;

    await fetch(emailFnUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        bookingId,
        type: action,
        booking: bookingData,
      }),
    });

    return new Response(JSON.stringify({ success: true, bookingId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    if (err instanceof Error) {
      console.error("❌ notify-booking-status error:", err.message);
      return new Response(
        JSON.stringify({ success: false, error: err.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    console.error("❌ Unknown error", err);
    return new Response(
      JSON.stringify({ success: false, error: "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});
