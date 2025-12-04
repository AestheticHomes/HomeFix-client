/**
 * ========================================================================
 * Page: /payments/[bookingId]
 * ------------------------------------------------------------------------
 * Purpose:
 * - Show a booking payment summary and allow the user to pay via Razorpay.
 *
 * External deps:
 * - API: /api/bookings-ledger/[id] (or equivalent) to fetch booking details.
 * - API: /api/payments/razorpay-order to create Razorpay orders.
 * - Razorpay Checkout.js (browser script).
 *
 * Notes:
 * - This file owns only the page shell + metadata.
 * - The actual Razorpay interaction lives in PaymentPageClient.
 * ========================================================================
 */

import type { Metadata } from "next";
import PaymentPageClient from "./PaymentPageClient";

type PageProps = {
  params: { bookingId: string };
};

export const metadata: Metadata = {
  title: "HomeFix — Payment",
  description: "Secure payment for your HomeFix booking.",
};

export default function PaymentPage({ params }: PageProps) {
  return <PaymentPageClient bookingId={params.bookingId} />;
}
