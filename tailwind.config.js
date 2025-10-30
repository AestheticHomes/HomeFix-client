/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],

  safelist: [
    // ✅ dynamic utilities for color-based tabs, badges, etc.
    { pattern: /text-(gray|green|amber|blue|red|purple)-(400|500|600|700)/ },
    { pattern: /bg-(gray|green|amber|blue|red|purple)-(100|500)/ },
    { pattern: /dark:bg-(gray|green|amber|blue|red|purple)-(400|900)/ },
    { pattern: /dark:text-(gray|green|amber|blue|red|purple)-(300|400)/ },
  ],

  theme: {
    extend: {
      zIndex: {
        content: 30,
        sidebar: 40,
        navbar: 60,
        overlay: 70,
        toast: 80,
      },
      colors: {
        brand: {
          DEFAULT: "#16a34a",
          light: "#22c55e",
          dark: "#14532d",
        },
      },
    },
  },

  plugins: [],
};
