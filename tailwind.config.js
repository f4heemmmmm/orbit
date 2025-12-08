/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Dark mode backgrounds
        dark: {
          bg: '#0f0f1a',
          card: '#1a1a2e',
          surface: '#252540',
        },
        // Pastel accent colors
        pastel: {
          blue: '#a0c4ff',
          green: '#7dd3a8',
          red: '#f5a0a0',
          orange: '#ffd6a5',
          yellow: '#fdffb6',
          purple: '#bdb2ff',
          pink: '#ffc6ff',
          teal: '#9bf6e3',
          coral: '#ffadad',
        },
        // Text colors for dark mode
        light: {
          primary: '#e8e8e8',
          secondary: '#a0a0b0',
          muted: '#6b6b80',
        },
      },
    },
  },
  plugins: [],
};

