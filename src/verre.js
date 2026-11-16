// Liquid Glass en mouvement (15 novembre 2026) : le reflet qui suit le doigt ou la souris sur les cartes et la barre,
// Rien ne bouge si l'appareil demande moins d'animation.
const CARTES = '.entete, .service, .offre, .question, .formulaire, .approche__cadre, .ecrans__panneau, .ec-semaine, .ec-etape, .ec-pcarte, .ec-chiffre, .ec-records, .ec-regul, ' +
  '.espace-carte, .ec-histo__carte, .ec-carte, .disc, .carte-coache, .messagerie__fil, .ec-sexo--carte, .ec-s2-carte, .gp-seance, .gp-col, .es2-bloc, .offres-page__liens, .bascule, .ec-noire, .bandeau-coach'

export default function initVerre() {
  if (typeof window === 'undefined' || window.__verre) return
  window.__verre = true
  // menus déroulants (grille, modèles) : un clic ailleurs ou Échap les referme, et ouvrir l'un ferme les autres
  document.addEventListener('pointerdown', (e) => {
    document.querySelectorAll('details.gp-menu[open]').forEach((d) => { if (!d.contains(e.target)) d.open = false })
  })
  // la liste d'un menu passe devant tout (même hors de la grille qui défile) : elle est placée par rapport à l'écran,
  // sous le bouton, ou au-dessus s'il n'y a pas la place
  const placer = (d) => {
    const liste = d.querySelector(':scope > .gp-menu__liste')
    const bouton = d.querySelector(':scope > summary')
    if (!liste || !bouton) return
    liste.style.cssText = 'position:fixed;right:auto;bottom:auto;left:0;top:0;visibility:hidden'
    const o = liste.getBoundingClientRect()
    const b = bouton.getBoundingClientRect()
    const l = liste.offsetWidth, h = liste.offsetHeight
    const aGauche = d.classList.contains('prog-modele')
    let x = aGauche ? b.left : b.right - l
    x = Math.max(8, Math.min(x, window.innerWidth - l - 8))
    let y = b.bottom + 6
    if (y + h > window.innerHeight - 8) y = Math.max(8, b.top - h - 6)
    liste.style.left = `${x - o.left}px`
    liste.style.top = `${y - o.top}px`
    liste.style.visibility = ''
  }
  document.addEventListener('toggle', (e) => {
    const d = e.target
    if (!(d instanceof HTMLDetailsElement) || !d.classList.contains('gp-menu')) return
    if (d.open) { ouvertA = Date.now(); placer(d) }
    else d.querySelector(':scope > .gp-menu__liste')?.removeAttribute('style')
  }, true)
  let ouvertA = 0
  document.addEventListener('pointerdown', () => { ouvertA = Date.now() }, true)
  const fermerTout = () => document.querySelectorAll('details.gp-menu[open]').forEach((d) => { d.open = false })
  window.addEventListener('resize', fermerTout)
  document.addEventListener('scroll', (e) => {
    if (Date.now() - ouvertA < 400) return
    if (!(e.target instanceof Element) || !e.target.closest('.gp-menu__liste')) fermerTout()
  }, true)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('details.gp-menu[open]').forEach((d) => { d.open = false })
  })
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
