/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0875e1",
        darkest: "#1E2535",
        "primary-dark": "#005cbf",
        "project-onboarding": "#17B9A7",
        "embedded-portal": "#EFBC73",
        "file-feed": "#CD2659",
        "dynamic-portal": "#3A7CB9",
      },
    },
    variants: {
      extend: {
        fill: ["group-hover"],
      },
    },
  },
  plugins: [],
};
