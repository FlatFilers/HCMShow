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
        "primary-dark": "#005cbf",
        "project-onboarding": "#17B9A7",
        "project-onboarding-highlight": "#6673ff",
        "embedded-portal": "#EFBC73",
        "embedded-portal-highlight": "#4dca94",
        "file-feed": "#CD2659",
        "file-feed-highlight": "#3A7CB9",
        "dynamic-portal": "#d64b32",
        "dynamic-portal-highlight": "#e28170",
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
