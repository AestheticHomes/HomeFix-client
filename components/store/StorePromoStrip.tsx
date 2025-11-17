"use client";

import Link from "next/link";
import ContextStrip from "@/components/layout/ContextStrip";

export default function StorePromoStrip() {
  return (
    <ContextStrip
      title="Seasonal sale"
      subtitle="Modular kitchen & wardrobes — design & book with special pricing."
      ctaLabel="View offers →"
      ctaHref="/offers"
    />
  );
}
