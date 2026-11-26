// Rendu du site vitrine en HTML au moment de la mise en ligne (26 novembre 2026, audit « GEO ») : utilisé par
// scripts/prerendre.mjs. Les robots lisent le texte des pages sans JavaScript ; le navigateur redessine la page normalement.
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App.jsx'
export * as seo from './seo.js'

export function rendre(url) {
  return renderToString(<StaticRouter location={url}><App /></StaticRouter>)
}
