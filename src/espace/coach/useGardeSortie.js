import { useEffect, useRef } from 'react'
import { definirGardeRetour } from '../../components/gardeRetour.js'

// Tant que `actif` est vrai, intercepte ce qui ferait quitter la page de l'éditeur sans enregistrer :
// clic sur un lien interne vers une autre page (onglets, « Mes coachés », menu du site), sur un bouton
// marqué `data-quitter` (« Se déconnecter ») et le bouton Précédent / Suivant du navigateur.
// `demander(continuer)` affiche la confirmation ; `continuer()` refait l'action sans garde.
// Les liens qui ne changent que les paramètres (?semaine, ?seance) restent libres.
export default function useGardeSortie(actif, demander) {
  const etat = useRef({ actif, demander })
  etat.current = { actif, demander }

  useEffect(() => {
    const chemin = window.location.pathname
    let libre = false // action confirmée : on laisse passer
    let retourAnnule = false // notre propre history.go(1) après un Précédent intercepté

    const clic = (e) => {
      if (libre || !etat.current.actif) return
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const el = e.target instanceof Element ? e.target.closest('a[href], [data-quitter]') : null
      if (!el) return
      if (el.tagName === 'A') {
        if (el.target && el.target !== '_self') return
        const url = new URL(el.href, window.location.href)
        if (url.origin !== window.location.origin || url.pathname === chemin) return
      }
      e.preventDefault()
      e.stopPropagation()
      etat.current.demander(() => { libre = true; el.click(); libre = false })
    }

    // Appelé par l'écouteur posé avant le routeur (gardeRetour.js) : le routeur ne voit pas le retour annulé.
    const pop = (e) => {
      if (retourAnnule) { retourAnnule = false; e.stopImmediatePropagation(); return }
      if (libre) { libre = false; return }
      if (!etat.current.actif || window.location.pathname === chemin) return
      e.stopImmediatePropagation()
      retourAnnule = true
      window.history.go(1) // remet l'adresse de l'éditeur
      etat.current.demander(() => { libre = true; window.history.back() })
    }

    document.addEventListener('click', clic, true)
    const retirerRetour = definirGardeRetour(pop)
    return () => {
      document.removeEventListener('click', clic, true)
      retirerRetour()
    }
  }, [])
}
