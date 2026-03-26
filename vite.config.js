import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Configuración simplificada para resolver el problema de rendering chunks
    minify: 'esbuild', // Cambiar de terser a esbuild que es más rápido
    rollupOptions: {
      output: {
        // Configuración más simple
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true, // No permitir otros puertos
    host: true,
    proxy: {
      '/api/panos': {
        target: 'https://www.lanube360.com/reserva-martin-pescador',
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
