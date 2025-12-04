import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#00AEEF",
          dark: "#0086D1",
        },
        secondary: {
          DEFAULT: "#27C49A",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      animation: {
        "water-ripple": "water-ripple 2s ease-out infinite",
        "water-drop": "water-drop 4s ease-in infinite",
        "shine": "shine 3s ease-in-out infinite",
        "bounce": "bounce 1s ease-in-out infinite",
      },
      keyframes: {
        "water-ripple": {
          "0%": { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        "water-drop": {
          "0%": { transform: "translateY(-100vh)", opacity: "0.3" },
          "50%": { opacity: "0.6" },
          "100%": { transform: "translateY(100vh)", opacity: "0" },
        },
        "shine": {
          "0%": { left: "-100%" },
          "100%": { left: "200%" },
        },
        "bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

