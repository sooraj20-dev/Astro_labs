/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chiri: {
          bg: "#F5F5F0",
          black: "#000000",
          white: "#FFFFFF",
          yellow: "#FFE500",
          red: "#FF3030",
          gray: "#E5E5DE",
          muted: "#555555",
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
        sans: ['"Space Grotesk"', 'Inter', 'Arial', 'sans-serif'],
        ml: ['"Noto Sans Malayalam"', '"Manjari"', 'sans-serif'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px #000000',
        'brutal-lg': '6px 6px 0px #000000',
        'brutal-sm': '2px 2px 0px #000000',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },
    },
  },
  plugins: [],
}
