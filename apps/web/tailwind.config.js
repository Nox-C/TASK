/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        walle: {
          yellow: '#FFB800',
          darkblue: '#0D1B2A',
          lightblue: '#4A7BA7',
          surface: '#1B2838',
        },
      },
    },
  },
  plugins: [],
}
