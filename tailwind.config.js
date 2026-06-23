/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          900: '#070b1a',
          800: '#0c1430',
          700: '#142253',
          accent: '#5eead4',
        },
        rocky: '#f59e0b',
      },
      fontFamily: {
        display: ['"Pretendard"', '"Noto Sans KR"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
