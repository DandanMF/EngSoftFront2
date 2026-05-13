/ @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",  
    "./src/**/*.{js,ts,jsx,tsx}", // Garante que Tailwind analise todos os arquivos necessários
  ],
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
};