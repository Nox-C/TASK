/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // WALL-E Theme Colors
        walle: {
          yellow: '#FFBF00',      // Primary Accent - Buttons, Active State, Positive Metrics
          darkblue: '#0D1B2A',    // Deep background
          lightblue: '#4A90E2',   // Secondary blue
          surface: '#3C3F41',     // Card/Panel BG - Sidebar, Panels, Bot Config
          orange: '#FF6B35',      // Warning/secondary accent
        },
        // EVE Theme Colors
        eve: {
          white: '#FFFFFF',       // UI Foreground - Clean data/text areas
          blue: '#2196F3',        // EVE's sleek blue accent
          light: '#E3F2FD',       // EVE's light blue background
        },
        // Buy n Large Corporate Colors
        bnl: {
          red: '#EF5350',         // Secondary Accent - Alerts, Negative P&L, Sell Grids, BnL Logo Red
          dark: '#1C1C1C',        // Main dashboard background (deep black)
        },
        // Success/Status Colors
        success: '#5DBC80',        // EVE: Plant found, Success/Profit indicators (Green)
        alert: '#EF5350',         // BnL Red for alerts
        warning: '#FFBF00',       // WALL-E Yellow for warnings
      },
      animation: {
        'blink-slow': 'blink 3s infinite',
        'pulse-slow': 'pulse 2s infinite',
        'rotate-slow': 'rotate 2s linear infinite',
        'eve-glow': 'eveGlow 1.5s ease-in-out infinite alternate',
        'eve-alarm': 'eve-red-pulse 1.2s infinite ease-in-out',
        'status-transition': 'statusTransition 0.3s ease-in-out',
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '25%, 75%': { opacity: '0.3' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        eveGlow: {
          '0%': { boxShadow: '0 0 5px rgba(33, 150, 243, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(33, 150, 243, 0.8)' },
        },
        'eve-red-pulse': {
          '0%, 100%': { backgroundColor: '#ef4444', boxShadow: '0 0 10px 2px rgba(239, 68, 68, 0.7)' },
          '50%': { backgroundColor: '#7f1d1d', boxShadow: '0 0 25px 8px rgba(239, 68, 68, 0.9)' },
        },
        statusTransition: {
          '0%': { filter: 'hue-rotate(0deg)' },
          '100%': { filter: 'hue-rotate(120deg)' },
        },
      },
    },
  },
  plugins: [],
}
