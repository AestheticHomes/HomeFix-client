"use client";
/**
 * File: /components/ui/dialog.js
 * Purpose: (auto-added during Portable Cleanup) — add a concise, human-readable purpose for this file.
 * Process: Part of HomeFix portable refactor; no functional changes made by header.
 * Dependencies: Review local imports; ensure single supabase client in /lib when applicable.
 * Note: This header is documentation-only and safe to remove or edit.
 */
"use client";

import { cn } from "@/lib/utils"; // or inline a helper if needed
import * as DialogPrimitive from "@radix-ui/react-dialog";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export function DialogContent({ className, ...props }) {
  return (
    <DialogPrimitive.Portal>
      {/* Overlay */}
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]" />

      {/* Content (critical: high z-index!) */}
      <DialogPrimitive.Content
        {...props}
        className={cn(
          "fixed left-1/2 top-1/2 z-[80] w-full max-w-md -translate-x-1/2 -translate-y-1/2",
          "rounded-2xl bg-[var(--edith-surface)] border border-[var(--edith-border)]",
          "shadow-2xl focus:outline-none",
          className
        )}
      />
    </DialogPrimitive.Portal>
  );
}

export const DialogHeader = ({ children }) => (
  <div className="mb-2">{children}</div>
);
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
