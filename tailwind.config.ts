import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070b12",
        void: "#03050a",
        sand: "#d8b579",
        gold: "#c9a24b",
        dune: "#8a6a3f",
        cyan: {
          glow: "#5ddbe0",
        },
        dusk: "#1a2740",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      letterSpacing: {
        wide2: "0.18em",
      },
    },
  },
  plugins: [],
};

export default config;
