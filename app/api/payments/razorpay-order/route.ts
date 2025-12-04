/**
 * ========================================================================
 * API: POST /api/payments/razorpay-order
 * ------------------------------------------------------------------------
 * Purpose:
 * - Create a Razorpay order for a given booking and amount (paise).
 * - Persist a payments row linked to bookings_ledger for audit/reconciliation.
 *
 * Architecture links:
 * - Validates the logged-in user (hf_user_id cookie) against bookings_ledger.
 * - Writes to payments table (gateway_order_id, amount, status=created, meta raw order).
 * - Downstream status updates happen via /api/payments/razorpay-webhook and booking_events.
 * - DEBUG_MODE drives TEST vs LIVE keys via razorpayKeys helper.
 *
 * External deps:
 * - Razorpay Orders API (keys resolved by razorpayKeys helper)
 * - Supabase (bookings_ledger, payments)
 *
 * Contract:
 * - Request: { booking_id: string, amount: number (paise) }
 * - Response: { success: true, orderId, amount, currency }
 * ========================================================================
 */
/**
 * Investigation notes (2025-02-06):
 * - Creates Razorpay order and inserts payments row with status "created" and column `amount` (paise semantics).
 * - Webhook later updates status; bookings_ledger only advanced on success there.
 * - No payment_failed events logged yet; statuses beyond created/success not fully used.
 */

import { supabaseServer } from "@/lib/supabaseServerClient"; // adjust if different
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRazorpayOrder } from "@/lib/payments/razorpay";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get("hf_user_id")?.value ?? null;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { booking_id, amount } = body as {
      booking_id?: string;
      amount?: number; // in paise
    };

    const amountPaise = Number(amount);

    if (!booking_id || !Number.isFinite(amountPaise) || amountPaise <= 0) {
      return NextResponse.json(
        { success: false, message: "booking_id and valid amount are required" },
        { status: 400 }
      );
    }

    const supabase = supabaseServer;

    // Ownership check
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings_ledger")
      .select("id,user_id,total")
      .eq("id", booking_id)
      .single();

    if (bookingErr || !booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.user_id !== userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized booking access" },
        { status: 403 }
      );
    }

    const order = await createRazorpayOrder({
      amount: amountPaise,
      currency: "INR",
      receipt: booking_id,
      notes: { booking_id },
    });

    // Minimal payments row – expand as needed (amount stored in paise; see SQL note to rename column to amount_paise)
    const { error } = await supabase.from("payments").insert({
      booking_id,
      gateway: "razorpay",
      gateway_order_id: order.id,
      amount: amountPaise,
      currency: "INR",
      status: "created",
      meta: order,
    });

    if (error) {
      console.error("payments insert error", error);
      // not fatal for user, but log it
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: amountPaise,
      currency: order.currency || "INR",
    });
  } catch (err) {
    console.error("razorpay-order error", err);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    );
  }
}
