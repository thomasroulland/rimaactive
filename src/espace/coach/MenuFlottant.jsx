import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Menu déroulant dont la liste est posée directement sur la page (au-dessus de tout, jamais coupée par une colonne
// qui défile) : sous le bouton, ou au-dessus s'il n'y a pas la place. Elle suit son bouton quand on fait défiler.
// `children` reçoit une fonction `fermer` pour refermer le menu après un choix.
export default function MenuFlottant({ classe = '', classeBouton, libelle, titre, bouton: contenu, largeur, aGauche = false, aria, children }) {
  const [ouvert, setOuvert] = useState(false)
  const boite = useRef(null)
  const bouton = useRef(null)
  const liste = useRef(null)

  const fermer = () => { if (boite.current) boite.current.open = false }

  useLayoutEffect(() => {
    if (!ouvert) return undefined
    const placer = () => {
      const l = liste.current, b = bouton.current
      if (!l || !b) return
      const r = b.getBoundingClientRect()
      const w = l.offsetWidth, h = l.offsetHeight
      let x = aGauche ? r.left : r.right - w
      x = Math.max(8, Math.min(x, window.innerWidth - w - 8))
      let y = r.bottom + 6
      if (y + h > window.innerHeight - 8) y = Math.max(8, r.top - h - 6)
      l.style.left = `${x}px`
      l.style.top = `${y}px`
    }
    placer()
    let raf = 0
    const suivre = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(placer) }
    window.addEventListener('scroll', suivre, true)
    window.addEventListener('resize', suivre)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', suivre, true); window.removeEventListener('resize', suivre) }
  }, [ouvert, aGauche])

  // un clic ailleurs ou Échap ferment le menu (le script du verre gère aussi les menus <details>)
  useEffect(() => {
    if (!ouvert) return undefined
    const dehors = (e) => {
      if (boite.current?.contains(e.target) || liste.current?.contains(e.target)) return
      fermer()
    }
    const touche = (e) => { if (e.key === 'Escape') fermer() }
    document.addEventListener('pointerdown', dehors)
    document.addEventListener('keydown', touche)
    return () => { document.removeEventListener('pointerdown', dehors); document.removeEventListener('keydown', touche) }
  }, [ouvert])

  return (
    <details className={`gp-menu ${classe}`} ref={boite} onToggle={(e) => setOuvert(e.currentTarget.open)}>
      <summary ref={bouton} className={classeBouton} aria-label={libelle} title={titre}>{contenu}</summary>
      {ouvert && createPortal(
        <div ref={liste} className="gp-menu__liste gp-menu__liste--flottante" role="group" aria-label={aria} style={largeur ? { width: largeur } : undefined}>
          {children(fermer)}
        </div>,
        document.body,
      )}
    </details>
  )
}
