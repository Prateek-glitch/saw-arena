/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          green: '#00ff00',
          background: '#1a1a1a'
        },
        player: {
          red: '#ff0000',
          blue: '#0000ff',
          yellow: '#ffff00',
          green: '#00ff00'
        }
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-weapon': 'pulse 1s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}