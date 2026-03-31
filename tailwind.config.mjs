import { plugin as flowbitePlugin, content as flowbiteContent } from "flowbite-react/tailwind";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    flowbiteContent(),
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        prime: "#0369A1",
        "second-prime": "#EFF6FF",
        "white-prime": "#FFFFFF",
        "dark-prime": "#000000",
        "dark-second-prime": "#374151",
        "dark-white-prime": "#4b5563",
        gray9: "#111827",
        gray8: "#1f2937",
        gray6: "#4b5563",
        gray2: "#e5e7eb",
        slate6: "#475569",
      },
      screens: {
        "no-scrollbar": { raw: "(overflow: hidden)" },
      },
    },
  },
  plugins: [flowbitePlugin()],
};