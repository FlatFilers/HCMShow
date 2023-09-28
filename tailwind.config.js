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
        "project-onboarding": "#3b2fc9",
        "project-onboarding-highlight": "#6673ff",
        "embedded-portal": "#32a673",
        "embedded-portal-highlight": "#4dca94",
        "file-feed": "#090b2b",
        "file-feed-highlight": "#616a7d",
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
