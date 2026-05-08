/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#06060A',
        card: '#0E0E16',
        card2: '#13131E',
        border: '#1E1E2E',
        pink: '#FF2D78',
        purple: '#9747FF',
        green: '#00E5A0',
        yellow: '#FFD600',
        text: '#F0F0F8',
        muted: '#6B6B8A',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      keyframes: {
        pulse2: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,45,120,0.4)' },
          '50%': { boxShadow: '0 0 0 14px rgba(255,45,120,0)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        pulse2: 'pulse2 1.8s ease-in-out infinite',
        fadeUp: 'fadeUp 0.4s ease forwards',
        shimmer: 'shimmer 1.4s infinite linear',
      },
    },
  },
  plugins: [],
};
