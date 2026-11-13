import { useLayoutEffect, useRef } from 'react'

// Trait vermillon qui glisse sous l'onglet actif (CSS : .ec-glisse). Le conteneur (ref renvoyée) doit contenir les onglets
// en enfants directs ; l'actif porte aria-pressed="true" ou aria-current="page". `cle` change quand l'onglet actif change.
export default function useGlissiere(cle) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const c = ref.current
    if (!c) return undefined
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
    const remesurer = () => { mesurer() }
    window.addEventListener('resize', remesurer)
    document.fonts?.ready?.then(remesurer)
    return () => { cancelAnimationFrame(image); window.removeEventListener('resize', remesurer) }
  }, [cle])
  return ref
}
