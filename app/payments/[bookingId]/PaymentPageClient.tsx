/**
 * app/payments/[bookingId]/PaymentPageClient.tsx
 * Client-side container for the /payments/[bookingId] page. Handles the browser
 * experience for initiating Razorpay checkout against the server API
 * (/api/payments/razorpay-order). Currently renders a placeholder shell so the
 * route compiles and can be wired to Razorpay Checkout.js later.
 */
"use client";

import SafeViewport from "@/components/layout/SafeViewport";

type PaymentPageClientProps = {
  bookingId: string;
};

export default function PaymentPageClient({
  bookingId,
}: PaymentPageClientProps) {
 return (
    <SafeViewport>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        <h1 className="text-xl font-semibold text-(--text-primary)">
          Complete your payment
        </h1>
        <p className="text-sm text-(--text-secondary)">
          Booking reference: <span className="font-mono">{bookingId}</span>
        </p>
        <p className="text-sm text-(--text-secondary)">
          Payment UI placeholder — wire this to Razorpay Checkout by calling{" "}
          <code className="px-1 py-0.5 rounded bg-(--edith-surface) border border-(--edith-border)">
            /api/payments/razorpay-order
          </code>{" "}
          to fetch an order_id, then pass it to Razorpay&apos;s Checkout.js.
        </p>
      </div>
    </SafeViewport>
  );
}
