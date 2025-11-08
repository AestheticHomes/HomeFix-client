/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      /* ------------------------------------------------------------
         🎨 Gemini Brand + System Palette
      ------------------------------------------------------------ */
      colors: {
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
          950: "#1B1545",
          glow: "rgba(155,92,248,0.5)",
        },

        accent: {
          DEFAULT: "#5A5DF0",
          mid: "#9B5CF8",
          end: "#EC6ECF",
          soft: "#CBA0FF",
        },

        surface: {
          light: "#FFFFFF",
          dark: "#0f0c29",
        },

        neutral: {
          light: "#F7F7FB",
          dark: "#121022",
          borderLight: "#E4E4EC",
          borderDark: "#2A2643",
        },

        success: {
          400: "#34D399",
          600: "#059669",
        },

        warning: {
          400: "#FBBF24",
          600: "#D97706",
        },

        danger: {
          400: "#FB7185",
          600: "#DC2626",
        },
      },

      /* ------------------------------------------------------------
         🌈 Gradients & Backgrounds
      ------------------------------------------------------------ */
      backgroundImage: {
        gemini:
          "linear-gradient(90deg, #5A5DF0 0%, #9B5CF8 50%, #EC6ECF 100%)",
        "gemini-diag":
          "linear-gradient(135deg, #5A5DF0 0%, #9B5CF8 45%, #EC6ECF 100%)",
        "gemini-glass":
          "linear-gradient(135deg, rgba(90,93,240,0.15), rgba(236,110,207,0.12))",
      },

      /* ------------------------------------------------------------
         🌠 Shadows, Blur & Radii
      ------------------------------------------------------------ */
      boxShadow: {
        gemini: "0 0 14px rgba(155,92,248,0.45)",
        glow: "0 0 25px rgba(155,92,248,0.35)",
        soft: "0 2px 12px rgba(0,0,0,0.08)",
      },

      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        xl: "12px",
      },

      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },

      scale: {
        98: "0.98",
      },

      /* ------------------------------------------------------------
         💫 Animations & Keyframes
      ------------------------------------------------------------ */
      keyframes: {
        "gradient-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "float-up": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },

      animation: {
        "gradient-flow": "gradient-flow 8s ease infinite",
        "float-up": "float-up 5s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },

      /* ------------------------------------------------------------
         ⚡ Smooth Theming Transitions
      ------------------------------------------------------------ */
      transitionProperty: {
        theme: "background-color, color, border-color, box-shadow, fill, stroke",
      },
    },
  },

  /* ------------------------------------------------------------
     🧩 Gemini Utility Plugin
  ------------------------------------------------------------ */
  plugins: [
    function ({ addUtilities }) {
      const newUtils = {
        /* ✨ Text Gradient */
        ".text-gemini": {
          background:
            "linear-gradient(90deg,#5A5DF0,#9B5CF8,#EC6ECF)",
          WebkitBackgroundClip: "text",
          color: "transparent",
        },

        /* 🌈 Animated Backgrounds */
        ".bg-gemini": {
          background:
            "linear-gradient(90deg,#5A5DF0,#9B5CF8,#EC6ECF)",
          backgroundSize: "200% 200%",
          animation: "gradient-flow 8s ease infinite",
        },

        ".bg-gemini-diag": {
          background:
            "linear-gradient(135deg,#5A5DF0,#9B5CF8,#EC6ECF)",
          backgroundSize: "200% 200%",
          animation: "gradient-flow 9s ease infinite",
        },

        /* 🌌 Shadows / Glow */
        ".shadow-gemini": {
          boxShadow: "0 0 12px rgba(155,92,248,0.45)",
        },

        ".shadow-gemini-glow": {
          boxShadow:
            "0 0 25px rgba(155,92,248,0.4), 0 0 60px rgba(236,110,207,0.3)",
        },

        /* 🧊 Frosted Glass */
        ".glass-gemini": {
          background:
            "linear-gradient(135deg, rgba(90,93,240,0.15), rgba(236,110,207,0.12))",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.12)",
        },

        /* 🩵 Adaptive text colors for dark/light */
        ".text-base": {
          color: "#1A1A1F",
        },
        ".dark .text-base": {
          color: "#E6E6F0",
        },
      };
      addUtilities(newUtils, ["responsive", "hover", "dark"]);
    },
  ],
};
