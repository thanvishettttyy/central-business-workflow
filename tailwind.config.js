/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#36abf7',
          500: '#0c8ee9',
          600: '#006fc7',
          700: '#0158a2',
          800: '#064b85',
          900: '#0b3f6f',
          950: '#07284a',
        },
        slate: {
          850: '#172033',
        }
      },
    },
  },
  plugins: [],
}
