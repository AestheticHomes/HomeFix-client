"use client";
/**
 * components/ui/toaster.tsx
 * ------------------------------------------------------------
 * Renders Edith toast stack; styled with theme tokens and raised above docked nav.
 */

import { Toaster } from "sonner";

export function EdithToaster() {
  return (
    <Toaster
      position="bottom-center"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: "var(--edith-surface)",
          color: "var(--text-primary)",
          border: "1px solid var(--edith-border)",
        },
        className:
          "shadow-[0_10px_30px_rgba(0,0,0,0.35)] pointer-events-auto z-[70]",
      }}
    />
  );
}
