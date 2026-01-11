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
        // WALL-E comprehensive color system
        walle: {
          // Primary WALL-E colors (muted and darker)
          yellow: {
            50: '#fefce8',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#f59e0b',  // Main WALL-E yellow (darker)
            500: '#d97706',  // Primary yellow
            600: '#b45309',
            700: '#92400e',
            800: '#78350f',
            900: '#451a03',
          },
          orange: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316',  // WALL-E orange
            600: '#ea580c',
            700: '#c2410c',
            800: '#9a3412',
            900: '#7c2d12',
          },
          brown: {
            50: '#fdf8f6',
            100: '#f2e8e5',
            200: '#eaddd7',
            300: '#e0cfc5',
            400: '#d2bab0',
            500: '#bfa094',
            600: '#a08072',
            700: '#8d5524',  // WALL-E rusty brown
            800: '#723f1a',
            900: '#5c2e14',
          },
          // EVE and nature colors (muted)
          blue: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#2563eb',  // EVE blue (darker)
            600: '#1d4ed8',
            700: '#1e40af',
            800: '#1e3a8a',
            900: '#1e293b',
          },
          green: {
            50: '#ecfdf5',
            100: '#d1fae5',
            200: '#a7f3d0',
            300: '#6ee7b7',
            400: '#34d399',
            500: '#059669',  // Plant green (darker)
            600: '#047857',
            700: '#065f46',
            800: '#064e3b',
            900: '#022c22',
          },
          // Enhanced grays for better dark theme
          gray: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            750: '#2a3441',  // Custom medium-dark
            800: '#1e293b',
            850: '#172033',  // Custom darker
            900: '#0f172a',
            950: '#020617',  // Ultra dark
          },
          // Semantic colors for UI states
          success: '#059669',
          warning: '#d97706', 
          error: '#dc2626',
          info: '#2563eb',
        },
        // Keep brand colors for backward compatibility but make them WALL-E themed
        brand: {
          50: '#fefce8',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#f59e0b',
          500: '#d97706',  // WALL-E yellow as brand primary
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
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
