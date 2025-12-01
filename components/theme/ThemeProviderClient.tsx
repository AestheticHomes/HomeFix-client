"use client";

import { ThemeProvider, type ThemeProviderProps } from "next-themes";

export default function ThemeProviderClient(props: ThemeProviderProps) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="warm"
      enableSystem={false}
      themes={["warm", "dark"]}
      disableTransitionOnChange
      {...props}
    />
  );
}
