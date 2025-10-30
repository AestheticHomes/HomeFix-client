"use client";
/**
 * File: /components/ui/use-toast.js
 * Purpose: (auto-added during Portable Cleanup) — add a concise, human-readable purpose for this file.
 * Process: Part of HomeFix portable refactor; no functional changes made by header.
 * Dependencies: Review local imports; ensure single supabase client in /lib when applicable.
 * Note: This header is documentation-only and safe to remove or edit.
 */

export function toast({ title, description }) {
  if (typeof window !== "undefined") {
    console.log(`🔔 ${title}\n${description || ""}`);
  }
}