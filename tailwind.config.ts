import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        muted: "var(--muted)",
        border: "var(--border)",
        // Charcoal neutral backbone
        ink: {
          50: "var(--ink-50)",
          100: "var(--ink-100)",
          200: "var(--ink-200)",
          300: "var(--ink-300)",
          400: "var(--ink-400)",
          500: "var(--ink-500)",
          600: "var(--ink-600)",
          700: "var(--ink-700)",
          800: "var(--ink-800)",
          900: "var(--ink-900)",
          950: "var(--ink-950)",
        },
        // Volt — the single athletic accent. Use sparingly.
        accent: {
          DEFAULT: "var(--accent)",
          strong: "var(--accent-strong)",
          soft: "var(--accent-soft)",
        },
        // DEPRECATED alias: legacy pages still use emerald-*. Mapped onto the
        // ink scale so they repaint into the new neutral system without
        // turning Tailwind-green. Migrate usages to ink-*/accent, then delete.
        emerald: {
          50: "var(--ink-50)",
          100: "var(--ink-100)",
          200: "var(--ink-200)",
          300: "var(--ink-300)",
          400: "var(--ink-400)",
          500: "var(--ink-500)",
          600: "var(--ink-800)",
          700: "var(--ink-900)",
          800: "var(--ink-950)",
          900: "var(--ink-950)",
        },
      },
      fontSize: {
        // Modular display scale — use at intentional focal points only
        display: ["clamp(2.75rem, 7vw, 6rem)", { lineHeight: "0.95", letterSpacing: "-0.03em", fontWeight: "900" }],
        headline: ["clamp(2rem, 4vw, 3.25rem)", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "800" }],
        title: ["1.375rem", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "700" }],
      },
      borderRadius: {
        // Control = inputs/buttons, card = panels. One scale, no ad-hoc radii.
        control: "6px",
        card: "10px",
      },
      boxShadow: {
        // One shadow system: card at rest, lift on hover.
        card: "0 1px 2px rgba(10, 11, 13, 0.06), 0 4px 12px rgba(10, 11, 13, 0.06)",
        lift: "0 2px 4px rgba(10, 11, 13, 0.08), 0 12px 28px rgba(10, 11, 13, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
