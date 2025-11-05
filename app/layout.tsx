import "./globals.css";
import type { Metadata, Viewport } from "next";
import RootShell from "@/components/RootShell";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import UniversalHeader from "@/components/ui/UniversalHeader";
import { Suspense } from "react";

// ✅ Proper Metadata (Next 14 compatible)
export const metadata: Metadata = {
  title: "HomeFix India",
  description: "Smart home services & interior platform",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon.192x192.png.png",
    apple: "/icons/icon.512x512.png.png",
  },
  appleWebApp: {
    capable: true,
    title: "HomeFix India",
    statusBarStyle: "black-translucent",
  },
};

// ✅ Separate Viewport export (fixes build warnings)
export const viewport: Viewport = {
  themeColor: "#5A5DF0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`min-h-screen antialiased overflow-x-hidden
                    bg-gradient-to-br from-[#F8F7FF] via-[#F2F0FF] to-[#EAE8FF]
                    dark:from-[#0D0B2B] dark:via-[#1B1545] dark:to-[#201A55]
                    text-[#2A2A66] dark:text-[#E0D6FF]
                    transition-colors duration-500`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RootShell>
            {/* 🧭 Edith Horizon Header (always visible) */}
            <Suspense>
              <UniversalHeader />
            </Suspense>

            {/* 🏗 Page Content below header */}
            <main className="pt-[72px] safe-screen">{children}</main>
          </RootShell>

          {/* 🔔 Toasts */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
