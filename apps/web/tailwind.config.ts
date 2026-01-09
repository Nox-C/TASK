import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        walle: {
          // WALL-E inspired color palette
          yellow: '#fbbf24', // WALL-E's main yellow
          orange: '#f97316', // WALL-E's orange accents
          brown: '#92400e', // WALL-E's rusty brown
          blue: '#3b82f6', // EVE's blue
          green: '#10b981', // Plant/nature green
          gray: {
            850: '#1e293b', // Custom dark gray
            750: '#334155', // Custom medium gray
          }
        },
      },
      boxShadow: {
        'elevated': '0 10px 25px -10px rgba(0,0,0,0.45)',
      },
      borderRadius: {
        xl: '1rem',
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
        walleGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(251, 191, 36, 0.6)',
            transform: 'scale(1.02)'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        pulseSoft: 'pulseSoft 2s ease-in-out infinite',
        walleGlow: 'walleGlow 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
