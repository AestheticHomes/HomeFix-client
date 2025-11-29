"use client";

import Link from "next/link";

/**
 * ConsultationCtaRow
 * Central CTA for a single free booking (consultation OR site visit) + call.
 * - Uses NEXT_PUBLIC_HOMEFIX_PRIMARY_PHONE for phone.
 * - Routes to /checkout (service mode) with type + bookingType + optional service slug.
 */
type ConsultationCtaRowProps = {
  /** Optional slug/identifier for the current service, e.g. "modular-kitchens" */
  serviceKey?: string;
  /** Visual density; "hero" is a bit roomier, "compact" is tighter. */
  variant?: "hero" | "compact";
  /** Which type of free booking this CTA should represent. */
  bookingType?: "consultation" | "site-visit";
};

const BOOKING_PATH = "/checkout";

function buildBookingHref(type: "consultation" | "site-visit", serviceKey?: string) {
  const params = new URLSearchParams();
  params.set("type", "service");
  params.set("bookingType", type);
  params.set("free", "1");
  if (serviceKey) params.set("service", serviceKey);
  return `${BOOKING_PATH}?${params.toString()}`;
}

export default function ConsultationCtaRow({
  serviceKey,
  variant = "hero",
  bookingType,
}: ConsultationCtaRowProps) {
  const mode = bookingType ?? "consultation";
  const rawPhone =
    process.env.NEXT_PUBLIC_HOMEFIX_PRIMARY_PHONE ?? "+91 72000 91892";
  const phoneDigits = rawPhone.replace(/[^\d+]/g, "");
  const phoneHref = `tel:${phoneDigits}`;

  const baseClasses = "inline-flex items-center justify-center rounded-full text-sm font-medium";
  const padding = variant === "compact" ? "px-3 py-1.5" : "px-4 py-2";

  const primaryLabel =
    mode === "site-visit" ? "Schedule free site visit" : "Book free consultation";

  const href = buildBookingHref(mode, serviceKey);

  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href={href}
        className={`${baseClasses} ${padding} text-white`}
        style={{ background: "var(--accent-primary)" }}
      >
        {primaryLabel}
      </Link>

      <a
        href={phoneHref}
        className={`${baseClasses} ${padding} border`}
        style={{
          borderColor: "var(--border-soft)",
          color: "var(--accent-secondary)",
        }}
      >
        Call us: {rawPhone}
      </a>
    </div>
  );
}
