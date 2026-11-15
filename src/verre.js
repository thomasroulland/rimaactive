// Liquid Glass en mouvement (15 novembre 2026) : le reflet qui suit le doigt ou la souris sur les cartes et la barre,
// et la barre du haut qui se resserre quand on descend dans la page. Rien ne bouge si l'appareil demande moins d'animation.
const CARTES = '.entete__barre, .service, .offre, .question, .formulaire, .approche__cadre, .ecrans__panneau, .ec-semaine, .ec-etape, .ec-pcarte, .ec-chiffre, .ec-records, .ec-regul, ' +
  '.espace-carte, .ec-histo__carte, .ec-carte, .disc, .carte-coache, .messagerie__fil, .ec-sexo--carte, .ec-piedbloc, .offres-page__liens, .bascule, .ec-noire, .bandeau-coach, .ec-recap, .ec-recapm'

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

  // la barre se resserre après 24 px de défilement ; la pastille de la barre se replace à la fin du mouvement
  const html = document.documentElement
  let defile = false
  const maj = () => {
    const bas = window.scrollY > 24
    if (bas !== defile) { defile = bas; html.toggleAttribute('data-defile', bas) }
  }
  window.addEventListener('scroll', maj, { passive: true })
  maj()
  document.addEventListener('transitionend', (e) => {
    if (e.target instanceof Element && e.target.matches('.entete__barre') && e.propertyName === 'width') window.dispatchEvent(new Event('resize'))
  })
}
