import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: '/medical-app-fe/',
    plugins: [react(), tailwindcss()],
    server: {
      // Same-origin /api keeps the httpOnly refresh cookie first-party.
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'https://deid-api.onrender.com',
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})
