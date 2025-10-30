import "./globals.css";
import type { Metadata } from "next";
import ClientRoot from "@/components/ClientRoot";
import SessionSync from "@/components/SessionSync";
import PWAPrompt from "@/components/PWAPrompt";

export const metadata: Metadata = {
  title: "HomeFix India",
  description: "Smart home services & interior platform",
  manifest: "/manifest.json",
  themeColor: "#16a34a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-slate-100 min-h-[100dvh]">
        <SessionSync />
        <ClientRoot>{children}</ClientRoot>
        <PWAPrompt />
      </body>
    </html>
  );
}
