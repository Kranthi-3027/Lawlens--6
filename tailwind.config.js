/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0f172a',
        'brand-dark-secondary': '#1e293b',
        'brand-light': '#f8fafc',
        'brand-light-secondary': '#f1f5f9',
        'brand-accent': '#3b82f6',
      },
    },
  },
  plugins: [],
}