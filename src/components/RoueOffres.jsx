import { useEffect, useRef, useState } from 'react'
import { Tuile } from './Blocs.jsx'
import { cran } from './cran.js'

// Les trois poignées évidées du disque, centrées sur ces angles (en degrés)
const POIGNEES = [-90, 30, 150]

// Arc de cercle de rayon r, de a1 à a2 degrés (sens des aiguilles d'une montre, 0° à droite)
function arc(r, a1, a2) {
  const point = (a) => `${(r * Math.cos((a * Math.PI) / 180)).toFixed(2)} ${(r * Math.sin((a * Math.PI) / 180)).toFixed(2)}`
  return `M ${point(a1)} A ${r} ${r} 0 0 1 ${point(a2)}`
}

// Rubrique « ma méthode » : un disque de fonte avec les trois piliers sur son bord.
// Au défilement, il tourne dans le sens inverse des aiguilles d'une montre et amène chaque pilier
// en face, bien droit, avec sa description au-dessus.
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
    const fiches = section.querySelector('.cadran__fiches')
    const texte = section.querySelector('.roue-offres__texte')
    const noms = [...section.querySelectorAll('.cadran__nom')]
    const dernier = bras.length - 1
    const colonnes = window.matchMedia('(min-width: 900px)')
    const tactile = window.matchMedia('(pointer: coarse)').matches
    const inertie = tactile ? 0.3 : 0.12
    const pause = tactile ? 0.25 : 0.5
    let pas = 50 // écart entre deux offres sur le cadran, en degrés
    let echelleMin = 0.36 // taille des offres qui ne sont pas de face, par rapport à celle de face
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
      zone.classList.toggle('cadran--etroit', etroit)
      let rayon, cx
      if (etroit) {
        pas = 36
        echelleMin = 0.55
        rayon = Math.min(130, hauteur * 0.34)
        cx = largeur - 16 - 240 - 28 - rayon // place pour le nom de face, le plus long fait ~240 px
      } else {
        pas = 45
        echelleMin = 0.36
        if (colonnes.matches) {
          // Comme en haut de page : texte à gauche, le disque et ses noms calés sur le bord droit du contenu
          rayon = Math.min(hauteur * 0.36, 210)
          const gouttiere = parseFloat(getComputedStyle(texte).paddingLeft)
          const nomMax = Math.max(...noms.map((n) => n.offsetWidth))
          cx = largeur - gouttiere - nomMax - 28 - rayon
        } else {
          rayon = Math.min(hauteur * 0.36, largeur * 0.5)
          cx = largeur - Math.min(largeur * 0.62, 760) - rayon
        }
      }
      const cy = hauteur / 2
      zone.style.setProperty('--cx', `${cx}px`)
      zone.style.setProperty('--cy', `${cy}px`)
      zone.style.setProperty('--rayon', `${rayon}px`)
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
        // Le nom reste droit pendant que son bras tourne, pour rester lisible
        b.style.setProperty('--redresse', `${-ecart * pas}deg`)
        // Toutes les offres restent visibles ; celle de face est en grand, les autres en petit
        const face = Math.max(0, 1 - Math.abs(ecart))
        b.style.setProperty('--echelle', (echelleMin + (1 - echelleMin) * face).toFixed(3))
        b.style.opacity = (0.6 + 0.4 * face).toFixed(3)
      })
      // La description suit l'offre de face ; elle s'efface pendant que le cadran tourne
      const proche = Math.round(actuel)
      fiches.style.opacity = Math.max(0, 1 - Math.abs(actuel - proche) * 4)
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


    dimensionner()
    mesurer()
    actuel = cible
    dessiner()
    window.addEventListener('scroll', auDefilement, { passive: true })
    window.addEventListener('resize', auRedimensionnement)
    const observateur = new ResizeObserver(auRedimensionnement)
    observateur.observe(document.body)
    observateur.observe(zone)
    return () => {
      observateur.disconnect()
      window.removeEventListener('scroll', auDefilement)
      window.removeEventListener('resize', auRedimensionnement)
      if (image) cancelAnimationFrame(image)
    }
  }, [anime, offres])

  const entete = (
    <div className="roue-offres__texte">
      <h2 id="methode-titre" className="titre titre--accueil">ma méthode</h2>
    </div>
  )

  if (!anime) {
    return (
      <section id="methode" className="section" aria-labelledby="methode-titre">
        <div className="conteneur">
          <div className="entete-section entete-section--deux">{entete}</div>
          <div className="tuiles">
            {offres.map((offre) => (
              <Tuile key={offre.titre} titre={offre.titre}>
                <p className="ligne-fine ligne-fine--fiche">{offre.texte}</p>
              </Tuile>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="methode" className="roue-offres" ref={sectionRef} aria-labelledby="methode-titre">
      <div className="roue-offres__ecran">
        <div className="roue-offres__texte">
          <h2 id="methode-titre" className="titre titre--accueil">ma méthode</h2>
          {/* Description du pilier de face. Toutes sont posées au même endroit, une seule est visible :
              la place réservée est celle de la plus longue, rien ne bouge quand on change de pilier. */}
          <div className="cadran__fiches">
            {offres.map((offre, i) => (
              <div key={offre.titre} className={`cadran__fiche ${i === actif ? 'cadran__fiche--active' : ''}`}>
                <p className="ligne-fine ligne-fine--fiche">{offre.texte}</p>
              </div>
            ))}
          </div>
        </div>
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
              <li key={offre.titre} className={`cadran__bras ${i === actif ? 'cadran__bras--actif' : ''}`}>
                <span className="cadran__repere" aria-hidden="true" />
                <span className="cadran__nom titre">{offre.titre}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
