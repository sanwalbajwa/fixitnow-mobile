/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        teal:      '#009689',
        tealDark:  '#007a6e',
        tealSoft:  '#e7f7f5',
        coral:     '#f97c66',
        coralDark: '#e0624e',
        coralSoft: '#fff0ed',
        surface:   '#f7f7f7',
      },
    },
  },
  plugins: [],
}
