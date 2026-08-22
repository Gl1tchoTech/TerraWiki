/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#141a12",
          deep: "#0b0f0a",
        },
        bark: {
          50: "#f6f1e7",
          100: "#e9dfc9",
          200: "#d5c49c",
          300: "#bfa76b",
          400: "#a98d47",
          500: "#8a7036",
          600: "#6b5530",
          700: "#51401f",
          800: "#382d16",
          900: "#251d0e",
        },
        moss: {
          300: "#9bd06a",
          400: "#6fb441",
          500: "#4f9330",
          600: "#3a7226",
          700: "#2b541d",
        },
        gold: {
          300: "#ffe08a",
          400: "#f5c04b",
          500: "#e0a226",
          600: "#b97c14",
        },
        ember: {
          400: "#ff7a52",
          500: "#e8552f",
          600: "#c03a1e",
        },
        sky: {
          400: "#6cc8e8",
          500: "#3fa5cf",
        },
      },
      fontFamily: {
        display: ['"Chakra Petch"', "ui-sans-serif", "system-ui", "sans-serif"],
        body: ['"IBM Plex Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        pixel: "0 2px 0 0 rgba(11,15,10,0.9)",
        "pixel-lg": "0 5px 0 0 rgba(11,15,10,0.85)",
        card: "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 10px 30px -12px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "pixel-grid":
          "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "float-slow": "float-slow 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
