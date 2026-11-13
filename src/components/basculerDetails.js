// Ouvre ou ferme un <details> en glissant (hauteur, marges intérieures et fondu), au lieu d'un changement d'un coup.
// À appeler sur le clic du <summary> : basculerDetails(evenement, elementDuContenu).
// Le <details> reste natif (clavier, lecteurs d'écran) ; avec « réduire les animations », rien ne change.
// Pendant la fermeture, le <details> porte data-ferme : l'icône (+ / −) peut changer tout de suite.
const enCours = new WeakMap()
const DUREE = 300
const COURBE = 'cubic-bezier(0.3, 0.7, 0.2, 1)'

export function basculerDetails(evenement, contenu) {
  const details = evenement.currentTarget.parentElement
  if (!details || !contenu || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  evenement.preventDefault()
  const precedente = enCours.get(details)
  const depart = details.open ? contenu.getBoundingClientRect().height : 0
  precedente?.cancel()
  const ouvrir = !details.open || details.dataset.ferme === '1'
  const style = () => getComputedStyle(contenu)
  contenu.style.overflow = 'hidden'
  let animation
  if (ouvrir) {
    delete details.dataset.ferme
    details.open = true
    const s = style()
    animation = contenu.animate([
      { height: `${depart}px`, paddingTop: depart ? s.paddingTop : '0px', paddingBottom: depart ? s.paddingBottom : '0px', opacity: depart ? 1 : 0 },
      { height: `${contenu.scrollHeight}px`, paddingTop: s.paddingTop, paddingBottom: s.paddingBottom, opacity: 1 },
    ], { duration: DUREE, easing: COURBE })
  } else {
    details.dataset.ferme = '1'
    const s = style()
    animation = contenu.animate([
      { height: `${depart}px`, paddingTop: s.paddingTop, paddingBottom: s.paddingBottom, opacity: 1 },
      { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 },
    ], { duration: DUREE * 0.85, easing: COURBE })
  }
  enCours.set(details, animation)
  animation.onfinish = () => {
    contenu.style.overflow = ''
    enCours.delete(details)
    if (!ouvrir) { details.open = false; delete details.dataset.ferme }
  }
}
