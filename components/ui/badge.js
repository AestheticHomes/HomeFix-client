/**
 * File: /components/ui/badge.js
 * Purpose: (auto-added during Portable Cleanup) — add a concise, human-readable purpose for this file.
 * Process: Part of HomeFix portable refactor; no functional changes made by header.
 * Dependencies: Review local imports; ensure single supabase client in /lib when applicable.
 * Note: This header is documentation-only and safe to remove or edit.
 */
export function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-block text-xs font-medium text-white px-2 py-1 rounded ${className}`}
    >
      {children}
    </span>
  );
}
