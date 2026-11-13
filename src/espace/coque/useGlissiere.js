import { useLayoutEffect, useRef } from 'react'

// Trait vermillon qui glisse sous l'onglet actif (CSS : .ec-glisse). Le conteneur (ref renvoyée) doit contenir les onglets
// en enfants directs ; l'actif porte aria-pressed="true" ou aria-current="page". `cle` change quand l'onglet actif change.
export default function useGlissiere(cle) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const c = ref.current
    if (!c) return undefined
    let annule = false
    const mesurer = () => {
      const actif = c.querySelector(':scope > [aria-pressed="true"], :scope > [aria-current="page"]')
      if (!actif) { c.removeAttribute('data-pret'); return false }
      c.style.setProperty('--glisse-x', `${actif.offsetLeft}px`)
      c.style.setProperty('--glisse-l', `${actif.offsetWidth}px`)
      return true
    }
    let image = 0
    // le trait n'apparaît qu'après la première mesure (pas de glissement depuis la gauche au chargement)
    if (mesurer()) image = requestAnimationFrame(() => c.setAttribute('data-pret', ''))
    const remesurer = () => { if (!annule) mesurer() }
    // la taille du conteneur ou des onglets change (fenêtre, polices, texte) : le trait suit
    const observateur = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(remesurer)
    observateur?.observe(c)
    for (const f of c.children) observateur?.observe(f)
    if (!observateur) window.addEventListener('resize', remesurer)
    return () => {
      annule = true
      cancelAnimationFrame(image)
      observateur?.disconnect()
      window.removeEventListener('resize', remesurer)
    }
  }, [cle])
  return ref
}
