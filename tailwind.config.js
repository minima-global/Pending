import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.gray,
      emerald: colors.emerald,
      indigo: colors.indigo,
      yellow: colors.yellow,
      red: colors.red,
      lime: colors.lime,
      slate: colors.slate,
      'core-black-contrast': '#17191c',
    },
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

