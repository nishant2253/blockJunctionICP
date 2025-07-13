/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'float': 'float 18s linear infinite',
        'spin-blob': 'spinBlob 40s linear infinite',
        'fade': 'fade 0.9s forwards',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0) scale(1)' },
          '100%': { transform: 'translateY(-130vh) scale(0.6)', opacity: '0' },
        },
        spinBlob: {
          'to': { transform: 'rotate(360deg)' },
        },
        fade: {
          'to': { opacity: '1', transform: 'none' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}