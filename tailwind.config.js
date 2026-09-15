/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Human-first, warm healthcare color palette
        paper: {
          50: '#fdfbf7',
          100: '#f6f2ea',
          200: '#ebd9d0',
          300: '#d5bea5',
        },
        clay: {
          50: '#fcf6f3',
          100: '#f7e9e3',
          500: '#c85a32',
          600: '#b04a25',
          700: '#91381c',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e3ece4',
          500: '#4a6b5d',
          600: '#3a5448',
          700: '#2b3f36',
        },
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#d97706',
          600: '#b45309',
        },
        slate: {
          850: '#141e30',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Source Serif 4', 'Merriweather', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
