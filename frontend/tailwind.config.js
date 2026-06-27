/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Backgrounds
        background: {
          light: '#F8FAFC',
          dark: '#0B0F19'
        },
        surface: {
          light: '#FFFFFF',
          dark: '#151B2B'
        },
        'surface-raised': {
          light: '#F1F5F9',
          dark: '#1E293B'
        },
        // Text
        'text-primary': {
          light: '#0F172A',
          dark: '#F8FAFC'
        },
        'text-secondary': {
          light: '#475569',
          dark: '#94A3B8'
        },
        'text-muted': {
          light: '#94A3B8',
          dark: '#64748B'
        },
        // Accent
        accent: '#6366F1', // Indigo-500
        'accent-hover': '#4F46E5', // Indigo-600
        // Semantic
        error: '#EF4444',
        success: '#10B981',
        // Borders
        border: {
          light: '#E2E8F0',
          dark: '#334155'
        }
      },
      // We'll also extend the boxShadow and borderRadius if needed, but keep existing
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.10)',
        modal: '0 8px 40px rgba(0,0,0,0.14)'
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px'
      }
    }
  },
  plugins: [],
}
