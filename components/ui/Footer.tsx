"use client";

/**
 * Footer v4.0 — HomeFix Gemini Glass Continuum 🌌
 * ------------------------------------------------------------
 * ✅ Theme-responsive (light/dark surfaces)
 * ✅ Subtle glass blur & gradient tint
 * ✅ Smooth color transitions
 * ✅ Matches UniversalHeader & Sidebar styles
 */
import { PARENT_ORG_NAME } from "@/lib/seoConfig";

export default function Footer() {
  return (
    <footer
      className="relative w-full py-8 text-center text-sm backdrop-blur-xl
                 border-t border-border
                 bg-card
                 
                 text-muted
                 
                 shadow-[0_-1px_8px_rgba(155,92,248,0.08)]
                 dark:shadow-[0_-1px_12px_rgba(155,92,248,0.18)]
                 transition-all duration-700 ease-out"
    >
      <div className="relative z-10 px-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between sm:text-left text-center">
        <div className="text-[0.95rem]">
          Built by{" "}
          <a
            href="https://aesthetichomes.net"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--accent-primary)] hover:underline"
          >
            {PARENT_ORG_NAME}
          </a>{" "}
          – Chennai interiors brand with 4.9★ rating, now powered by HomeFix.
        </div>
      </div>

      {/* 🌈 Subtle Glow Bar (bottom aura) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[2px] rounded-full bg-gradient-to-r from-[var(--accent-primary)]/40 via-[var(--accent-secondary)]/40 to-[var(--accent-primary)]/40 blur-[2px] opacity-80" />
    </footer>
  );
}
