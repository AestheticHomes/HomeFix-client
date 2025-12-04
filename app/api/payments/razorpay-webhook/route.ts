/**
 * ========================================================================
 * API: POST /api/payments/razorpay-webhook
 * ------------------------------------------------------------------------
 * Purpose:
 * - Receive Razorpay webhooks, verify signature, and reconcile payments.
 *
 * Architecture links:
 * - Updates payments table by gateway_order_id (status, gateway_payment_id, meta).
 * - On captured payments, advances bookings_ledger.status to "advance_paid" and logs booking_events.
 * - Silent no-op when payment row is missing (webhook-safe).
 * - DEBUG_MODE toggles TEST vs LIVE webhook secret via razorpayKeys helper.
 *
 * External deps:
 * - Razorpay HMAC secret (RAZORPAY_WEBHOOK_SECRET)
 * - Supabase (payments, bookings_ledger, booking_events)
 *
 * Contract:
 * - Expects Razorpay payment payload; returns 200 even if payment row not found.
 * ========================================================================
 */
/**
 * Investigation notes (2025-02-06):
 * - Webhook validates signature, then updates payments.status to `success` for captured; other statuses passed through.
 * - Only success path logs booking_events (advance_payment_success) and advances bookings_ledger to advance_paid.
 * - No logging for failures; payments remain "created" if no webhook or failure event arrives.
 */

import { supabaseServer } from "@/lib/supabaseServerClient";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const razorpaySignature = req.headers.get("x-razorpay-signature") || "";

  try {
    const valid = verifyWebhookSignature(rawBody, razorpaySignature);
    if (!valid) {
      console.warn("Invalid Razorpay webhook signature");
      return NextResponse.json({ success: false }, { status: 400 });
    }
  } catch (err) {
    console.error("[razorpay-webhook] signature validation error", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }

  const payload = JSON.parse(rawBody) as any;
  const paymentEntity = payload?.payload?.payment?.entity;
  const orderId = paymentEntity?.order_id as string | undefined;
  const paymentId = paymentEntity?.id as string | undefined;
  const status = paymentEntity?.status as string | undefined;
  const amount = paymentEntity?.amount as number | undefined;

  if (!orderId || !paymentId || !status) {
    return NextResponse.json({ success: true }); // nothing to do
  }

  const supabase = supabaseServer;

  // Find payment row by gateway_order_id
  const { data: payments, error: findErr } = await supabase
    .from("payments")
    .select("id, booking_id, status")
    .eq("gateway_order_id", orderId)
    .limit(1);

  if (findErr) {
    console.error("Payment lookup error for order", orderId, findErr);
    return NextResponse.json({ success: true });
  }

  const payment = payments?.[0];
  if (!payment) {
    // Webhook-safe: do not fail if row missing
    return NextResponse.json({ success: true });
  }

  const nextStatus =
    status === "captured"
      ? "success"
      : status === "failed"
      ? "failed"
      : status === "authorized"
      ? "pending"
      : status || "created";

  // Update payment row
  await supabase
    .from("payments")
    .update({
      status: nextStatus,
      gateway_payment_id: paymentId,
      meta: payload,
    })
    .eq("id", payment.id);

  // If captured, move booking forward and log event
  if (nextStatus === "success") {
    await supabase
      .from("bookings_ledger")
      .update({ status: "advance_paid" })
      .eq("id", payment.booking_id);

    await supabase.from("booking_events").insert([
      {
        booking_id: payment.booking_id,
        event: "advance_payment_success",
        status: "advance_paid",
        meta: {
          amount: amount ?? null,
          provider: "razorpay",
          order_id: orderId,
          payment_id: paymentId,
        },
      },
    ]);
  } else if (nextStatus === "failed") {
    await supabase.from("booking_events").insert([
      {
        booking_id: payment.booking_id,
        event: "payment_failed",
        status: payment.status ?? null,
        meta: {
          amount: amount ?? null,
          provider: "razorpay",
          order_id: orderId,
          payment_id: paymentId,
        },
      },
    ]);
  }

  return NextResponse.json({ success: true });
}
