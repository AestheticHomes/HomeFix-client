// app/layout.tsx
/**
 * =====================================================================
 * 🌗 Root Layout — SafeViewport Host (v10.2)
 * ---------------------------------------------------------------------
 * PURPOSE
 *   - Own the global app shell (ThemeProvider + RootShell)
 *   - Provide PWA meta/icons and viewport settings
 *   - Keep a11y route announcements via a local SR-only announcer
 *
 * NOTES
 *   - Removed invalid <next-route-announcer /> usage.
 *   - Next.js App Router already injects an announcer, but we add our
 *     own SR-only component for consistency with our design system.
 * =====================================================================
 */

import RouteAnnouncer from "@/components/a11y/RouteAnnouncer";
import { RootShell } from "@/components/layout";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeFix India",
  description:
    "Smart home services & interior design platform by Aesthetic Homes.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-512x512.png",
  },
  applicationName: "HomeFix India",
  appleWebApp: {
    capable: true,
    title: "HomeFix India",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#5A5DF0" },
    { media: "(prefers-color-scheme: dark)", color: "#EC6ECF" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        {/* PWA essentials */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon-192x192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icons/icon-512x512.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="HomeFix India" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>

      <body
        suppressHydrationWarning
        className="
          antialiased app-shell
          bg-[var(--surface-base)] text-[var(--text-primary)]
          selection:bg-[var(--selection-bg)] selection:text-[var(--selection-text)]
          dark:text-[var(--text-primary-dark)]
          dark:selection:bg-[var(--selection-bg)] dark:selection:text-[var(--selection-text)]
          transition-colors duration-500
        "
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* RootShell owns header/sidebar/nav/scroll/toasts */}
          <RootShell>{children}</RootShell>
        </ThemeProvider>

        {/* SR-only, polite live region for route changes */}
        <RouteAnnouncer />
      </body>
    </html>
  );
}
