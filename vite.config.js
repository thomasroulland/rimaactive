import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev seulement : sert api/*.js comme Vercel, pour travailler avec les émulateurs sans Vercel CLI.
function apiLocale() {
  return {
    name: 'api-locale',
    apply: 'serve',
    configureServer(serveur) {
      if (process.env.VITE_FIREBASE_EMULATEURS === '1') {
        process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080'
        process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099'
        process.env.FIREBASE_STORAGE_EMULATOR_HOST ||= '127.0.0.1:9199'
      }
      serveur.middlewares.use(async (req, res, next) => {
        const m = /^\/api\/([\w-]+)(?:\?.*)?$/.exec(req.url || '')
        if (!m) return next()
        const reponse = {
          status(code) { res.statusCode = code; return reponse },
          json(corps) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(corps)) },
          end(...a) { res.end(...a) },
        }
        try {
          let brut = ''
          for await (const morceau of req) brut += morceau
          try { req.body = brut ? JSON.parse(brut) : {} } catch { req.body = {} }
          const { default: gestionnaire } = await serveur.ssrLoadModule(`/api/${m[1]}.js`)
          await gestionnaire(req, reponse)
        } catch (e) {
          res.statusCode = 500
          res.end(JSON.stringify({ code: 'serveur', message: String(e?.message || e) }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), apiLocale()],
})
