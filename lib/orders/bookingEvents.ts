// Helpers to keep booking/event handling consistent across APIs.

const DRAFT_TYPES = new Set([
  "service-draft",
  "product-draft",
  "checkout-pending",
  "cart-draft",
]);

const FINAL_TYPES = new Set([
  "booking",
  "service-booking",
  "product-booking",
  "checkout-paid",
]);

export function isDraftEvent(type?: string | null): boolean {
  if (!type) return false;
  return DRAFT_TYPES.has(type.toLowerCase());
}

export function isFinalBookingEvent(type?: string | null): boolean {
  if (!type) return false;
  return FINAL_TYPES.has(type.toLowerCase());
}
