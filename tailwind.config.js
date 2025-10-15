/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        'l1': {
          'primary': '#0f1419',
          'secondary': '#1a2332',
          'accent': '#8b5cf6',
          'background': '#0f1419',
          'surface': '#1a2332',
          'border': '#2d3748',
          'text': {
            'primary': '#ffffff',
            'secondary': '#a0aec0',
            'muted': '#718096',
          },
          'blue': '#6366f1',
          'dark-blue': '#4f46e5'
        }
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
      }
    },
  },
  plugins: [],
};
