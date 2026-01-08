import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#070b12",
          raised: "#0f1623",
          overlay: "#151d2e",
          border: "#243044",
        },
        brand: {
          200: "#a5b4fc",
          300: "#818cf8",
          400: "#6366f1",
          500: "#4f46e5",
          600: "#4338ca",
        },
        accent: {
          DEFAULT: "#6366f1",
          muted: "#4f46e5",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 4px 24px -4px rgba(0,0,0,0.45)",
        "card-hover": "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 12px 40px -8px rgba(79,70,229,0.15)",
        glow: "0 0 24px -4px rgba(99,102,241,0.45)",
      },
      backgroundImage: {
        "mesh-auth":
          "radial-gradient(ellipse 80% 60% at 20% 20%, rgba(99,102,241,0.35), transparent), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(56,189,248,0.2), transparent)",
        "mesh-app":
          "radial-gradient(ellipse 100% 80% at 0% 0%, rgba(79,70,229,0.12), transparent 50%), radial-gradient(ellipse 80% 60% at 100% 0%, rgba(14,165,233,0.08), transparent 45%)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.45s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
