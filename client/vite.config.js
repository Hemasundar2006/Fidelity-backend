import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/trimister-api': {
        target: 'https://trimister.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/trimister-api/, '')
      }
    }
  }
})
