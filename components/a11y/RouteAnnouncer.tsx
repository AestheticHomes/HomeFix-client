// components/a11y/RouteAnnouncer.tsx
"use client";
/**
 * =====================================================================
 * 📢 RouteAnnouncer (v1.0)
 * ---------------------------------------------------------------------
 * PURPOSE
 *   Provide a screen-reader-only aria-live region that announces route
 *   changes. App Router has one, but this keeps our a11y consistent.
 *
 * BEHAVIOR
 *   - Announces on path change.
 *   - No visual impact; follows global tokens.
 * =====================================================================
 */

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function RouteAnnouncer() {
  const pathname = usePathname();
  const [message, setMessage] = useState("Page loaded");
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setMessage(`Navigated to ${pathname || "home"}`);
  }, [pathname]);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      style={{ color: "var(--text-primary)" }}
    >
      {message}
    </div>
  );
}
