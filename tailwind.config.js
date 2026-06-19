/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        income: '#16a34a',
        expense: '#ef4444',
      },
    },
  },
  plugins: [],
}
