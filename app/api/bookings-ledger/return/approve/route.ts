// app/api/bookings-ledger/return/approve/route.ts
// Approves a return request; logs event, enqueues notification_queue, triggers email-queue-worker.
export const runtime = "nodejs";

import { supabaseServer } from "@/lib/supabaseServerClient";
import { triggerEmailQueueWorker } from "@/lib/notifications/triggerEmailQueueWorker";
import { NextResponse } from "next/server";

interface ApproveReturnPayload {
  booking_id: string;
  admin_id: string;
  notes?: string;
}

export async function POST(req: Request) {
  const supabase = supabaseServer;

  try {
    const body = (await req.json()) as ApproveReturnPayload;

    if (!body.booking_id)
      return NextResponse.json(
        { success: false, message: "booking_id required" },
        { status: 400 }
      );

    if (!body.admin_id)
      return NextResponse.json(
        { success: false, message: "admin_id required" },
        { status: 400 }
      );

    // Fetch booking
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

    // Validate status
    if (booking.status !== "return_requested") {
      return NextResponse.json(
        {
          success: false,
          message: `Return cannot be approved when status is "${booking.status}"`,
        },
        { status: 400 }
      );
    }

    // Update booking ledger
    const { error: updErr } = await supabase
      .from("bookings_ledger")
      .update({
        status: "return_approved",
        event_count: (booking.event_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.booking_id);

    if (updErr) {
      console.error("❌ return approve update error:", updErr);
      return NextResponse.json(
        { success: false, message: updErr.message },
        { status: 500 }
      );
    }

    // Log event
    await supabase.from("booking_events").insert([
      {
        booking_id: booking.id,
        user_id: booking.user_id,
        event: "return_approved",
        status: "return_approved",
        meta: {
          approved_by: body.admin_id,
          notes: body.notes || null,
        },
      },
    ]);

    const receiverEmail =
      booking?.payload?.receiver_email ?? booking?.payload?.email ?? null;
    if (!receiverEmail) {
      console.warn(
        "[bookings-ledger/return-approve] Skipping notification enqueue: missing receiver email"
      );
    } else {
      const { error: notifErr } = await supabase
        .from("notification_queue")
        .insert([
          {
            kind: "booking_return_approved",
            to_email: receiverEmail,
            meta: {
              booking_id: booking.id,
              customer_name:
                booking?.receiver_name ?? booking?.payload?.customer_name ?? null,
              service_name: booking?.payload?.service_name ?? null,
            },
            status: "pending",
            try_count: 0,
          },
        ]);
      if (notifErr) {
        console.error(
          "[bookings-ledger/return-approve] notification_queue enqueue error:",
          notifErr?.message || notifErr
        );
      } else {
        await triggerEmailQueueWorker();
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Return approved successfully",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("💥 return approve fatal error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Return approval failed" },
      { status: 500 }
    );
  }
}
