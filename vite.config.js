import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // No permitir otros puertos
    host: true,
    proxy: {
      '/api/panos': {
        target: 'https://lanube360.com/temporales/reserva-martin-pescador2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/panos/, '/panos'),
        secure: true
      },
      // Proxy para Fundo de Hesa (soluciona CORS)
      '/api/fundodehesa': {
        target: 'https://lanube360.com/fundodehesa360',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fundodehesa/, ''),
        secure: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    }
  }
})
