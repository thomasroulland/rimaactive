import { useEffect } from 'react'
import { pageSeo } from '../seo.js'

// Titre de l'onglet et description de la page : ceux du référencement (src/seo.js) pour les pages publiques
export default function useTitre(titre) {
  useEffect(() => {
    const seo = pageSeo(window.location.pathname)
    document.title = seo?.titre ?? `Rimaactive · ${titre}`
    if (seo) document.querySelector('meta[name="description"]')?.setAttribute('content', seo.description)
  }, [titre])
}
