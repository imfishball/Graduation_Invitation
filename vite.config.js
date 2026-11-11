import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    // Ảnh nặng nằm ở public/assets nên không cần xử lý thêm
    assetsInlineLimit: 4096,
  },
})