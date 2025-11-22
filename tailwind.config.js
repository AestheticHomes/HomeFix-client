/**
 * ============================================================
 * 🧩 HomeFix India — Tailwind Config (Edith Continuum v3.3.4)
 * ------------------------------------------------------------
 * ✅ Tailwind v4.1+ / v5 ready
 * ✅ Gemini gradient system + theme tokens
 * ✅ Safe for Next.js 14 / Vercel build
 * ============================================================
 */

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: "class",

  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Poppins", "Inter", "sans-serif"],
      },

      /* ------------------------------------------------------------
         🎨 Gemini Palette + Tokens
      ------------------------------------------------------------ */
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",

        gemini: {
          50: "#FAF9FF",
          100: "#F3F0FF",
          200: "#E4D9FF",
          300: "#C8B6FF",
          400: "#A590FF",
          500: "#8268F7",
          600: "#6B4EEB",
          700: "#4F37C8",
          800: "#2F2496",
          900: "#0D0B2B",
          glow: "rgba(155,92,248,0.5)",
        },

        accent: {
          DEFAULT: "#5A5DF0",
          mid: "#9B5CF8",
          end: "#EC6ECF",
          soft: "#CBA0FF",
        },

        neutral: {
          light: "#F7F7FB",
          dark: "#121022",
          borderLight: "#E4E4EC",
          borderDark: "#2A2643",
        },

        success: { 400: "#34D399", 600: "#059669" },
        warning: { 400: "#FBBF24", 600: "#D97706" },
        danger: { 400: "#FB7185", 600: "#DC2626" },
      },

      backgroundImage: {
        gemini: "linear-gradient(90deg, #5A5DF0 0%, #9B5CF8 50%, #EC6ECF 100%)",
        "gemini-diag":
          "linear-gradient(135deg, #5A5DF0 0%, #9B5CF8 45%, #EC6ECF 100%)",
        "gemini-glass":
          "linear-gradient(135deg, rgba(90,93,240,0.15), rgba(236,110,207,0.12))",
      },

      boxShadow: {
        gemini: "0 0 14px rgba(155,92,248,0.45)",
        glow: "0 0 25px rgba(155,92,248,0.35)",
        soft: "0 2px 12px rgba(0,0,0,0.08)",
      },

      borderRadius: { "2xl": "1.25rem", "3xl": "1.75rem" },

      transitionProperty: {
        theme:
          "background-color, color, border-color, box-shadow, fill, stroke",
      },
    },
  },

  plugins: [
    function ({ addUtilities }) {
      const utils = {
        /* ✨ Gradient Text */
        ".text-gemini": {
          background: "linear-gradient(90deg,#5A5DF0,#9B5CF8,#EC6ECF)",
          WebkitBackgroundClip: "text",
          color: "transparent",
        },
        /* 🌈 Animated Backgrounds */
        ".bg-gemini": {
          background: "linear-gradient(90deg,#5A5DF0,#9B5CF8,#EC6ECF)",
          backgroundSize: "200% 200%",
          animation: "gradient-flow 8s ease infinite",
        },
        ".bg-gemini-diag": {
          background: "linear-gradient(135deg,#5A5DF0,#9B5CF8,#EC6ECF)",
          backgroundSize: "200% 200%",
          animation: "gradient-flow 9s ease infinite",
        },
        /* 🧊 Frosted Glass */
        ".glass-gemini": {
          background:
            "linear-gradient(135deg, rgba(90,93,240,0.15), rgba(236,110,207,0.12))",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.12)",
        },
      };

      addUtilities(utils, ["responsive", "hover", "dark"]);
    },
  ],
};

export default config;
