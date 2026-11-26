// Pages du site vitrine écrites en HTML au moment de la mise en ligne (26 novembre 2026, audit « GEO ») :
// les robots des moteurs de recherche et des assistants IA lisent le texte sans exécuter le JavaScript.
// Lancé par « npm run build » après « vite build » et le rendu serveur (dossier .ssr, effacé à la fin).
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const noop = () => {}
const mq = () => ({ matches: false, addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop })
// le site s'attend à un navigateur : de quoi faire le rendu une fois, sans rien afficher
globalThis.window = { matchMedia: mq, addEventListener: noop, removeEventListener: noop, location: { pathname: '/', search: '', hash: '' }, innerWidth: 1280, innerHeight: 800, navigator: { userAgent: '' } }
globalThis.document = { addEventListener: noop, removeEventListener: noop, documentElement: { style: {}, classList: { add: noop, remove: noop } }, querySelector: () => null, querySelectorAll: () => [] }
globalThis.localStorage = { getItem: () => null, setItem: noop, removeItem: noop }

const racine = new URL('..', import.meta.url).pathname
const dist = join(racine, 'dist')
const { rendre } = await import(join(racine, '.ssr', 'entree-serveur.js'))
const { PAGES, SITE, IDENTITE } = await import(join(racine, '.ssr', 'entree-serveur.js')).then((m) => m.seo)

const coquille = readFileSync(join(dist, 'index.html'), 'utf8')
// la coquille vide reste disponible pour l'espace (et les autres adresses) : voir vercel.json
writeFileSync(join(dist, 'app.html'), coquille)

const echapper = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
for (const [chemin, { titre, description }] of Object.entries(PAGES)) {
  const url = `${SITE}${chemin === '/' ? '/' : chemin}`
  const tete = [
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${SITE}/apercu-partage.jpg" />`,
    `<script type="application/ld+json">${JSON.stringify(IDENTITE).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ')
  let html = coquille
    .replace(/<title>[^<]*<\/title>/, `<title>${echapper(titre)}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${echapper(description)}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${echapper(titre)}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${echapper(description)}" />`)
    .replace('</head>', `    ${tete}\n  </head>`)
    // le service worker de l'application peut servir cette page pour une autre adresse (l'espace…) : on la vide alors avant l'affichage
    .replace('<div id="root"></div>', `<div id="root" data-page="${chemin}">${rendre(chemin)}</div><script>(function(){var r=document.getElementById('root'),p=location.pathname.replace(/\\/+$/,'')||'/';if(p!==r.getAttribute('data-page'))r.textContent=''})()</script>`)
  if (!html.includes('rel="canonical"') || !html.includes('data-page=')) throw new Error(`Page ${chemin} : rendu incomplet`)
  writeFileSync(join(dist, chemin === '/' ? 'index.html' : `${chemin.slice(1)}.html`), html)
  console.log(`page écrite : ${chemin}`)
}
rmSync(join(racine, '.ssr'), { recursive: true, force: true })
