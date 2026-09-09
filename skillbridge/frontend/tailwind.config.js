/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#1E3A5F',
          950: '#102a43',
        },
        teal: {
          50: '#e6f7f5',
          100: '#b3e9e3',
          200: '#80dad1',
          300: '#4dcbbf',
          400: '#26bdb0',
          500: '#2A9D8F',
          600: '#238a7d',
          700: '#1b7469',
          800: '#135e55',
          900: '#0a4840',
        },
        amber: {
          50: '#fef9ee',
          100: '#fdf0d1',
          200: '#fbe0a3',
          300: '#f9cc6d',
          400: '#f7b73d',
          500: '#E9A23B',
          600: '#d4892a',
          700: '#b06e20',
          800: '#8e561b',
          900: '#724518',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
