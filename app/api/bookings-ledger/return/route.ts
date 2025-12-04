// app/api/bookings-ledger/return/route.ts
// Initiates a return request; logs event, enqueues notification_queue, triggers email-queue-worker.
export const runtime = "nodejs";

import { supabaseServer } from "@/lib/supabaseServerClient";
import { triggerEmailQueueWorker } from "@/lib/notifications/triggerEmailQueueWorker";
import { NextResponse } from "next/server";

interface ReturnRequestPayload {
  booking_id: string;
  user_id: string;
  reason: string;
}

export async function POST(req: Request) {
  const supabase = supabaseServer;

  try {
    const body = (await req.json()) as ReturnRequestPayload;

    // Basic validations
    if (!body.booking_id)
      return NextResponse.json(
        { success: false, message: "booking_id is required" },
        { status: 400 }
      );

    if (!body.user_id)
      return NextResponse.json(
        { success: false, message: "user_id is required" },
        { status: 400 }
      );

    if (!body.reason)
      return NextResponse.json(
        { success: false, message: "reason is required for returns" },
        { status: 400 }
      );

    // Fetch booking & verify user
    const { data: booking, error: fetchErr } = await supabase
      .from("bookings_ledger")
      .select("*")
      .eq("id", body.booking_id)
      .single();

    if (fetchErr || !booking)
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );

    if (booking.user_id !== body.user_id)
      return NextResponse.json(
        { success: false, message: "Unauthorized booking access" },
        { status: 403 }
      );

    // Only allow return on "completed" status
    if (booking.status !== "completed") {
      return NextResponse.json(
        {
          success: false,
          message: "Return can be requested only for completed services/goods",
        },
        { status: 400 }
      );
    }

    // Prevent double return request
    if (booking.status === "return_requested") {
      return NextResponse.json(
        {
          success: true,
          message: "Return already requested",
        },
        { status: 200 }
      );
    }

    // Update booking ledger
    const { error: updErr } = await supabase
      .from("bookings_ledger")
      .update({
        status: "return_requested",
        event_count: (booking.event_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.booking_id);

    if (updErr) {
      console.error("❌ return request update error:", updErr);
      return NextResponse.json(
        { success: false, message: updErr.message },
        { status: 500 }
      );
    }

    // Log event
    await supabase.from("booking_events").insert([
      {
        booking_id: body.booking_id,
        user_id: body.user_id,
        event: "return_requested",
        status: "return_requested",
        meta: {
          reason: body.reason,
        },
      },
    ]);

    const receiverEmail =
      booking?.payload?.receiver_email ?? booking?.payload?.email ?? null;
    if (!receiverEmail) {
      console.warn(
        "[bookings-ledger/return-init] Skipping notification enqueue: missing receiver email"
      );
    } else {
      const { error: notifErr } = await supabase
        .from("notification_queue")
        .insert([
          {
            kind: "booking_return_init",
            to_email: receiverEmail,
            meta: {
              booking_id: body.booking_id,
              customer_name:
                booking?.receiver_name ?? booking?.payload?.customer_name ?? null,
              service_name: booking?.payload?.service_name ?? null,
              return_reason: body.reason,
            },
            status: "pending",
            try_count: 0,
          },
        ]);
      if (notifErr) {
        console.error(
          "[bookings-ledger/return-init] notification_queue enqueue error:",
          notifErr?.message || notifErr
        );
      } else {
        await triggerEmailQueueWorker();
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Return request submitted successfully",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("💥 fatal return request error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Return request failed" },
      { status: 500 }
    );
  }
}
