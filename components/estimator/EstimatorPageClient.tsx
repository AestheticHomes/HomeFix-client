"use client";

import type { ReactElement } from "react";
import SafeViewport from "@/components/layout/SafeViewport";

export default function EstimatorPageClient(): ReactElement {
  return (
    <SafeViewport align="left">
      <div className="py-16 text-[var(--text-primary)]">
        Estimator placeholder — client shell only.
      </div>
    </SafeViewport>
  );
}

