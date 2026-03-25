/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green:   '#1DB954',
          black:   '#121212',
          dark:    '#181818',
          card:    '#282828',
          hover:   '#2A2A2A',
          light:   '#B3B3B3',
          white:   '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Circular', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}