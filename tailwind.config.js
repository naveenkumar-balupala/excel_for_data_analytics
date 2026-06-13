/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#ea580c', // orange-600 (matches Skill Sprint theme)
          dark: '#c2410c',
          light: '#fb923c',
        },
      },
    },
  },
  plugins: [],
}
