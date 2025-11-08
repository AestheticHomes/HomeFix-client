import "./globals.css";
import type { Metadata, Viewport } from "next";
import RootShell from "@/components/RootShell";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";

/* ------------------------------------------------------------ */
/* 🧭 Metadata + Viewport                                       */
/* ------------------------------------------------------------ */
export const metadata: Metadata = {
  title: "HomeFix India",
  description: "Smart home services & interior platform by Aesthetic Homes",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-512x512.png",
  },
  appleWebApp: {
    capable: true,
    title: "HomeFix India",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#5A5DF0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

/* ------------------------------------------------------------ */
/* 🌿 Root Layout (Server Component)                            */
/* ------------------------------------------------------------ */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="relative min-h-screen antialiased overflow-x-hidden
          bg-gradient-to-br from-[#F8F7FF] via-[#F2F0FF] to-[#EAE8FF]
          dark:from-[#0D0B2B] dark:via-[#1B1545] dark:to-[#201A55]
          text-[#2A2A66] dark:text-[#E0D6FF]
          selection:bg-[#9B5CF8]/20 selection:text-[#5A5DF0]
          transition-colors duration-500"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <RootShell>{children}</RootShell>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
