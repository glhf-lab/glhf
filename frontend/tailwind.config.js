const { colors, fontFamily } = require(`tailwindcss/defaultTheme`)
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  darkMode: "selector", // or "media" or "class"
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
      },
      colors: {
        current: "currentColor",
        highlight: "#facc15",
        primary: {
          100: "#E6F6FE",
          200: "#C0EAFC",
          300: "#9ADDFB",
          400: "#4FC3F7",
          500: "#03A9F4",
          600: "#0398DC",
          700: "#026592",
          800: "#014C6E",
          900: "#013349",
        },
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          md: "2rem",
        },
      },
      animation: {
        text: "text 5s ease infinite",
        sessionred: "sessionred 20s ease-in-out infinite",
        sessionpink: "sessionpink 20s ease-in-out infinite",
        sessiongreen: "sessiongreen 20s ease-in-out infinite",
      },
      keyframes: {
        text: {
          "0%": {
            "background-size": "200% 200%",
            "background-position": "0% 50%",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "100% 50%",
          },
          "100%": {
            "background-size": "300% 300%",
            "background-position": "0% 50%",
          },
        },
        sessionred: {
          "0%, 75%, 100%": {
            "stroke-width": "20px",
            stroke: "var(--tw-color-current)",
            filter: "blur(0)",
          },
          "50%": {
            "stroke-width": "26px",
            filter: "blur(54px)",
            stroke: "#1d4ed8",
          },
        },
        sessionpink: {
          "0%, 75%, 100%": {
            "stroke-width": "20px",
            stroke: "var(--tw-color-current)",
            filter: "blur(0)",
          },
          "50%": {
            "stroke-width": "26px",
            filter: "blur(54px)",
            stroke: "#c026d3",
          },
        },
        sessiongreen: {
          "0%, 75%, 100%": {
            "stroke-width": "20px",
            stroke: "var(--tw-color-current)",
            filter: "blur(0)",
          },
          "50%": {
            "stroke-width": "26px",
            filter: "blur(54px)",
            stroke: "#0d9488",
          },
        },
      },
      gridTemplateColumns: {
        "fit-accounts": "repeat(auto-fit, 24rem)",
      },
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
  },
  plugins: [require("@tailwindcss/typography")],
}
