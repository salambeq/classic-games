/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        retro: {
          nokiagreen: '#8da87c',
          nokiadark: '#1f2d19',
          nokiaglow: '#9bbc82',
          siemensamber: '#fca311',
          siemensdark: '#301800',
          lcdblue: '#79a8d9',
          lcddark: '#0e243a',
          shell3310: '#23395d',
          shell1100: '#3a4454',
          shellsiemens: '#8b939c',
          shellse: '#1e2022'
        }
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace', 'Courier New'],
        nokia: ['"VT323"', 'monospace']
      },
      boxShadow: {
        'nokia-bevel': 'inset 2px 2px 0px rgba(255,255,255,0.4), inset -2px -2px 0px rgba(0,0,0,0.5)',
        'button-press': 'inset -2px -2px 0px rgba(255,255,255,0.3), inset 2px 2px 0px rgba(0,0,0,0.6)',
        'lcd-inner': 'inset 3px 3px 6px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(255,255,255,0.2)'
      }
    },
  },
  plugins: [],
}
