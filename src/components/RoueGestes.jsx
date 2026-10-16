import { useEffect, useRef } from 'react'

const PAS = 34 // écart entre deux gestes sur la roue, en degrés
const BANDES = ['var(--corail)', 'var(--neon)', 'var(--blanc)'] // la bande centrale change de couleur à chaque geste

// Avance « à crans » : la roue marque une pause sur chaque geste, puis tourne jusqu'au suivant
function cran(p) {
  const i = Math.floor(p)
  const f = p - i
  const t = Math.min(1, Math.max(0, (f - 0.3) / 0.4))
  return i + t * t * (3 - 2 * t)
}

// Rubrique des gestes : elle reste à l'écran pendant que la roue tourne au fil du défilement
export default function RoueGestes({ gestes }) {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const roue = section.querySelector('.roue')
    const items = [...section.querySelectorAll('.roue__liste li')]
    const dernier = items.length - 1
    let cible = 0
    let actuel = 0
    let actif = -1
    let image = null

    section.classList.add('roue-section--animee')

    // Avancement dans la rubrique : 0 quand elle se fixe en haut, le dernier geste quand elle repart
    const mesurer = () => {
      const { top, height } = section.getBoundingClientRect()
      const course = height - window.innerHeight
      const p = Math.min(1, Math.max(0, -top / course))
      cible = cran(p * (dernier + 0.6))
      cible = Math.min(dernier, cible)
    }

    const dessiner = () => {
      // Un peu d'inertie pour que la roue glisse au lieu de sauter
      actuel += (cible - actuel) * 0.12
      if (Math.abs(cible - actuel) < 0.001) actuel = cible
      const rayon = roue.offsetHeight * 0.36
      items.forEach((li, i) => {
        const angle = (i - actuel) * PAS
        const proximite = Math.max(0, Math.cos((angle * Math.PI) / 180))
        li.style.transform = `rotateX(${-angle}deg) translateZ(${rayon}px)`
        li.style.opacity = Math.abs(angle) > 75 ? 0 : 0.2 + 0.8 * proximite ** 8
      })
      const nouveau = Math.round(actuel)
      if (nouveau !== actif) {
        items[actif]?.classList.remove('roue__geste--actif')
        items[nouveau].classList.add('roue__geste--actif')
        roue.style.setProperty('--bande', BANDES[nouveau % BANDES.length])
        actif = nouveau
      }
      image = actuel === cible ? null : requestAnimationFrame(dessiner)
    }

    const auDefilement = () => {
      mesurer()
      if (!image) image = requestAnimationFrame(dessiner)
    }

    mesurer()
    actuel = cible
    dessiner()
    window.addEventListener('scroll', auDefilement, { passive: true })
    window.addEventListener('resize', auDefilement)
    return () => {
      window.removeEventListener('scroll', auDefilement)
      window.removeEventListener('resize', auDefilement)
      if (image) cancelAnimationFrame(image)
      section.classList.remove('roue-section--animee')
    }
  }, [gestes])

  return (
    <section className="roue-section sur-encre" ref={sectionRef} aria-labelledby="gestes-titre">
      <div className="roue-section__ecran">
        <div className="conteneur roue-section__grille">
          <div>
            <h2 id="gestes-titre" className="titre titre--section">les gestes de tous les jours</h2>
            <p className="texte" style={{ marginTop: 24 }}>
              Les séances développent les capacités dont nous avons réellement besoin au quotidien.
            </p>
          </div>
          <div className="roue">
            <ul className="gestes roue__liste">
              {gestes.map((geste) => (
                <li key={geste}>{geste}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
