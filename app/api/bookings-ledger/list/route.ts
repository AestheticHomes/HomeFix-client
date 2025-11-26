// app/api/bookings-ledger/list/route.ts
export const runtime = "nodejs";

import { supabaseServer } from "@/lib/supabaseServerClient";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const supabase = supabaseServer;
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json(
      { success: false, message: "user_id is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch bookings for user
    const { data: bookings, error: err1 } = await supabase
      .from("bookings_ledger")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (err1) {
      console.error("❌ list bookings error:", err1);
      return NextResponse.json(
        { success: false, message: err1.message },
        { status: 500 }
      );
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    // Fetch events for all bookings
    const bookingIds = bookings.map((b) => b.id);

    const { data: events, error: err2 } = await supabase
      .from("booking_events")
      .select("*")
      .in("booking_id", bookingIds)
      .order("created_at", { ascending: true });

    if (err2) {
      console.error("⚠️ list events error:", err2);
    }

    // Organize events per booking
    const eventsMap: Record<string, any[]> = {};
    for (const ev of events || []) {
      if (!eventsMap[ev.booking_id]) eventsMap[ev.booking_id] = [];
      eventsMap[ev.booking_id].push(ev);
    }

    // Merge bookings with their events
    const result = bookings.map((b) => ({
      ...b,
      events: eventsMap[b.id] || [],
      last_event: eventsMap[b.id]?.[eventsMap[b.id].length - 1] || null,
    }));

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (err: any) {
    console.error("💥 fatal list error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to list bookings" },
      { status: 500 }
    );
  }
}
