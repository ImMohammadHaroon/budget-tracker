/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0D0D0D',
        surface: '#141414',
        elevated: '#222222',
        border: 'rgba(255,255,255,0.06)',
        'grey-4': '#808080',
        'grey-6': '#404040',
        'grey-8': '#1E1E1E',
        'grey-9': '#141414',
        success: '#4A7A4D',
        warning: '#7A5C2E',
        danger: '#7A3535',
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        clash: ['"Clash Display"', 'DM Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        blob: 'morphBlob 8s ease-in-out infinite',
        flow: 'liquidFlow 4s ease infinite',
        wave: 'wave 3s linear infinite',
        shimmer: 'shimmer 2s infinite',
        ripple: 'ripple 0.8s ease-out forwards',
      },
      keyframes: {
        morphBlob: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '25%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
          '50%': { borderRadius: '50% 60% 30% 60% / 30% 60% 70% 40%' },
          '75%': { borderRadius: '60% 30% 60% 40% / 40% 60% 30% 70%' },
        },
        liquidFlow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        wave: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.6' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      })
    },
  ],
}
