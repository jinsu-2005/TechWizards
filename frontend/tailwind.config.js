/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        border: "var(--border)",
        text: "var(--text)",
        muted: "var(--muted)",
        normal: "var(--normal)",
        suspect: "var(--suspect)",
        affected: "var(--affected)",
        origin: "var(--origin)",
        accent: "var(--accent)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: { DEFAULT: "8px" },
      spacing: { unit: "8px" },
    },
  },
  plugins: [],
};
