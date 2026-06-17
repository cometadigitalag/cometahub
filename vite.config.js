import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuração do Vite com o plugin oficial do React (Fast Refresh / JSX).
export default defineConfig({
  plugins: [react()],
})
