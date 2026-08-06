import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#12151C",       // near-black charcoal-blue workshop background
        surface: "#1B2029",    // card / panel surface
        surface2: "#232937",   // raised surface
        line: "#2B3242",       // hairline borders
        amber: "#F5A623",      // signal amber — hazard tape / tool accent
        circuit: "#3ED9A4",    // circuit-board green — tech / status accent
        ink: "#EDEEF0",        // primary text
        muted: "#8B93A7",      // secondary text
        danger: "#E5533D",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      backgroundImage: {
        "hazard-stripe":
          "repeating-linear-gradient(45deg, #F5A623 0, #F5A623 10px, #12151C 10px, #12151C 20px)",
      },
    },
  },
  plugins: [],
};
export default config;
