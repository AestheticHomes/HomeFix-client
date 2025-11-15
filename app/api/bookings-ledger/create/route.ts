// app/api/bookings-ledger/create/route.ts
export const runtime = "nodejs";

import { supabaseService } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

interface CreateBookingPayload {
  user_id: string;
  items: any[];
  total: number;

  address: string;
  landmark?: string;
  pincode?: string;

  latitude: number;
  longitude: number;

  receiver_name: string;
  receiver_phone: string;

  device_id?: string;
  source?: string;
  channel?: string;
  schema_version?: number;
}

function safe(v: any) {
  try {
    return JSON.parse(JSON.stringify(v));
  } catch {
    return v;
  }
}

export async function POST(req: Request) {
  const supabase = supabaseService();

  try {
    const body = (await req.json()) as CreateBookingPayload;

    if (!body?.user_id) {
      return NextResponse.json(
        { success: false, message: "user_id is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "items array empty" },
        { status: 400 }
      );
    }

    const bookingRow = {
      user_id: body.user_id,
      type: "booking",
      status: "pending",

      channel: body.channel || "pwa",
      source: body.source || "homefix",
      device_id: body.device_id || "unknown",
      checksum: crypto.randomUUID().slice(0, 8),

      schema_version: body.schema_version || 1,

      // Address fields
      address: body.address,
      landmark: body.landmark || null,
      pincode: body.pincode || null,

      latitude: body.latitude,
      longitude: body.longitude,

      receiver_name: body.receiver_name,
      receiver_phone: body.receiver_phone,

      items: safe(body.items),
      total: body.total,

      payload: safe(body),
      event_count: 1,
    };

    // Insert into bookings_ledger
    const { data: created, error: err1 } = await supabase
      .from("bookings_ledger")
      .insert([bookingRow])
      .select()
      .single();

    if (err1) {
      console.error("❌ Insert booking error:", err1);
      return NextResponse.json(
        { success: false, message: err1.message },
        { status: 500 }
      );
    }

    const bookingId = created.id;

    // Insert event
    await supabase.from("booking_events").insert([
      {
        booking_id: bookingId,
        user_id: body.user_id,
        event: "created",
        status: "pending",
        meta: {
          total: body.total,
          item_count: body.items.length,
          source: bookingRow.source,
          channel: bookingRow.channel,
        },
      },
    ]);

    // Notify queue (optional)
    await supabase.from("notification_queue").insert([
      {
        kind: "email",
        to_email: null,
        subject: "Booking Created",
        html: `<p>Your booking has been created.</p>`,
        meta: { bookingId, user_id: body.user_id },
        status: "pending",
        try_count: 0,
      },
    ]);

    return NextResponse.json(
      { success: true, booking: created },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("💥 Fatal create booking error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Booking creation failed" },
      { status: 500 }
    );
  }
}
