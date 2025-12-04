/**
 * POST /api/bookings-ledger/cancel
 * Cancels a booking/order, logs booking_events, enqueues notification_queue, triggers email worker.
 */
export const runtime = "nodejs";

import { supabaseServer } from "@/lib/supabaseServerClient";
import { triggerEmailQueueWorker } from "@/lib/notifications/triggerEmailQueueWorker";
import { NextResponse } from "next/server";

interface CancelPayload {
  booking_id: string;
  user_id?: string;
  reason?: string;
}

export async function POST(req: Request) {
  const supabase = supabaseServer;

  try {
    const body = (await req.json()) as CancelPayload;

    if (!body?.booking_id) {
      return NextResponse.json(
        { success: false, message: "booking_id is required" },
        { status: 400 }
      );
    }

    // Fetch booking to ensure user owns it
    const { data: existing, error: fetchErr } = await supabase
      .from("bookings_ledger")
      .select("*")
      .eq("id", body.booking_id)
      .single();

    if (fetchErr || !existing) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    if (body.user_id && existing.user_id !== body.user_id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized booking access" },
        { status: 403 }
      );
    }

    // Prevent double cancellation
    if (existing.status === "cancelled") {
      return NextResponse.json(
        { success: true, message: "Already cancelled" },
        { status: 200 }
      );
    }

    // Update booking
    const { error: updErr } = await supabase
      .from("bookings_ledger")
      .update({
        status: "cancelled",
        event_count: (existing.event_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.booking_id);

    if (updErr) {
      console.error("❌ cancel update error:", updErr);
      return NextResponse.json(
        { success: false, message: updErr.message },
        { status: 500 }
      );
    }

    // Log event
    await supabase.from("booking_events").insert([
      {
        booking_id: body.booking_id,
        user_id: body.user_id ?? existing.user_id ?? null,
        event: "cancelled",
        status: "cancelled",
        meta: {
          reason: body.reason || "user_cancelled",
          at: new Date().toISOString(),
        },
      },
    ]);

    const receiverEmail =
      existing?.payload?.receiver_email ?? existing?.payload?.email ?? null;
    if (!receiverEmail) {
      console.warn(
        "[bookings-ledger/cancel] Skipping notification enqueue: missing receiver email"
      );
    } else {
      const { error: notifErr } = await supabase
        .from("notification_queue")
        .insert([
          {
            kind: "booking_cancelled",
            to_email: receiverEmail,
            meta: {
              booking_id: body.booking_id,
              customer_name:
                existing?.receiver_name ?? existing?.payload?.customer_name ?? null,
              service_name: existing?.payload?.service_name ?? null,
            },
            status: "pending",
            try_count: 0,
          },
        ]);
      if (notifErr) {
        console.error(
          "[bookings-ledger/cancel] notification_queue enqueue error:",
          notifErr?.message || notifErr
        );
      } else {
        await triggerEmailQueueWorker();
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Booking cancelled successfully",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("💥 fatal cancel error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Cancellation failed" },
      { status: 500 }
    );
  }
}
