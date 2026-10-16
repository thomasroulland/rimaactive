import { useEffect, useRef } from 'react'

const PAS = 30 // écart entre deux gestes sur la roue, en degrés
const RAYON = 110 // rayon de la roue, en px

// Les gestes défilent sur une roue verticale au rythme du défilement de la page :
// celui qui passe au centre est mis en avant.
export default function RoueGestes({ gestes }) {
  const roueRef = useRef(null)

  useEffect(() => {
    const roue = roueRef.current
    if (!roue || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const items = [...roue.querySelectorAll('li')]
    const dernier = items.length - 1
    let cible = 0
    let actuel = 0
    let image = null

    // Avancement : 0 quand la roue entre par le bas de l'écran, 1 quand elle atteint le quart haut
    const mesurer = () => {
      const { top, height } = roue.getBoundingClientRect()
      const centre = top + height / 2
      const h = window.innerHeight
      const p = (h * 0.85 - centre) / (h * 0.6)
      cible = Math.min(1, Math.max(0, p)) * dernier
    }

    const dessiner = () => {
      // Un peu d'inertie pour que la roue glisse au lieu de sauter
      actuel += (cible - actuel) * 0.14
      if (Math.abs(cible - actuel) < 0.001) actuel = cible
      items.forEach((li, i) => {
        const angle = (i - actuel) * PAS
        const proximite = Math.max(0, Math.cos((angle * Math.PI) / 180))
        li.style.transform = `rotateX(${-angle}deg) translateZ(${RAYON}px)`
        li.style.opacity = Math.abs(angle) > 75 ? 0 : 0.25 + 0.75 * proximite ** 6
        li.classList.toggle('roue__geste--actif', Math.round(actuel) === i)
      })
      image = actuel === cible ? null : requestAnimationFrame(dessiner)
    }

    const auDefilement = () => {
      mesurer()
      if (!image) image = requestAnimationFrame(dessiner)
    }

    roue.classList.add('roue--animee')
    mesurer()
    actuel = cible
    dessiner()
    window.addEventListener('scroll', auDefilement, { passive: true })
    window.addEventListener('resize', auDefilement)
    return () => {
      window.removeEventListener('scroll', auDefilement)
      window.removeEventListener('resize', auDefilement)
      if (image) cancelAnimationFrame(image)
    }
  }, [gestes])

  return (
    <div className="roue" ref={roueRef}>
      <ul className="gestes roue__liste">
        {gestes.map((geste) => (
          <li key={geste}>{geste}</li>
        ))}
      </ul>
    </div>
  )
}
