// app/api/bookings-ledger/return/approve/route.ts
export const runtime = "nodejs";

import { supabaseService } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

interface ApproveReturnPayload {
  booking_id: string;
  admin_id: string;
  notes?: string;
}

export async function POST(req: Request) {
  const supabase = supabaseService();

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

    // Notify user
    await supabase.from("notification_queue").insert([
      {
        kind: "email",
        to_email: null,
        subject: "Your Return Has Been Approved",
        html: `<p>Your return request for booking <b>${booking.id}</b> has been approved.</p>`,
        meta: {
          bookingId: booking.id,
          action: "return_approved",
        },
        status: "pending",
        try_count: 0,
      },
    ]);

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
