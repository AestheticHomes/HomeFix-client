// app/api/bookings-ledger/return/complete/route.ts
export const runtime = "nodejs";

import { supabaseServer } from "@/lib/supabaseServerClient";
import { NextResponse } from "next/server";

interface CompleteReturnPayload {
  booking_id: string;
  admin_id: string;
  notes?: string;
}

export async function POST(req: Request) {
  const supabase = supabaseServer;

  try {
    const body = (await req.json()) as CompleteReturnPayload;

    // Validate
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

    // Validate status flow
    if (booking.status !== "return_approved") {
      return NextResponse.json(
        {
          success: false,
          message: `Return cannot be completed when status is "${booking.status}"`,
        },
        { status: 400 }
      );
    }

    // Update booking
    const { error: updErr } = await supabase
      .from("bookings_ledger")
      .update({
        status: "returned",
        event_count: (booking.event_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking.id);

    if (updErr) {
      console.error("❌ return complete update error:", updErr);
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
        event: "returned",
        status: "returned",
        meta: {
          completed_by: body.admin_id,
          notes: body.notes || null,
        },
      },
    ]);

    // Queue user email
    await supabase.from("notification_queue").insert([
      {
        kind: "email",
        to_email: null,
        subject: "Return Completed",
        html: `
          <p>Your return for booking <b>${booking.id}</b> is completed.</p>
        `,
        meta: {
          bookingId: booking.id,
          action: "return_completed",
        },
        status: "pending",
        try_count: 0,
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Return marked as completed",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("💥 return complete fatal error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Return completion failed" },
      { status: 500 }
    );
  }
}
