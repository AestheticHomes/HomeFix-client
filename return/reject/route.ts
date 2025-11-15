// app/api/bookings-ledger/return/reject/route.ts
export const runtime = "nodejs";

import { supabaseService } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

interface RejectReturnPayload {
  booking_id: string;
  admin_id: string;
  reason: string;
}

export async function POST(req: Request) {
  const supabase = supabaseService();

  try {
    const body = (await req.json()) as RejectReturnPayload;

    // Validation
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

    if (!body.reason)
      return NextResponse.json(
        { success: false, message: "reason required for rejection" },
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

    // Check state
    if (booking.status !== "return_requested") {
      return NextResponse.json(
        {
          success: false,
          message: `Return cannot be rejected when status is "${booking.status}"`,
        },
        { status: 400 }
      );
    }

    // Update bookings ledger
    const { error: updErr } = await supabase
      .from("bookings_ledger")
      .update({
        status: "return_rejected",
        event_count: (booking.event_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id);

    if (updErr) {
      console.error("❌ return reject update error:", updErr);
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
        event: "return_rejected",
        status: "return_rejected",
        meta: {
          rejected_by: body.admin_id,
          reason: body.reason,
        },
      },
    ]);

    // Notify user
    await supabase.from("notification_queue").insert([
      {
        kind: "email",
        to_email: null,
        subject: "Return Request Rejected",
        html: `
          <p>Your return request for booking <b>${booking.id}</b> has been rejected.</p>
          <p><b>Reason:</b> ${body.reason}</p>
        `,
        meta: {
          bookingId: booking.id,
          reason: body.reason,
          action: "return_rejected",
        },
        status: "pending",
        try_count: 0,
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Return rejected successfully",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("💥 return reject fatal error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Return rejection failed" },
      { status: 500 }
    );
  }
}
