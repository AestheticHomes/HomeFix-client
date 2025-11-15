// app/api/bookings-ledger/refund/route.ts
export const runtime = "nodejs";

import { supabaseService } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

interface RefundPayload {
  booking_id: string;
  admin_id: string;
  amount: number;
  notes?: string;
}

export async function POST(req: Request) {
  const supabase = supabaseService();

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

    // Queue user email
    await supabase.from("notification_queue").insert([
      {
        kind: "email",
        to_email: null,
        subject: "Refund Processed",
        html: `
          <p>Your refund for booking <b>${booking.id}</b> has been processed.</p>
          <p><b>Amount:</b> ₹${body.amount}</p>
        `,
        meta: {
          bookingId: booking.id,
          amount: body.amount,
          action: "refund",
        },
        status: "pending",
        try_count: 0,
      },
    ]);

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
