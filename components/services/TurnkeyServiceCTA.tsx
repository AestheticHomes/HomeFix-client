"use client";

import Link from "next/link";

type Variant = "hero" | "inline";

type TurnkeyServiceCTAProps = {
  serviceKey: keyof typeof TURNKEY_SERVICE_CONFIG;
  variant?: Variant;
};

const TURNKEY_SERVICE_CONFIG = {
  "modular-kitchens": {
    checkoutPath:
      "/checkout?type=service&service=modular-kitchens&bookingType=site-visit&free=1",
    label: "Book free site visit",
    subtext: "Free consultation + site visit for your kitchen plan.",
  },
  wardrobes: {
    checkoutPath:
      "/checkout?type=service&service=wardrobes&bookingType=site-visit&free=1",
    label: "Book free site visit",
    subtext: "Plan wardrobes and lofts with our designers.",
  },
  bathroom: {
    checkoutPath:
      "/checkout?type=service&service=bathroom&bookingType=site-visit&free=1",
    label: "Book free site visit",
    subtext: "Site visit and estimate for your bathroom remodel.",
  },
  tiling: {
    checkoutPath:
      "/checkout?type=service&service=tiling&bookingType=site-visit&free=1",
    label: "Book free site visit",
    subtext: "Get a tiling assessment with no booking fee.",
  },
  civil: {
    checkoutPath:
      "/checkout?type=service&service=civil&bookingType=site-visit&free=1",
    label: "Book free site visit",
    subtext: "Structural/civil site check with our engineer.",
  },
  "full-home": {
    checkoutPath:
      "/checkout?type=service&service=full-home&bookingType=site-visit&free=1",
    label: "Book free site visit",
    subtext: "Full-home interiors planning starts with a free visit.",
  },
} as const;

export default function TurnkeyServiceCTA({
  serviceKey,
  variant = "hero",
}: TurnkeyServiceCTAProps) {
  const cfg = TURNKEY_SERVICE_CONFIG[serviceKey];
  if (!cfg) return null;

  const baseClasses =
    "inline-flex items-center justify-center rounded-full text-sm font-semibold transition";
  const styles =
    variant === "hero"
      ? {
          className: `${baseClasses} px-5 py-2.5 text-white`,
          style: { background: "var(--accent-primary)" },
        }
      : {
          className: `${baseClasses} px-4 py-2 text-white`,
          style: { background: "var(--accent-primary)" },
        };

  return (
    <div className="space-y-1">
      <Link href={cfg.checkoutPath} className={styles.className} style={styles.style}>
        {cfg.label}
      </Link>
      {cfg.subtext && (
        <p className="text-xs text-[var(--text-secondary)]">{cfg.subtext}</p>
      )}
    </div>
  );
}
