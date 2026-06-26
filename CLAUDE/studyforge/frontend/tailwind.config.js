/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: {
          primary: '#F97316',
          light: '#FB923C',
          hover: '#EA6C0A',
        },
        yellow: {
          primary: '#FACC15',
          light: '#FDE047',
          accent: '#FEF3C7',
          subtle: '#FFFBEB',
        },
        bg: {
          warm: '#FFFDF7',
          card: '#FFFBF5',
        },
        text: {
          primary: '#1A1A1A',
          secondary: '#4A4A4A',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Verdana', 'Arial', 'sans-serif'],
      },
      fontSize: {
        base: '1rem',
        h4: '1.25rem',
        h3: '1.5rem',
        h2: '1.75rem',
        h1: '2rem',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.10)',
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
      },
    },
  },
  plugins: [],
}
