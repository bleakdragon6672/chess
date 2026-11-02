import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#080b10",
        panel: "#10151d",
        panel2: "#151c26",
        line: "#28323e",
        mint: "#b6f36b",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(182,243,107,.10), 0 18px 60px rgba(0,0,0,.24)",
      },
      keyframes: {
        badgeFloat: {
          "0%": { transform: "translateY(0) scale(.86)", opacity: "0" },
          "16%": { transform: "translateY(-3px) scale(1)", opacity: "1" },
          "75%": { transform: "translateY(-22px) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(-34px) scale(.94)", opacity: "0" },
        },
        checkPulse: {
          "0%, 100%": { boxShadow: "inset 0 0 0 0 rgba(238, 75, 75, .2)" },
          "50%": { boxShadow: "inset 0 0 24px 7px rgba(238, 75, 75, .72)" },
        },
        rise: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        captureFade: {
          "0%": { transform: "translate(-50%, -50%) scale(1)", opacity: "1" },
          "100%": { transform: "translate(-50%, -50%) scale(.55)", opacity: "0" },
        },
      },
      animation: {
        badgeFloat: "badgeFloat 1.15s cubic-bezier(.2,.8,.2,1) forwards",
        checkPulse: "checkPulse 1.1s ease-in-out infinite",
        rise: "rise .42s ease-out both",
        captureFade: "captureFade .18s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
