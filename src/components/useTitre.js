import { useEffect } from 'react'
import { ESPACE, pageSeo } from '../seo.js'

// Titre de l'onglet et description de la page : ceux du référencement (src/seo.js) pour les pages publiques
export default function useTitre(titre) {
  useEffect(() => {
    // la page de connexion de l'espace a son propre titre (vu dans Google)
    const seo = pageSeo(window.location.pathname) ?? (titre === 'Connexion' ? ESPACE : null)
    document.title = seo?.titre ?? `Rimaactive · ${titre}`
    if (seo) document.querySelector('meta[name="description"]')?.setAttribute('content', seo.description)
  }, [titre])
}
