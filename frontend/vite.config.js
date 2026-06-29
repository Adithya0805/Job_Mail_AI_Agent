import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production-optimized Vite config with manual chunk splitting.
// manualChunks splits React/Router/Zustand into separate cacheable bundles.
// When app code changes, users re-download only the app chunk, not vendor libs.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth'],
          state: ['zustand']
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
