"use client";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: render only after mount
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-full opacity-50"
        aria-label="Toggle Theme"
        disabled
      >
        <Moon size={18} />
      </button>
    );
  }

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <button
      onClick={() =>
        setTheme(currentTheme === "dark" ? "light" : "dark")
      }
      className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
      aria-label="Toggle Theme"
    >
      {currentTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
