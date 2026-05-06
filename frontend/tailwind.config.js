/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   '#1a1a2e',
          secondary: '#16213e',
          card:      '#1e1e3a',
          elevated:  '#252548',
        },
        primary: {
          DEFAULT: '#534AB7',
          light:   '#6B63CC',
          dark:    '#3D3594',
          subtle:  '#534AB71A',
        },
        accent: {
          gold:         '#EF9F27',
          'gold-light': '#FFB84D',
          purple:       '#534AB7',
          'purple-light':'#6B63CC',
        },
        border: {
          DEFAULT: '#2e2e5a',
          light:   '#3e3e7a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in':  'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' },                                '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' },      '100%': { opacity: '1', transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
};
