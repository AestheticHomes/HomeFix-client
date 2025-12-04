/**
 * POST /api/bookings-ledger/reschedule
 * Reschedules a booking: updates preferred_date/slot, logs booking_events,
 * and enqueues notification_queue for email worker.
 */
export const runtime = "nodejs";

import { triggerEmailQueueWorker } from "@/lib/notifications/triggerEmailQueueWorker";
import { supabaseServer } from "@/lib/supabaseServerClient";
import { NextResponse } from "next/server";

interface ReschedulePayload {
  booking_id: string;
  user_id?: string;
  preferred_date: string;
  preferred_slot: string;
}

export async function POST(req: Request) {
  const supabase = supabaseServer;

  try {
    const body = (await req.json()) as ReschedulePayload;
    const { booking_id, user_id, preferred_date, preferred_slot } = body;

    // ── 1) Basic payload validation ──────────────────────────────
    if (!booking_id) {
      return NextResponse.json(
        { success: false, message: "booking_id is required" },
        { status: 400 }
      );
    }

    if (!preferred_date || !preferred_slot) {
      return NextResponse.json(
        {
          success: false,
          message: "preferred_date and preferred_slot are required",
        },
        { status: 400 }
      );
    }

    // ── 2) Fetch existing booking ────────────────────────────────
    const { data: existing, error: fetchErr } = await supabase
      .from("bookings_ledger")
      .select("*")
      .eq("id", booking_id)
      .single();

    if (fetchErr || !existing) {
      console.error(
        "[bookings-ledger/reschedule] fetch error or missing booking:",
        fetchErr
      );
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    // Optional ownership check when user_id is provided
    if (user_id && existing.user_id !== user_id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized booking access" },
        { status: 403 }
      );
    }

    if (existing.status === "cancelled") {
      return NextResponse.json(
        {
          success: false,
          message: "Cancelled booking cannot be rescheduled",
        },
        { status: 400 }
      );
    }

    if (existing.status === "completed") {
      return NextResponse.json(
        {
          success: false,
          message: "Completed booking cannot be rescheduled",
        },
        { status: 400 }
      );
    }

    // ── 3) Prepare new payload (keep existing financials/meta) ───
    const prevDate = existing.preferred_date;
    const prevSlot = existing.preferred_slot;

    const nextPayload = {
      ...(existing?.payload || {}),
      service_preferences: {
        ...(existing?.payload?.service_preferences || {}),
        preferred_date,
        preferred_slot,
      },
    };

    // ── 4) Update ledger row ─────────────────────────────────────
    const { error: updErr } = await supabase
      .from("bookings_ledger")
      .update({
        preferred_date,
        preferred_slot,
        payload: nextPayload,
        status: "rescheduled",
        event_count: (existing.event_count || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", booking_id);

    if (updErr) {
      console.error("❌ [bookings-ledger/reschedule] update error:", updErr);
      return NextResponse.json(
        { success: false, message: updErr.message || "Update failed" },
        { status: 500 }
      );
    }

    // ── 5) Log booking_events entry ──────────────────────────────
    await supabase.from("booking_events").insert([
      {
        booking_id,
        user_id: user_id ?? existing.user_id ?? null,
        event: "rescheduled",
        status: "rescheduled",
        meta: {
          old_date: prevDate ?? null,
          old_slot: prevSlot ?? null,
          new_date: preferred_date,
          new_slot: preferred_slot,
        },
      },
    ]);

    // ── 6) Enqueue email notification (if receiver email exists) ─
    const receiverEmail =
      existing?.payload?.receiver_email ??
      existing?.payload?.email ??
      existing?.receiver_email ??
      null;

    if (!receiverEmail) {
      console.warn(
        "[bookings-ledger/reschedule] Skipping notification enqueue: missing receiver email for booking_id",
        booking_id
      );
    } else {
      const { error: notifErr } = await supabase
        .from("notification_queue")
        .insert([
          {
            kind: "booking_rescheduled",
            to_email: receiverEmail,
            meta: {
              booking_id,
              customer_name:
                existing?.receiver_name ??
                existing?.payload?.customer_name ??
                null,
              service_name: existing?.payload?.service_name ?? null,
              scheduled_date: preferred_date,
              scheduled_slot: preferred_slot,
            },
            status: "pending",
            try_count: 0,
          },
        ]);

      if (notifErr) {
        console.error(
          "[bookings-ledger/reschedule] notification_queue enqueue error:",
          notifErr?.message || notifErr
        );
      } else {
        // fire-and-forget queue worker
        await triggerEmailQueueWorker();
      }
    }

    // ── 7) Done ──────────────────────────────────────────────────
    return NextResponse.json(
      {
        success: true,
        message: "Booking rescheduled successfully",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("💥 [bookings-ledger/reschedule] fatal error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Reschedule failed" },
      { status: 500 }
    );
  }
}
