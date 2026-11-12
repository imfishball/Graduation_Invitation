import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import hostAuthHandler from './api/host-auth.js'
import notesHandler from './api/notes.js'

function localApiServerPlugin() {
  const mountHandler = (middlewares, routePath, handler) => {
    middlewares.use(routePath, (req, res, next) => {
      const urlPath = (req.url || '').split('?')[0]
      if (urlPath && urlPath !== '/') {
        next()
        return
      }
      Promise.resolve(handler(req, res)).catch(next)
    })
  }

  const mountMiddleware = (middlewares) => {
    mountHandler(middlewares, '/api/host-auth', hostAuthHandler)
    mountHandler(middlewares, '/api/notes', notesHandler)
  }

  return {
    name: 'local-api-server',
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
  const passthroughKeys = [
    'HOST_PASSWORD',
    'HOST_AUTH_SECRET',
    'KV_REST_API_URL',
    'KV_REST_API_TOKEN',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'NOTES_GIST_ID',
    'GITHUB_TOKEN',
  ]
  for (const key of passthroughKeys) {
    if (!process.env[key] && env[key]) {
      process.env[key] = env[key]
    }
  }

  return {
    plugins: [react(), localApiServerPlugin()],
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