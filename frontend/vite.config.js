import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Painel roda na porta 5174; chamadas /api são encaminhadas para a API (4000).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
