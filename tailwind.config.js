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
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          active: 'var(--color-primary-active)',
          light: 'var(--color-primary-light)',
          border: 'var(--color-primary-border)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
        },
        background: 'var(--background)',
        surface: '#FFFFFF',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
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
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
