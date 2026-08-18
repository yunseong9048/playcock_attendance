import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211b",
        court: { 50: "#f1f8f3", 100: "#dceee1", 500: "#2f7d4a", 600: "#27683e", 700: "#205433" },
        lime: "#d9f99d"
      },
      boxShadow: { card: "0 12px 32px rgba(24, 54, 35, 0.08)" }
    }
  },
  plugins: []
};

export default config;
