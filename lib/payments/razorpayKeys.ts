/**
 * lib/payments/razorpayKeys.ts
 * Single source of truth for Razorpay TEST/LIVE keys driven by DEBUG_MODE.
 * - Shared by order creation (/api/payments/razorpay-order), webhook verification, and client checkout.
 * - Routes bookings/payments to the right gateway env (bookings_ledger + payments + booking_events rely on this).
 * Env: DEBUG_MODE toggles *_TEST vs *_LIVE sets (public key, secret key, webhook secret). Falls back to legacy
 * envs (NEXT_PUBLIC_RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET / RAZORPAY_WEBHOOK_SECRET) if mode-specific keys are unset.
 */
/**
 * HomeFix / Razorpay key resolver
 * --------------------------------
 * Chooses TEST or LIVE keys based on DEBUG_MODE / NEXT_PUBLIC_DEBUG_MODE.
 * Env contract (based on .env screenshot):
 *  - NEXT_PUBLIC_RAZORPAY_KEY_ID          : live public key
 *  - RAZORPAY_KEY_SECRET                  : live secret
 *  - RAZORPAY_WEBHOOK_SECRET              : live webhook secret
 *  - NEXT_PUBLIC_RAZORPAY_KEY_ID_TEST     : test public key
 *  - RAZORPAY_KEY_SECRET_TEST             : test secret
 *  - RAZORPAY_WEBHOOK_SECRET_TEST         : test webhook secret
 */

export function isDebugMode(): boolean {
  return (
    process.env.NEXT_PUBLIC_DEBUG_MODE === "true" ||
    process.env.DEBUG_MODE === "true"
  );
}

export function getRazorpayPublicKey(): string | undefined {
  return isDebugMode()
    ? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID_TEST
    : process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
}

export function getRazorpaySecretKey(): string | undefined {
  return isDebugMode()
    ? process.env.RAZORPAY_KEY_SECRET_TEST
    : process.env.RAZORPAY_KEY_SECRET;
}

export function getRazorpayWebhookSecret(): string | undefined {
  return isDebugMode()
    ? process.env.RAZORPAY_WEBHOOK_SECRET_TEST
    : process.env.RAZORPAY_WEBHOOK_SECRET;
}
