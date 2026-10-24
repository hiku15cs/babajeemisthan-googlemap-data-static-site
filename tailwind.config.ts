import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        heritage: {
          dark: "#240f06",
          russet: "#4a1e0d",
          terracotta: "#9c3d18",
          saffron: "#e06516",
        },
      },
      fontFamily: {
        royal: ["Cinzel", "serif"],
        hindi: ["Rozha One", "serif"],
        sans: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
