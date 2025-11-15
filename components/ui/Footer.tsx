"use client";

/**
 * Footer v4.0 — HomeFix Gemini Glass Continuum 🌌
 * ------------------------------------------------------------
 * ✅ Theme-responsive (light/dark surfaces)
 * ✅ Subtle glass blur & gradient tint
 * ✅ Smooth color transitions
 * ✅ Matches UniversalHeader & Sidebar styles
 */

export default function Footer() {
  return (
    <footer
      className="relative w-full py-8 text-center text-sm backdrop-blur-xl
                 border-t border-gray-200/30 dark:border-slate-700/50
                 bg-[color-mix(in srgb, var(--surface-light) 85%, #f5f0ff 15%)]
                 dark:bg-[color-mix(in srgb, var(--surface-dark) 85%, #1a1845 15%)]
                 text-[color-mix(in srgb, var(--text-primary-light) 90%, #2a2a66 10%)]
                 dark:text-[color-mix(in srgb, var(--text-primary-dark) 90%, #e0d6ff 10%)]
                 shadow-[0_-1px_8px_rgba(155,92,248,0.08)]
                 dark:shadow-[0_-1px_12px_rgba(155,92,248,0.18)]
                 transition-all duration-700 ease-out"
    >
      <div className="relative z-10 px-4">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-transparent bg-clip-text edith-logo-gradient">
          HomeFix India
        </span>{" "}
        · Built with ❤️ in Chennai
      </div>

      {/* 🌈 Subtle Glow Bar (bottom aura) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[2px] rounded-full bg-gradient-to-r from-[var(--accent-primary)]/40 via-[var(--accent-secondary)]/40 to-[var(--accent-primary)]/40 blur-[2px] opacity-80" />
    </footer>
  );
}
