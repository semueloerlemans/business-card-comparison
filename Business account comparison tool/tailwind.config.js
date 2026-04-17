/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tabby brand greens — mapped to a 50–900 scale so existing utility
        // class patterns keep working.
        tabby: {
          50: '#F7FFFA',  // Green Tint 1
          100: '#E3FFEA', // Green Tint 2
          200: '#C7FFD6', // Green Tint 3
          300: '#6CFF93', // Green Tint 4 (brand hero)
          400: '#4FD472', // interpolated between Tint 4 and Tint 5
          500: '#32A952', // Green Tint 5 — primary accent on white
          600: '#27733B', // Green Tint 6 — hover / darker
          700: '#1B592B', // Green Tint 7
          800: '#154020', // Green Tint 8
          900: '#0E2E16', // Green Tint 9
        },
      },
    },
  },
  plugins: [],
}
