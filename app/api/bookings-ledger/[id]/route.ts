// app/api/bookings-ledger/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabaseClient";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = supabaseService();
  const bookingId = params.id;

  if (!bookingId) {
    return NextResponse.json(
      { success: false, message: "booking ID is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch booking
    const { data: booking, error: err1 } = await supabase
      .from("bookings_ledger")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (err1) {
      console.error("❌ booking fetch error:", err1);
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    // Fetch timeline events
    const { data: events, error: err2 } = await supabase
      .from("booking_events")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: true });

    if (err2) {
      console.error("⚠️ event fetch error:", err2);
    }

    return NextResponse.json(
      {
        success: true,
        booking,
        events: events || [],
        last_event: events?.[events.length - 1] || null,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("💥 fatal detail error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch booking" },
      { status: 500 }
    );
  }
}
