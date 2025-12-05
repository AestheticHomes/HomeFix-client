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
import { JsonLd } from "@/components/seo/JsonLd";
import { GlobalBusinessGraph } from "@/components/seo/siteSchemas";
import ThemeProviderClient from "@/components/theme/ThemeProviderClient";
import { CANONICAL_ORIGIN } from "@/lib/seoConfig";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mont = Montserrat({ subsets: ["latin"], variable: "--font-heading", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_ORIGIN),
  title: {
    default: "HomeFix | Full home interiors, 2D/3D planning, and execution",
    template: "%s | HomeFix",
  },
  description:
    "Book HomeFix for end-to-end interiors in Chennai: measurement, 2D/3D planning, curated materials, installation, and site supervision with lower waste and fewer errors.",
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: `${CANONICAL_ORIGIN}/`,
    siteName: "HomeFix",
    title: "HomeFix | Full home interiors, 2D/3D planning, and execution",
    description:
      "Book HomeFix for end-to-end interiors in Chennai: measurement, 2D/3D planning, curated materials, installation, and site supervision with lower waste and fewer errors.",
    images: [
      {
        url: `${CANONICAL_ORIGIN}/images/homefix-screenshot.png`,
        width: 1280,
        height: 720,
        alt: "HomeFix homepage showing interior services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HomeFix | Full home interiors, 2D/3D planning, and execution",
    description:
      "Book HomeFix for end-to-end interiors in Chennai: measurement, 2D/3D planning, curated materials, installation, and site supervision with lower waste and fewer errors.",
    images: [`${CANONICAL_ORIGIN}/images/homefix-screenshot.png`],
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-512.png",
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
    { media: "(prefers-color-scheme: light)", color: "#1E3A8A" },
    { media: "(prefers-color-scheme: dark)", color: "#818CF8" },
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${mont.variable} ${mono.variable}`}
    >
      <head>
        {/* PWA essentials */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon-192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icons/icon-512.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="HomeFix India" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        {/* SEO: Global business graph linking HomeFix to Aesthetic Homes */}
        <JsonLd data={GlobalBusinessGraph} />
      </head>

      <body
        suppressHydrationWarning
        className="
            antialiased app-shell
            bg-[var(--surface-base)] text-[var(--text-primary)]
            selection:bg-[var(--selection-bg)] selection:text-[var(--selection-text)]
            transition-colors duration-500
          "
      >
        <ThemeProviderClient>
          {/* RootShell owns header/sidebar/nav/scroll/toasts */}
          <RootShell>{children}</RootShell>
        </ThemeProviderClient>

        {/* SR-only, polite live region for route changes */}
        <RouteAnnouncer />
      </body>
    </html>
  );
}
