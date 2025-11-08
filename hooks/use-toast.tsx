"use client";

/**
 * //hooks/use-toast.tsx
 * Edith Toast System v3.3 — Client-Only Safe Hook 🌿
 */

import { toast } from "sonner";

export function useToast() {
  return {
    toast, // optional base method (can remove if unused)
    success: (msg: string) => toast.success(msg),
    error: (msg: string) => toast.error(msg),
    info: (msg: string) => toast(msg),
  };
}