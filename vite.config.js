import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import hostAuthHandler from './api/host-auth.js'

function hostAuthServerPlugin() {
  const mountMiddleware = (middlewares) => {
    middlewares.use('/api/host-auth', (req, res, next) => {
      const urlPath = (req.url || '').split('?')[0]
      if (urlPath && urlPath !== '/') {
        next()
        return
      }
      Promise.resolve(hostAuthHandler(req, res)).catch(next)
    })
  }

  return {
    name: 'local-host-auth-api',
    configureServer(server) {
      mountMiddleware(server.middlewares)
    },
    configurePreviewServer(server) {
      mountMiddleware(server.middlewares)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (!process.env.HOST_PASSWORD && env.HOST_PASSWORD) {
    process.env.HOST_PASSWORD = env.HOST_PASSWORD
  }
  if (!process.env.HOST_AUTH_SECRET && env.HOST_AUTH_SECRET) {
    process.env.HOST_AUTH_SECRET = env.HOST_AUTH_SECRET
  }

  return {
    plugins: [react(), hostAuthServerPlugin()],
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
  }
})