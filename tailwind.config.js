/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'hero': "url('../public/assets/abstract-3840x2160-colorful-4k-24048.jpg')",
      },
      transitionProperty: {
        'size': 'height, width',
      }
    },
  },
  plugins: [],
}

