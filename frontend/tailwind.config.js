/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#F59E0B',
        'primary-light': '#FBBF24',
        secondary: '#3B82F6',
        accent: '#10B981',
        danger: '#EF4444',
        bg: '#0F172A',
        surface: '#1E293B',
        'surface-light': '#334155',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
