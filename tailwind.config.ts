import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#F1F3F6",       // light neutral page background
        surface: "#FFFFFF",    // card / panel surface
        surface2: "#F7F8FA",   // input fields / secondary surface
        line: "#E2E5EB",       // hairline borders
        amber: "#F5A623",      // brand accent — CTAs, price
        circuit: "#4F46E5",    // secondary accent — links, highlights
        ink: "#1F2937",        // primary text
        muted: "#6B7280",      // secondary text
        danger: "#DC2626",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
