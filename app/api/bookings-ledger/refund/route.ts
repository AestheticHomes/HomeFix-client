// app/api/bookings-ledger/refund/route.ts
// Processes refunds for returned bookings; logs event, enqueues notification_queue, triggers email-queue-worker.
export const runtime = "nodejs";

import { supabaseServer } from "@/lib/supabaseServerClient";
import { triggerEmailQueueWorker } from "@/lib/notifications/triggerEmailQueueWorker";
import { NextResponse } from "next/server";

interface RefundPayload {
  booking_id: string;
  admin_id: string;
  amount: number;
  notes?: string;
}

export async function POST(req: Request) {
  const supabase = supabaseServer;

  try {
    const body = (await req.json()) as RefundPayload;

    // Required fields
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

    if (!body.amount || body.amount <= 0)
      return NextResponse.json(
        { success: false, message: "Valid refund amount required" },
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
    if (booking.status !== "returned") {
      return NextResponse.json(
        {
          success: false,
          message: `Refund cannot be processed unless booking is 'returned'. Current: ${booking.status}`,
        },
        { status: 400 }
      );
    }

    // Prevent double refunds
    if (booking.refund_amount && booking.refund_amount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Refund already processed for this booking",
        },
        { status: 400 }
      );
    }

    // ------------------------------
    // 👇 This is where payment gateway refund will happen later
    // Razorpay → refund(payment_id, amount)
    // Stripe → refund(charge_id, amount)
    // For now: Soft-confirmation only
    // ------------------------------

    // Update booking ledger
    const { error: updErr } = await supabase
      .from("bookings_ledger")
      .update({
        status: "refunded",
        refund_amount: body.amount,
        refund_processed_at: new Date().toISOString(),
        event_count: (booking.event_count || 0) + 1,
        updated_at: new Date().toISOString(),
        meta: {
          ...(booking.meta || {}),
          refund_notes: body.notes || null,
        },
      })
      .eq("id", booking.id);

    if (updErr) {
      console.error("❌ refund update error:", updErr);
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
        event: "refunded",
        status: "refunded",
        meta: {
          amount: body.amount,
          refund_by: body.admin_id,
          notes: body.notes || null,
        },
      },
    ]);

    const receiverEmail =
      booking?.payload?.receiver_email ?? booking?.payload?.email ?? null;
    if (!receiverEmail) {
      console.warn(
        "[bookings-ledger/refund] Skipping notification enqueue: missing receiver email"
      );
    } else {
      const { error: notifErr } = await supabase
        .from("notification_queue")
        .insert([
          {
            kind: "booking_refund",
            to_email: receiverEmail,
            meta: {
              booking_id: booking.id,
              customer_name:
                booking?.receiver_name ?? booking?.payload?.customer_name ?? null,
              refund_amount: body.amount,
              refund_reason: body.notes || null,
            },
            status: "pending",
            try_count: 0,
          },
        ]);
      if (notifErr) {
        console.error(
          "[bookings-ledger/refund] notification_queue enqueue error:",
          notifErr?.message || notifErr
        );
      } else {
        await triggerEmailQueueWorker();
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Refund processed successfully",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("💥 refund fatal error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Refund process failed" },
      { status: 500 }
    );
  }
}
