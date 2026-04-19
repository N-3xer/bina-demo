/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F7C82',
          dark: '#0B2E33',
          light: '#B8E3E9',
        },
        mid: '#93B1B5',
        surface: '#FFFFFF',
        bg: '#F5F9FA',
        error: '#C0392B',
        success: '#1D9E75',
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['Inter Mono', 'monospace'],
      },
      borderRadius: {
        card: '8px',
        btn: '6px',
        input: '4px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06)',
        modal: '0 8px 32px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
