import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // El navegador bloquea (CORS) las llamadas de un puerto a otro (5173 -> 5010).
    // Con este proxy, el frontend llama a /api/... (mismo origen) y Vite reenvía la
    // petición al backend. Así no hace falta tocar el backend para esta práctica.
    proxy: {
      '/api': 'http://localhost:5010',
    },
  },
})
