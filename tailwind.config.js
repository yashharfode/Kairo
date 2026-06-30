/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#64C9B0',
          hover: '#4EB89C',
        },
        secondary: {
          DEFAULT: '#E6F7F1',
        },
        background: '#F7FAFA',
        surface: '#FFFFFF',
        text: {
          primary: '#202F2B',
          secondary: '#6B7A78',
        },
        accent: '#FFB703',
        priority: {
          high: '#ED6A5A',
          medium: '#FFCA3A',
        },
        success: '#6FD08C',
        info: '#6BAED6',
      },
      fontFamily: {
        heading: ['Geist', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
