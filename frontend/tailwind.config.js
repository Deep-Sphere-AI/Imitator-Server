/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#2C3E50',   // Fondo general o texto oscuro
        teal: '#1ABC9C',       // Respuestas del asistente
        gold: '#F1C40F',       // Éxito o highlights
        lilac: '#8E44AD',      // Procesamiento / atención
        cloud: '#ECF0F1',      // Fondo claro o texto suave
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}
