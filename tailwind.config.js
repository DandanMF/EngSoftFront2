/ @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",  
    "./src/**/*.{js,ts,jsx,tsx}", // Garante que Tailwind analise todos os arquivos necessários
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};