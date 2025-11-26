// app/api/bookings-ledger/cancel/route.ts
export const runtime = "nodejs";

import { supabaseServer } from "@/lib/supabaseServerClient";
import { NextResponse } from "next/server";

interface CancelPayload {
  booking_id: string;
  user_id: string;
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

    if (!body?.user_id) {
      return NextResponse.json(
        { success: false, message: "user_id is required" },
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

    if (existing.user_id !== body.user_id) {
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
        user_id: body.user_id,
        event: "cancelled",
        status: "cancelled",
        meta: {
          reason: body.reason || "user_cancelled",
        },
      },
    ]);

    // Add to notification queue
    await supabase.from("notification_queue").insert([
      {
        kind: "email",
        to_email: null,
        subject: "Your booking was cancelled",
        html: `<p>Your booking was cancelled.</p>`,
        meta: { bookingId: body.booking_id },
        status: "pending",
        try_count: 0,
      },
    ]);

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
