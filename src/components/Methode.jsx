import { useEffect, useRef } from 'react'
import { cran } from './cran.js'

const PAS = 34 // écart entre deux formats sur la roue, en degrés
const BANDES = ['var(--corail)', 'var(--neon)', 'var(--blanc)'] // la bande centrale change de couleur à chaque format

// Rubrique « ma méthode » : elle reste à l'écran pendant que la roue des formats d'entraînement
// tourne au fil du défilement
export default function Methode({ formats, children }) {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const roue = section.querySelector('.roue')
    const items = [...section.querySelectorAll('.roue__liste li')]
    const dernier = items.length - 1
    // Au doigt, le défilement a déjà son propre élan : moins d'inertie et des pauses plus courtes
    const tactile = window.matchMedia('(pointer: coarse)').matches
    const inertie = tactile ? 0.3 : 0.12
    const pause = tactile ? 0.2 : 0.6
    let cible = 0
    let actuel = 0
    let actif = -1
    let image = null
    let debut = 0
    let course = 1
    let rayon = 0

    section.classList.add('roue-section--animee')

    // Les dimensions ne sont lues qu'au chargement et au redimensionnement, jamais pendant le défilement :
    // relire la mise en page à chaque image est ce qui saccade sur téléphone.
    const dimensionner = () => {
      debut = section.getBoundingClientRect().top + window.scrollY
      course = Math.max(1, section.offsetHeight - window.innerHeight)
      rayon = roue.offsetHeight * 0.36
    }

    // Avancement dans la rubrique : 0 quand elle se fixe en haut, le dernier format quand elle repart
    const mesurer = () => {
      const p = Math.min(1, Math.max(0, (window.scrollY - debut) / course))
      cible = Math.min(dernier, cran(p * (dernier + 0.6), pause))
    }

    const dessiner = () => {
      // Un peu d'inertie pour que la roue glisse au lieu de sauter
      actuel += (cible - actuel) * inertie
      if (Math.abs(cible - actuel) < 0.001) actuel = cible
      items.forEach((li, i) => {
        const angle = (i - actuel) * PAS
        const radians = (angle * Math.PI) / 180
        const proximite = Math.max(0, Math.cos(radians))
        // Roue imitée en 2D : chaque format glisse sur le cercle et s'aplatit vers les bords.
        // Pas de vraie 3D, qui floute le texte et pèse lourd sur téléphone.
        li.style.transform = `translateY(${Math.sin(radians) * rayon}px) scaleY(${proximite.toFixed(3)})`
        li.style.opacity = Math.abs(angle) > 75 ? 0 : 0.2 + 0.8 * proximite ** 8
      })
      const nouveau = Math.round(actuel)
      if (nouveau !== actif) {
        items[actif]?.classList.remove('roue__format--actif')
        items[nouveau].classList.add('roue__format--actif')
        roue.style.setProperty('--bande', BANDES[nouveau % BANDES.length])
        actif = nouveau
      }
      image = actuel === cible ? null : requestAnimationFrame(dessiner)
    }

    const auDefilement = () => {
      mesurer()
      if (!image) image = requestAnimationFrame(dessiner)
    }

    const auRedimensionnement = () => {
      dimensionner()
      auDefilement()
    }

    dimensionner()
    mesurer()
    actuel = cible
    dessiner()
    window.addEventListener('scroll', auDefilement, { passive: true })
    window.addEventListener('resize', auRedimensionnement)
    // La page peut changer de hauteur au-dessus de la roue (polices, photos qui se chargent)
    const observateur = new ResizeObserver(auRedimensionnement)
    observateur.observe(document.body)
    return () => {
      observateur.disconnect()
      window.removeEventListener('scroll', auDefilement)
      window.removeEventListener('resize', auRedimensionnement)
      if (image) cancelAnimationFrame(image)
      section.classList.remove('roue-section--animee')
    }
  }, [formats])

  return (
    <section id="methode" className="roue-section sur-encre" ref={sectionRef} aria-labelledby="methode-titre">
      <div className="roue-section__ecran">
        <div className="conteneur roue-section__grille">
          <div>
            <h2 id="methode-titre" className="titre titre--accueil">ma méthode</h2>
            <div className="roue-section__texte">{children}</div>
          </div>
          <div className="roue">
            <ul className="formats roue__liste">
              {formats.map((format) => (
                <li key={format}>{format}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
