/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-orange': '#F97316',
        'primary-orange-light': '#FB923C',
        'primary-yellow': '#FACC15',
        'primary-yellow-light': '#FDE047',
        'light-background': '#FFFDF7',
        'card-background': '#FFFBF5',
        'text-primary': '#1A1A1A',
        'text-secondary': '#4A4A4A',
        'subtle-accent': '#FEF3C7',
        'subtle-accent-light': '#FFFBEB',
      },
      fontFamily: {
        'plus-jakarta': ['Plus Jakarta Sans', 'Verdana', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
