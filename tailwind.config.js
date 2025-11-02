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
        // Premium Dark Mode - Deep Navy Blue Theme
        'brand-dark': '#0a0e27',           // Deep navy background
        'brand-dark-secondary': '#1a1f3a', // Slightly lighter navy
        'brand-dark-hover': '#252b4a',     // Hover state
        
        // Light Mode - Clean Professional
        'brand-light': '#fafbfc',          // Almost white
        'brand-light-secondary': '#f5f7fa', // Subtle gray
        
        // Accent Colors - Legal Blue & Gold
        'brand-accent': '#2563eb',         // Professional blue
        'brand-accent-hover': '#1d4ed8',   // Darker blue on hover
        'brand-gold': '#f59e0b',           // Premium gold accent
        'brand-gold-hover': '#d97706',     // Darker gold
        
        // Status Colors
        'brand-success': '#10b981',        // Green
        'brand-warning': '#f59e0b',        // Amber
        'brand-error': '#ef4444',          // Red
      },
      boxShadow: {
        'premium': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'premium-lg': '0 10px 40px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'gradient': 'gradient 3s ease infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}