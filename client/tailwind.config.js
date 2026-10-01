/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#FEEBF5',
          100: '#FBCDE5',
          500: '#E91E8C',
          600: '#CF157C',
          700: '#B0106A'
        },
        blue: {
          50: '#EDEEFD',
          100: '#D5D7FB',
          500: '#4349EC',
          600: '#1E22E6',
          700: '#1A1DC4',
          800: '#14179E'
        },
        green: {
          50: '#E9F8EC',
          600: '#17A32A',
          700: '#117A20'
        },
        amber: {
          50: '#FEF4E3',
          600: '#F79009',
          700: '#B54708'
        },
        red: {
          50: '#FDECEA',
          600: '#D92D20',
          700: '#B42318'
        },
        ink: {
          50: '#F8F8FD',
          100: '#F0F0F8',
          200: '#E6E6F0',
          400: '#8C8CA6',
          600: '#5B5B75',
          900: '#1B1B30'
        }
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        ctl: '10px',
        chip: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,23,158,.04), 0 4px 16px rgba(30,34,230,.07)',
        cardHover: '0 2px 4px rgba(20,23,158,.06), 0 8px 24px rgba(30,34,230,.14)',
        pop: '0 12px 32px rgba(20,23,158,.18)',
      },
      backgroundImage: {
        brand: 'linear-gradient(90deg, #E91E8C, #1E22E6)',
        brand135: 'linear-gradient(135deg, #E91E8C, #1E22E6)',
      }
    },
  },
  plugins: [],
}
