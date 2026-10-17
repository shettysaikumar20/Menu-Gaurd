/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCF7',
          100: '#F7F5EE',
          200: '#EFECE1',
          300: '#E4DFCE',
          400: '#D5CEB8'
        },
        charcoal: {
          900: '#151618',
          800: '#22252A',
          700: '#343840',
          600: '#4B515D',
          500: '#68707E',
          400: '#949DAE',
          100: '#F0F2F5'
        },
        sage: {
          50: '#F2F8F4',
          100: '#E2EFE7',
          200: '#C4DFC9',
          500: '#2F7C51',
          600: '#23613E',
          700: '#1B4C30',
          800: '#153A25',
          900: '#0F2719'
        },
        alert: {
          crimson: '#D9383A',
          amber: '#E08518',
          emerald: '#1C8754',
          indigo: '#4354B3'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif']
      }
    },
  },
  plugins: [],
}
