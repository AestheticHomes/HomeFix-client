/**
 * lib/payments/razorpay.ts
 * Razorpay gateway helpers used by payments APIs.
 * - Used by /api/payments/razorpay-order to create gateway orders tied to bookings_ledger rows.
 * - Used by /api/payments/razorpay-webhook to verify HMAC signatures before updating payments + booking_events.
 * Env: pulls keys via razorpayKeys helper (DEBUG_MODE toggles TEST vs LIVE).
 *
 * HomeFix Payments Architecture — target behaviour
 * - payments table: one row per payment attempt; amount stored in paise (amount_paise/amount); status lifecycle
 *   created -> pending -> success|failed|abandoned -> refunded.
 * - booking_events: log booking-level events only (payment_success/payment_failed) with minimal meta.
 * - bookings_ledger: advanced only on successful payment (e.g., status advance_paid/paid_in_full).
 * - Webhook is source of truth; abandoned payments should be auto-marked (e.g., via pg_cron, see SQL in docs).
 */

import crypto from "crypto";
import Razorpay from "razorpay";
import {
  getRazorpayPublicKey,
  getRazorpaySecretKey,
  getRazorpayWebhookSecret,
} from "@/lib/payments/razorpayKeys";

export type PaymentStatus =
  | "created"
  | "pending"
  | "success"
  | "failed"
  | "abandoned"
  | "refunded";

type RazorpayOrderCreateParams = {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, any>;
};

const keyId = getRazorpayPublicKey();
const keySecret = getRazorpaySecretKey();

if (!keyId || !keySecret) {
  throw new Error(
    "Razorpay keys are missing (RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET)"
  );
}

const razorpayClient = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export async function createRazorpayOrder({
  amount,
  currency = "INR",
  receipt,
  notes,
}: RazorpayOrderCreateParams) {
  return razorpayClient.orders.create({
    amount,
    currency,
    receipt,
    notes,
  });
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null
) {
  const secret = getRazorpayWebhookSecret();
  if (!secret) {
    throw new Error("RAZORPAY_WEBHOOK_SECRET not configured");
  }
  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return digest === (signature || "");
}
