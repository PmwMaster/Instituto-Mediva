/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-navy': '#0F172A',
        'brand-gold': '#C5B358',
        'brand-gold-hover': '#D9C985',
        'brand-white': '#FFFFFF',
        'brand-offwhite': '#F8FAFC',
        'brand-title': '#0F172A',
        'brand-text': '#475569',
        'brand-whatsapp': '#25D366'
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
}
