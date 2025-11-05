/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gemini: {
          50:  "#FAF9FF",
          100: "#F3F0FF",
          900: "#0D0B2B",
          950: "#1B1545",
          glow: "rgba(155,92,248,0.5)",
        },
        accent: {
          DEFAULT: "#5A5DF0",
          mid: "#9B5CF8",
          end: "#EC6ECF",
        },
      },
      backgroundImage: {
        gemini: "linear-gradient(90deg, #5A5DF0 0%, #9B5CF8 50%, #EC6ECF 100%)",
      },
      boxShadow: {
        gemini: "0 0 10px rgba(155,92,248,0.4)",
      },
      keyframes: {
        "gradient-flow": {
          "0%":   { backgroundPosition: "0% 50%" },
          "50%":  { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "gradient-flow": "gradient-flow 7s ease infinite",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtils = {
        ".text-gemini": {
          background:
            "linear-gradient(90deg,#5A5DF0,#9B5CF8,#EC6ECF)",
          WebkitBackgroundClip: "text",
          color: "transparent",
        },
        ".bg-gemini": {
          background:
            "linear-gradient(90deg,#5A5DF0,#9B5CF8,#EC6ECF)",
          backgroundSize: "200% 200%",
          animation: "gradient-flow 8s ease infinite",
        },
        ".shadow-gemini": {
          boxShadow: "0 0 12px rgba(155,92,248,0.5)",
        },
      };
      addUtilities(newUtils, ["responsive", "hover"]);
    },
  ],
};
