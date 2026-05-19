/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sy': '#ffd02a',
        'so': '#ff7a18',
        'sr': '#ff2f2f',
        'sbg': '#070707',
        'accent': '#e6382f',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        'hero-rise': {
          from: { opacity: '0', transform: 'translateY(18px) scale(0.98)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'hero-fade': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'headline-glow': {
          to: { backgroundPosition: '220% center' },
        },
        'chip-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-5px)' },
        },
        'scan': {
          to: { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'hero-rise':     'hero-rise 0.8s ease both',
        'hero-fade':     'hero-fade 0.9s ease 0.18s both',
        'headline-glow': 'headline-glow 4s linear infinite',
        'chip-float':    'chip-float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
