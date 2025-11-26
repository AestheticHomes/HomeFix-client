// app/api/bookings-ledger/return/route.ts
export const runtime = "nodejs";

import { supabaseServer } from "@/lib/supabaseServerClient";
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

    // Queue email
    await supabase.from("notification_queue").insert([
      {
        kind: "email",
        to_email: null,
        subject: "Return Request Submitted",
        html: `<p>Your return request has been submitted.</p>`,
        meta: {
          bookingId: body.booking_id,
          reason: body.reason,
        },
        status: "pending",
        try_count: 0,
      },
    ]);

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
