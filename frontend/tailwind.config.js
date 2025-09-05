// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enables dark mode via class
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        background: "#0f172a",   // slate-900
        surface: "#1e293b",      // slate-800
        accent: "#14b8a6",       // teal-500
        border: "#334155",       // slate-700
        text: "#f1f5f9",         // gray-100
      },
    },
  },
  plugins: [],
};
