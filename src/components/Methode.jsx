import { useEffect, useRef, useState } from 'react'
import { cran } from './cran.js'

// Les trois poignées évidées du disque, centrées sur ces angles (en degrés)
const POIGNEES = [-90, 30, 150]
// Angles des trois phrases sur le bord du disque (0° = à droite du centre)
const ANGLES = [-36, 0, 36]
const PAS_SELECTEUR = 34 // écart entre deux spécialités sur le sélecteur, en degrés
const BANDES = ['var(--corail)', 'var(--neon)', 'var(--encre)'] // la bande change de couleur à chaque spécialité

// Arc de cercle de rayon r, de a1 à a2 degrés (sens des aiguilles d'une montre, 0° à droite)
function arc(r, a1, a2) {
  const point = (a) => `${(r * Math.cos((a * Math.PI) / 180)).toFixed(2)} ${(r * Math.sin((a * Math.PI) / 180)).toFixed(2)}`
  return `M ${point(a1)} A ${r} ${r} 0 0 1 ${point(a2)}`
}

// Rubrique « ma méthode » : un demi-disque de fonte au bord gauche de l'écran, avec les trois phrases
// de la méthode sur son bord, toutes visibles. À droite, le sélecteur des spécialités.
// Au défilement, la rubrique reste à l'écran : le disque tourne et le sélecteur passe d'une spécialité à l'autre.
// Avec « réduire les animations » : rien ne tourne, les spécialités sont listées.
export default function Methode({ phrases, specialites }) {
  const sectionRef = useRef(null)
  // Site rendu uniquement dans le navigateur : on peut décider dès le premier rendu
  const [anime] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    if (!anime) return
    const section = sectionRef.current
    const disque = section.querySelector('.methode__disque')
    const roue = section.querySelector('.selecteur')
    const items = [...roue.querySelectorAll('li')]
    const dernier = items.length - 1
    // Au doigt, le défilement a déjà son propre élan : moins d'inertie et des pauses plus courtes
    const tactile = window.matchMedia('(pointer: coarse)').matches
    const inertie = tactile ? 0.3 : 0.12
    const pause = tactile ? 0.25 : 0.5
    let cible = 0
    let actuel = 0
    let actif = -1
    let image = null
    let debut = 0
    let course = 1
    let rayon = 0

    // Les dimensions ne sont lues qu'au chargement et au redimensionnement, jamais pendant le défilement
    const dimensionner = () => {
      debut = section.getBoundingClientRect().top + window.scrollY
      course = Math.max(1, section.offsetHeight - window.innerHeight)
      rayon = roue.offsetHeight * 0.36
    }

    const mesurer = () => {
      const p = Math.min(1, Math.max(0, (window.scrollY - debut) / course))
      cible = Math.min(dernier, cran(p * (dernier + 0.6), pause))
    }

    const dessiner = () => {
      actuel += (cible - actuel) * inertie
      if (Math.abs(cible - actuel) < 0.001) actuel = cible
      // Sens inverse des aiguilles d'une montre quand on descend
      disque.style.transform = `rotate(${-actuel * 45}deg)`
      // Sélecteur imité en 2D : chaque spécialité glisse sur un cercle et s'aplatit vers les bords
      items.forEach((li, i) => {
        const radians = ((i - actuel) * PAS_SELECTEUR * Math.PI) / 180
        const proximite = Math.max(0, Math.cos(radians))
        li.style.transform = `translateY(${Math.sin(radians) * rayon}px) scaleY(${proximite.toFixed(3)})`
        li.style.opacity = Math.abs(i - actuel) * PAS_SELECTEUR > 75 ? 0 : 0.2 + 0.8 * proximite ** 8
      })
      const proche = Math.round(actuel)
      if (proche !== actif) {
        items[actif]?.classList.remove('selecteur__actif')
        items[proche].classList.add('selecteur__actif')
        roue.style.setProperty('--bande', BANDES[proche % BANDES.length])
        roue.classList.toggle('selecteur--sombre', proche % BANDES.length === 2)
        actif = proche
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
    // La page peut changer de hauteur au-dessus de la rubrique (polices, photos qui se chargent)
    const observateur = new ResizeObserver(auRedimensionnement)
    observateur.observe(document.body)
    return () => {
      observateur.disconnect()
      window.removeEventListener('scroll', auDefilement)
      window.removeEventListener('resize', auRedimensionnement)
      if (image) cancelAnimationFrame(image)
    }
  }, [anime, specialites])

  return (
    <section
      id="methode"
      className={`methode ${anime ? 'methode--animee' : ''}`}
      style={anime ? { height: `${75 * specialites.length + 5}vh` } : undefined}
      ref={sectionRef}
      aria-labelledby="methode-titre"
    >
      <div className="methode__ecran">
        <div className="methode__disque-zone">
          {/* Disque de fonte : rebord, face, poignées évidées, manchon */}
          <svg className="methode__disque" viewBox="-100 -100 200 200" aria-hidden="true">
            <circle r="99" className="disque__rebord" />
            <circle r="94" className="disque__face" />
            <circle r="79" className="disque__lisere" />
            {POIGNEES.map((a) => (
              <path key={a} d={arc(61, a - 24, a + 24)} className="disque__poignee" />
            ))}
            <circle r="31" className="disque__moyeu" />
            <circle r="22" className="disque__manchon" />
            <circle r="12" className="disque__trou" />
          </svg>
          <ul className="methode__phrases">
            {phrases.map((phrase, i) => (
              <li key={phrase} style={{ '--a': `${ANGLES[i % ANGLES.length]}deg` }}>
                {phrase}
              </li>
            ))}
          </ul>
        </div>
        <div className="methode__droite">
          <h2 id="methode-titre" className="titre titre--accueil">ma méthode</h2>
          <div className="selecteur">
            <ul>
              {specialites.map((specialite) => (
                <li key={specialite} className="titre">{specialite}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
