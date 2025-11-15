// app/api/bookings-ledger/reschedule/route.ts
export const runtime = "nodejs";

import { supabaseService } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

interface ReschedulePayload {
  booking_id: string;
  user_id: string;
  preferred_date: string;
  preferred_slot: string;
}

export async function POST(req: Request) {
  const supabase = supabaseService();

  try {
    const body = (await req.json()) as ReschedulePayload;

    // Basic validation
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

    if (!body.preferred_date || !body.preferred_slot)
      return NextResponse.json(
        {
          success: false,
          message: "preferred_date and preferred_slot are required",
        },
        { status: 400 }
      );

    // Fetch booking to verify it exists & belongs to user
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

    if (existing.user_id !== body.user_id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized booking access" },
        { status: 403 }
      );
    }

    if (existing.status === "cancelled") {
      return NextResponse.json(
        { success: false, message: "Cancelled booking cannot be rescheduled" },
        { status: 400 }
      );
    }

    if (existing.status === "completed") {
      return NextResponse.json(
        { success: false, message: "Completed booking cannot be rescheduled" },
        { status: 400 }
      );
    }

    // Update ledger entry
    const { error: updErr } = await supabase
      .from("bookings_ledger")
      .update({
        preferred_date: body.preferred_date,
        preferred_slot: body.preferred_slot,
        status: "rescheduled",
        event_count: (existing.event_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.booking_id);

    if (updErr) {
      console.error("❌ reschedule update error:", updErr);
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
        event: "rescheduled",
        status: "rescheduled",
        meta: {
          new_date: body.preferred_date,
          new_slot: body.preferred_slot,
        },
      },
    ]);

    // Notification queue email
    await supabase.from("notification_queue").insert([
      {
        kind: "email",
        to_email: null,
        subject: "Your booking was rescheduled",
        html: `<p>Your booking has been rescheduled.</p>`,
        meta: {
          bookingId: body.booking_id,
          newDate: body.preferred_date,
          newSlot: body.preferred_slot,
        },
        status: "pending",
        try_count: 0,
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Booking rescheduled successfully",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("💥 fatal reschedule error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Reschedule failed" },
      { status: 500 }
    );
  }
}
