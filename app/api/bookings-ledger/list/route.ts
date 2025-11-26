// app/api/bookings-ledger/list/route.ts
export const runtime = "nodejs";
// Supabase bookings_ledger + booking_events are the canonical source of truth for orders.
// Do not read any client cache here.

import { supabaseServer } from "@/lib/supabaseServerClient";
import { NextResponse } from "next/server";
import {
  isDraftEvent,
  isFinalBookingEvent,
} from "@/lib/orders/bookingEvents";

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
      .neq("type", "product-draft")
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

    // Merge bookings with their events, but drop draft-only groups.
    // Only keep bookings that have at least one final booking event OR no events at all.
    const result = bookings
      .map((b) => {
        const evs = eventsMap[b.id] || [];
        const hasFinal = evs.some((ev) => isFinalBookingEvent(ev?.type));
        const draftOnly =
          evs.length > 0 &&
          !hasFinal &&
          evs.every((ev) => isDraftEvent(ev?.type));
        if (draftOnly) return null; // skip draft-only buckets from My Orders

        return {
          ...b,
          events: evs,
          last_event: evs?.[evs.length - 1] || null,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (err: any) {
    console.error("💥 fatal list error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to list bookings" },
      { status: 500 }
    );
  }
}
