/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF8F5',
        primary:    '#1F293A',
        secondary:  '#E2E4E9',
        accent:     '#A0A4B1',
        lavender:   '#B9A6CE',
        highlight:  '#FDCF41',
        midnight:   '#0D1117',
      },
    },
  },
  plugins: [],
};
