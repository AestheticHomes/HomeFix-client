import { RootShell } from "@/components/layout";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

/* ------------------------------------------------------------
   🧭 Metadata + Viewport — Edith SafeViewport v10.1
------------------------------------------------------------ */
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

/* ------------------------------------------------------------
   🌗 Root Layout (Server) — SafeViewport host
   ------------------------------------------------------------
   ✅ RootShell owns header/sidebar/nav/scroll
   ✅ Body safe for PWA + iOS
   ✅ No double padding or hidden overflow
------------------------------------------------------------ */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ✅ PWA Essentials */}
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
        className="antialiased app-shell
                   bg-[var(--surface-base)]
                   text-[var(--text-primary-light)] dark:text-[var(--text-primary-dark)]
                   selection:bg-[var(--edith-selection-bg-light)] selection:text-[var(--edith-selection-text-light)]
                   dark:selection:bg-[var(--edith-selection-bg-dark)] dark:selection:text-[var(--edith-selection-text-dark)]
                   transition-colors duration-500"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* 🧱 RootShell provides SafeViewport + scroll + toasts */}
          <RootShell>{children}</RootShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
