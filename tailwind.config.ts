import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f7f7f7',
          100: '#ededed',
          200: '#e0e0e0',
          300: '#cfcfcf',
          400: '#b1b1b1',
          500: '#8e8e8e',
          600: '#6b6b6b',
          700: '#4b4b4b',
          800: '#2f2f2f',
          900: '#1a1a1a',
        },
        church: {
          cream: '#ffffff',   // 배경 → 흰색
          gold: '#000000',    // 포인트 → 검정
          brown: '#000000',   // 본문 텍스트 → 검정
          sage: '#9a9a9a',    // 보조 텍스트 → 연회색
          navy: '#000000',    // 헤더 → 검정
        },
      },
      fontFamily: {
        serif: ['"PretendardStd"', 'serif'],
        sans: ['"PretendardStd"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}

export default config
