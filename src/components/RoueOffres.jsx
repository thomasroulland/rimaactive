import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Tuile } from './Blocs.jsx'
import { cran } from './cran.js'

// Les trois poignées évidées du disque, centrées sur ces angles (en degrés)
const POIGNEES = [-90, 30, 150]

// Arc de cercle de rayon r, de a1 à a2 degrés (sens des aiguilles d'une montre, 0° à droite)
function arc(r, a1, a2) {
  const point = (a) => `${(r * Math.cos((a * Math.PI) / 180)).toFixed(2)} ${(r * Math.sin((a * Math.PI) / 180)).toFixed(2)}`
  return `M ${point(a1)} A ${r} ${r} 0 0 1 ${point(a2)}`
}

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
          {/* Disque de fonte : rebord, face, poignées évidées, manchon */}
          <svg className="cadran__disque" viewBox="-100 -100 200 200" aria-hidden="true">
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
