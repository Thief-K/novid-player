/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0d0f12",
        surface: {
          DEFAULT: "rgba(23, 27, 34, 0.75)",
          light: "rgba(35, 41, 52, 0.8)",
          hover: "rgba(45, 52, 66, 0.85)",
          active: "rgba(55, 65, 81, 0.9)",
        },
        primary: {
          DEFAULT: "#38bdf8",
          hover: "#0ea5e9",
          glow: "rgba(56, 189, 248, 0.35)",
        },
        accent: {
          DEFAULT: "#818cf8",
          hover: "#6366f1",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "'Microsoft YaHei UI'",
          "'MiSans'",
          "'PingFang SC'",
          "sans-serif",
        ],
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
