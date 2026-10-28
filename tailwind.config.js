/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#2563eb",
          hover: "#1d4ed8",
          dark: "#1e40af",
        },
        card: {
          light: "#ffffff",
          dark: "#1e293b",
        },
        border: {
          light: "#e2e8f0",
          dark: "#334155",
        },
      },
    },
  },
  plugins: [],
};
