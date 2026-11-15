// Liquid Glass en mouvement (15 novembre 2026) : le reflet qui suit le doigt ou la souris sur les cartes et la barre,
// Rien ne bouge si l'appareil demande moins d'animation.
const CARTES = '.entete, .service, .offre, .question, .formulaire, .approche__cadre, .ecrans__panneau, .ec-semaine, .ec-etape, .ec-pcarte, .ec-chiffre, .ec-records, .ec-regul, ' +
  '.espace-carte, .ec-histo__carte, .ec-carte, .disc, .carte-coache, .messagerie__fil, .ec-sexo--carte, .ec-s2-carte, .offres-page__liens, .bascule, .ec-noire, .bandeau-coach'

export default function initVerre() {
  if (typeof window === 'undefined' || window.__verre) return
  window.__verre = true
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  let cible = null
  const poser = (e) => {
    const el = e.target instanceof Element ? e.target.closest(CARTES) : null
    if (cible && cible !== el) { cible.style.removeProperty('--mx'); cible.style.removeProperty('--my') }
    cible = el
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  document.addEventListener('pointermove', poser, { passive: true })
  document.addEventListener('pointerleave', () => { if (cible) { cible.style.removeProperty('--mx'); cible.style.removeProperty('--my'); cible = null } })
}
