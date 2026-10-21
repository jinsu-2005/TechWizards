/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg-rgb) / <alpha-value>)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        border: "rgb(var(--border-rgb) / <alpha-value>)",
        text: "rgb(var(--text-rgb) / <alpha-value>)",
        muted: "rgb(var(--muted-rgb) / <alpha-value>)",
        normal: "rgb(var(--normal-rgb) / <alpha-value>)",
        suspect: "rgb(var(--suspect-rgb) / <alpha-value>)",
        affected: "rgb(var(--affected-rgb) / <alpha-value>)",
        origin: "rgb(var(--origin-rgb) / <alpha-value>)",
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        "on-accent": "rgb(var(--on-accent-rgb) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: { DEFAULT: "8px" },
      spacing: { unit: "8px", "4.5": "18px", "8.5": "34px", "0.2": "1px" },
      boxShadow: { xs: "0 1px 2px rgb(0 0 0 / 0.08)" },
    },
  },
  plugins: [],
};
