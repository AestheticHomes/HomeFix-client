/**
 * File: /app/unauthorized/page.js
 * Purpose: (auto-added during Portable Cleanup) — add a concise, human-readable purpose for this file.
 * Process: Part of HomeFix portable refactor; no functional changes made by header.
 * Dependencies: Review local imports; ensure single supabase client in /lib when applicable.
 * Note: This header is documentation-only and safe to remove or edit.
 */
export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center text-center">
      <div>
        <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600 mt-2">
          You don’t have permission to access this page.
        </p>
      </div>
    </main>
  );
}
