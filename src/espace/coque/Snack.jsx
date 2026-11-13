import { useEffect, useRef, useState } from 'react'

// Bulle de confirmation en bas de l'écran (« snackbar », 13 novembre 2026) : chaque fois qu'un écran de l'espace
// affiche un message d'enregistrement ou d'erreur, il réapparaît ici quelques secondes, bien visible.
// Les écrans ne changent pas : la bulle lit leurs zones de message. Elle est cachée aux lecteurs d'écran,
// qui annoncent déjà le message d'origine (role="status" / role="alert").
const ZONES = '.espace-message, .ec-fin__etat, .ec-erreur'
const DUREE = 3800

export default function Snack() {
  const [bulle, setBulle] = useState(null) // { texte, erreur, cle }
  const vus = useRef(new WeakMap())
  const minuteur = useRef(null)

  useEffect(() => {
    const zone = document.getElementById('contenu') ?? document.body
    const lire = () => {
      zone.querySelectorAll(ZONES).forEach((el) => {
        const texte = el.textContent.trim()
        const avant = vus.current.get(el)
        vus.current.set(el, texte)
        if (!texte || texte === avant || texte.endsWith('…')) return
        const erreur = el.matches('.espace-message--erreur, .ec-erreur') || el.getAttribute('role') === 'alert'
        clearTimeout(minuteur.current)
        setBulle({ texte, erreur, cle: Date.now() })
        minuteur.current = setTimeout(() => setBulle(null), erreur ? DUREE + 2000 : DUREE)
      })
    }
    // ce qui est déjà affiché au chargement n'est pas une nouveauté
    zone.querySelectorAll(ZONES).forEach((el) => vus.current.set(el, el.textContent.trim()))
    const observateur = new MutationObserver(lire)
    observateur.observe(zone, { subtree: true, childList: true, characterData: true })
    return () => { observateur.disconnect(); clearTimeout(minuteur.current) }
  }, [])

  if (!bulle) return null
  return (
    <div key={bulle.cle} className={`snack${bulle.erreur ? ' snack--erreur' : ''}`} aria-hidden="true">
      <span className="snack__icone">
        {bulle.erreur
          ? <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 7v6M12 17h.01" /></svg>
          : <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
      </span>
      <span className="snack__texte">{bulle.texte}</span>
      <button type="button" className="snack__fermer" tabIndex={-1} onClick={() => setBulle(null)}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>
  )
}
