"use client";
/**
 * components/ui/toaster.tsx
 * ------------------------------------------------------------
 * Renders Edith toast stack with support for success/destructive/default
 */

import { Toaster } from "sonner";

export function EdithToaster() {
  return <Toaster position="top-center" richColors closeButton />;
}
