import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Tuile } from './Blocs.jsx'
import { cran } from './cran.js'

const GRADUATIONS = Array.from({ length: 72 }, (_, i) => i * 5) // un trait tous les 5°

// Rubrique des offres : un cadran à gauche, tracé au trait, avec le nom des offres sur son bord.
// Au défilement, il tourne dans le sens inverse des aiguilles d'une montre et amène chaque offre
// en face, bien droite, avec sa description dessous.
// Sans JavaScript ou avec « réduire les animations » : une simple rangée de tuiles.
export default function RoueOffres({ offres }) {
  const sectionRef = useRef(null)
  // Site rendu uniquement dans le navigateur : on peut décider dès le premier rendu
  const [anime] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [actif, setActif] = useState(0)

  useEffect(() => {
    if (!anime) return
    const section = sectionRef.current
    const zone = section.querySelector('.cadran')
    const disque = section.querySelector('.cadran__disque')
    const bras = [...section.querySelectorAll('.cadran__bras')]
    const fiche = section.querySelector('.cadran__fiches')
    const dernier = bras.length - 1
    const tactile = window.matchMedia('(pointer: coarse)').matches
    const inertie = tactile ? 0.3 : 0.12
    const pause = tactile ? 0.25 : 0.5
    const pas = 68 // écart entre deux offres sur le cadran, en degrés : assez pour que la suivante ne passe pas sur la description
    let cible = 0
    let actuel = 0
    let image = null
    let debut = 0
    let course = 1
    let indexActif = -1

    // Géométrie, lue seulement au chargement et au redimensionnement
    const dimensionner = () => {
      debut = section.getBoundingClientRect().top + window.scrollY
      course = Math.max(1, section.offsetHeight - window.innerHeight)
      const largeur = zone.clientWidth
      const hauteur = zone.clientHeight
      const etroit = largeur < 700
      const rayon = Math.min(hauteur * 0.44, largeur * 0.5)
      // Place laissée à droite du cadran pour le nom de l'offre et sa description
      const reserve = etroit ? largeur * 0.74 : Math.min(largeur * 0.62, 760)
      const cx = largeur - reserve - rayon
      const cy = hauteur / 2
      zone.style.setProperty('--cx', `${cx}px`)
      zone.style.setProperty('--cy', `${cy}px`)
      zone.style.setProperty('--rayon', `${rayon}px`)
      zone.style.setProperty('--largeur-fiche', `${Math.min(440, largeur - (cx + rayon + 24) - 16)}px`)
    }

    const mesurer = () => {
      const p = Math.min(1, Math.max(0, (window.scrollY - debut) / course))
      cible = Math.min(dernier, cran(p * (dernier + 0.6), pause))
    }

    const dessiner = () => {
      actuel += (cible - actuel) * inertie
      if (Math.abs(cible - actuel) < 0.001) actuel = cible
      // Angle qui diminue quand on descend : sens inverse des aiguilles d'une montre
      disque.style.transform = `rotate(${-actuel * pas}deg)`
      bras.forEach((b, i) => {
        const ecart = i - actuel
        b.style.transform = `rotate(${ecart * pas}deg)`
        // Les voisines n'apparaissent que pendant que le cadran tourne
        b.style.opacity = Math.max(0, 1 - Math.abs(ecart) * 1.1)
      })
      // La description suit l'offre de face ; elle s'efface pendant que le cadran tourne
      const proche = Math.round(actuel)
      fiche.style.opacity = Math.max(0, 1 - Math.abs(actuel - proche) * 4)
      if (proche !== indexActif) {
        indexActif = proche
        setActif(proche)
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

    // Au clavier : une offre qui reçoit le focus est amenée en face
    const auFocus = (e) => {
      const i = bras.findIndex((b) => b.contains(e.target))
      if (i < 0 || Math.round(actuel) === i) return
      window.scrollTo({ top: debut + (course * i) / (dernier + 0.6) })
    }

    dimensionner()
    mesurer()
    actuel = cible
    dessiner()
    window.addEventListener('scroll', auDefilement, { passive: true })
    window.addEventListener('resize', auRedimensionnement)
    zone.addEventListener('focusin', auFocus)
    const observateur = new ResizeObserver(auRedimensionnement)
    observateur.observe(document.body)
    return () => {
      observateur.disconnect()
      window.removeEventListener('scroll', auDefilement)
      window.removeEventListener('resize', auRedimensionnement)
      zone.removeEventListener('focusin', auFocus)
      if (image) cancelAnimationFrame(image)
    }
  }, [anime, offres])

  const entete = (
    <div className="roue-offres__texte">
      <h2 id="offres-titre" className="titre titre--section">mes offres</h2>
      <p className="texte">Choisissez votre cas : chaque page détaille le format, le lieu et l'organisation.</p>
    </div>
  )

  if (!anime) {
    return (
      <section id="offres" className="section" aria-labelledby="offres-titre">
        <div className="conteneur">
          <div className="entete-section entete-section--deux">{entete}</div>
          <div className="tuiles">
            {offres.map((offre) => (
              <Tuile key={offre.to} titre={offre.titre} to={offre.to}>
                <p className="texte">{offre.texte}</p>
              </Tuile>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="offres" className="roue-offres" ref={sectionRef} aria-labelledby="offres-titre">
      <div className="roue-offres__ecran">
        {entete}
        <div className="cadran">
          <svg className="cadran__disque" viewBox="-100 -100 200 200" aria-hidden="true">
            <circle r="99" className="cadran__cercle" />
            <circle r="72" className="cadran__cercle cadran__cercle--fin" />
            {GRADUATIONS.map((a) => (
              <line
                key={a}
                x1={a % 30 === 0 ? 86 : 92}
                x2="99"
                transform={`rotate(${a})`}
                className={a % 30 === 0 ? 'cadran__trait cadran__trait--fort' : 'cadran__trait'}
              />
            ))}
            <circle r="9" className="cadran__moyeu" />
          </svg>
          <ul className="cadran__offres">
            {offres.map((offre, i) => (
              <li key={offre.to} className={`cadran__bras ${i === actif ? 'cadran__bras--actif' : ''}`}>
                <span className="cadran__repere" aria-hidden="true" />
                <Link to={offre.to} className="cadran__nom titre">{offre.titre}</Link>
              </li>
            ))}
          </ul>
          <div className="cadran__fiches" aria-live="polite">
            <p className="texte">{offres[actif].texte}</p>
            <Link to={offres[actif].to} className="bouton bouton--secondaire">Découvrir l'offre</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
