import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{vue,js,ts}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0a1a",
          900: "#111128",
          800: "#1a1a3e",
          700: "#252550",
          600: "#323268",
        },
        accent: {
          DEFAULT: "#818cf8",
          soft: "#a5b4fc",
          dim: "#6366f1",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system", "BlinkMacSystemFont",
          "Segoe UI", "PingFang SC", "Microsoft YaHei",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono", "Fira Code", "SF Mono",
          "Cascadia Code", "Menlo", "monospace",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.2)",
        glow: "0 0 40px rgba(129,140,248,0.15)",
        "glow-sm": "0 0 12px rgba(129,140,248,0.1)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out both",
        "pop-in": "pop-in 0.2s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
