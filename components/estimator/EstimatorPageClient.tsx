"use client";

import type { ReactElement } from "react";
import SafeViewport from "@/components/layout/SafeViewport";
import EstimatorShell from "@/components/estimator/EstimatorShell";

export default function EstimatorPageClient(): ReactElement {
  return (
    <SafeViewport align="left">
      <EstimatorShell />
    </SafeViewport>
  );
}
