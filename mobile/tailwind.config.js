/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ios: {
          bg: "var(--color-bg)",
          bgSecondary: "var(--color-bg-secondary)",
          bgTertiary: "var(--color-bg-tertiary)",
          border: "var(--color-border)",
          blue: "#0a84ff",
          green: "#30d158",
          purple: "#bf5af2",
          orange: "#ff9f0a",
          red: "#ff453a",
          yellow: "#ffd60a",
        },
      },
    },
  },
  plugins: [],
};
