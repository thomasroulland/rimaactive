import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

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

// Application installable (PWA, 19 novembre 2026) : icône et nom sur l'écran d'accueil (iPhone et Android), ouverture en plein écran,
// et l'espace s'ouvre même sans réseau (salle de sport) : le site est gardé dans le téléphone, les photos des exercices aussi.
// Les données (programme, séances, notes) restent hors ligne grâce au cache de Firestore (voir src/espace/firebase.js).
const pwa = VitePWA({
  registerType: 'autoUpdate', // une nouvelle version du site se met en place toute seule
  injectRegister: 'auto',
  includeAssets: ['favicon.svg', 'favicon.png', 'apple-touch-icon.png'],
  manifest: {
    name: 'Rimaactive',
    short_name: 'Rimaactive',
    description: 'Coaching sportif avec Marie Sillas : mon programme et mes séances.',
    lang: 'fr',
    start_url: '/espace',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f4f3ef',
    theme_color: '#161514',
    icons: [
      { src: '/icone-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icone-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icone-masquable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    // gardé dans le téléphone dès la première visite : le code du site, les styles, les polices, les icônes et les captures de l'accueil
    globPatterns: ['**/*.{js,css,html,svg,woff2,png,webp}'],
    maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
    navigateFallback: '/index.html',
    navigateFallbackDenylist: [/^\/api\//],
    cleanupOutdatedCaches: true,
    // notifications (nouveau programme) : affichage et ouverture de la bonne page
    importScripts: ['/notifs-sw.js'],
    runtimeCaching: [
      {
        // photos des exercices (Firebase Storage) : une fois vues, elles restent disponibles sans réseau
        urlPattern: ({ url }) => url.hostname === 'firebasestorage.googleapis.com' || (url.hostname === '127.0.0.1' && url.port === '9199'),
        handler: 'CacheFirst',
        options: { cacheName: 'photos-exercices', expiration: { maxEntries: 600, maxAgeSeconds: 60 * 60 * 24 * 90 }, cacheableResponse: { statuses: [0, 200] } },
      },
      {
        // grandes photos du site (vitrine) : gardées après la première visite
        urlPattern: ({ request, sameOrigin }) => sameOrigin && request.destination === 'image',
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'images-site', expiration: { maxEntries: 80 } },
      },
    ],
  },
})

export default defineConfig({
  plugins: [react(), apiLocale(), pwa],
})
