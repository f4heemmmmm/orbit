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
        primary: '#007AFF',
        success: '#27AE60',
        danger: '#E74C3C',
        warning: '#F39C12',
        purple: '#9B59B6',
        teal: '#4ECDC4',
        background: '#F5F6FA',
      },
    },
  },
  plugins: [],
};

