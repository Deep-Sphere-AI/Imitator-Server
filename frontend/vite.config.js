import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/static/',
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API calls to FastAPI backend
      '/process_video': 'http://localhost:8000',
    },
  },
})
