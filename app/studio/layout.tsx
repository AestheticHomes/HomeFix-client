"use client";
import React, { useEffect, useState } from "react";
import { StudioProvider } from "@/contexts/StudioContext";
import { ThemeProvider } from "next-themes";

/** Client wrapper for Studio section. */
function StudioClientProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => setIsReady(true), []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <StudioProvider>
        <div
          className={`min-h-screen bg-background text-foreground transition-opacity duration-300 ${
            isReady ? "opacity-100" : "opacity-0"
          }`}
        >
          <main className="studio-wrapper safe-screen p-0 m-0 relative overflow-hidden">
            {children}
          </main>
        </div>
      </StudioProvider>
    </ThemeProvider>
  );
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudioClientProvider>{children}</StudioClientProvider>;
}
