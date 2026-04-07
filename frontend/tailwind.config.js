/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
      },
      animation: {
        'speak-pulse': 'speak-pulse 1s ease-in-out infinite',
        'listen-border': 'listen-border 1.5s ease-in-out infinite',
      },
      keyframes: {
        'speak-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.06)', opacity: '0.9' },
        },
        'listen-border': {
          '0%, 100%': { boxShadow: '0 0 0 3px #4F46E5' },
          '50%': { boxShadow: '0 0 0 6px #818CF8' },
        },
      },
    },
  },
  plugins: [],
};
