import { useEffect, useRef } from 'react'
import { Tuile } from './Blocs.jsx'
import { cran } from './cran.js'

// Rubrique des offres : les offres sont posées sur le bord d'un grand disque de fonte, à gauche.
// Au défilement, le disque tourne dans le sens inverse des aiguilles d'une montre et amène chaque
// offre devant, bien droite. Sans JavaScript ou avec « réduire les animations » : une simple rangée de tuiles.
export default function RoueOffres({ offres }) {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const zone = section.querySelector('.roue-offres__zone')
    const disque = section.querySelector('.roue-offres__disque')
    const cartes = [...disque.children]
    const dernier = cartes.length - 1
    const tactile = window.matchMedia('(pointer: coarse)').matches
    const inertie = tactile ? 0.3 : 0.12
    const pause = tactile ? 0.25 : 0.5
    let cible = 0
    let actuel = 0
    let image = null
    let debut = 0
    let course = 1
    let pas = 50 // écart entre deux offres sur le disque, en degrés

    section.classList.add('roue-offres--animee')

    // Géométrie, lue seulement au chargement et au redimensionnement
    const dimensionner = () => {
      debut = section.getBoundingClientRect().top + window.scrollY
      course = Math.max(1, section.offsetHeight - window.innerHeight)
      const largeur = zone.clientWidth
      const hauteur = zone.clientHeight
      const largeurCarte = cartes[0].offsetWidth
      const hauteurCarte = Math.max(...cartes.map((c) => c.offsetHeight))
      const rayon = Math.max(hauteur * 0.62, largeurCarte * 1.25) // rayon du disque
      const rayonCartes = rayon * 0.9 // les offres sont à cheval sur le bord du disque
      // Le centre est placé pour que l'offre de face finisse juste avant le bord droit de la zone
      const cx = largeur - 12 - largeurCarte / 2 - rayonCartes
      const cy = hauteur / 2
      // Écart calculé au bord intérieur des cartes, là où elles sont le plus serrées, pour qu'elles ne se chevauchent pas
      pas = (((hauteurCarte + 32) / (rayonCartes - largeurCarte / 2)) * 180) / Math.PI
      Object.assign(disque.style, {
        width: `${rayon * 2}px`,
        height: `${rayon * 2}px`,
        left: `${cx - rayon}px`,
        top: `${cy - rayon}px`,
      })
      cartes.forEach((carte, i) => {
        carte.style.left = `${rayon - largeurCarte / 2}px`
        carte.style.top = `${rayon - carte.offsetHeight / 2}px`
        carte.style.transform = `rotate(${i * pas}deg) translateX(${rayonCartes}px)`
      })
    }

    const mesurer = () => {
      const p = Math.min(1, Math.max(0, (window.scrollY - debut) / course))
      cible = Math.min(dernier, cran(p * (dernier + 0.6), pause))
    }

    const dessiner = () => {
      actuel += (cible - actuel) * inertie
      if (Math.abs(cible - actuel) < 0.001) actuel = cible
      // Angle négatif : sens inverse des aiguilles d'une montre
      disque.style.transform = `rotate(${-actuel * pas}deg)`
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

    // Au clavier : quand une offre reçoit le focus, on fait défiler jusqu'à elle pour qu'elle passe devant
    const auFocus = (e) => {
      const i = cartes.findIndex((c) => c.contains(e.target))
      if (i < 0 || Math.round(actuel) === i) return
      window.scrollTo({ top: debut + (course * i) / (dernier + 0.6) })
    }

    dimensionner()
    mesurer()
    actuel = cible
    dessiner()
    window.addEventListener('scroll', auDefilement, { passive: true })
    window.addEventListener('resize', auRedimensionnement)
    disque.addEventListener('focusin', auFocus)
    const observateur = new ResizeObserver(auRedimensionnement)
    observateur.observe(document.body)
    return () => {
      observateur.disconnect()
      window.removeEventListener('scroll', auDefilement)
      window.removeEventListener('resize', auRedimensionnement)
      disque.removeEventListener('focusin', auFocus)
      if (image) cancelAnimationFrame(image)
      section.classList.remove('roue-offres--animee')
      disque.removeAttribute('style')
      cartes.forEach((carte) => carte.removeAttribute('style'))
    }
  }, [offres])

  return (
    <section id="offres" className="roue-offres" ref={sectionRef} aria-labelledby="offres-titre">
      <div className="roue-offres__ecran">
        <div className="roue-offres__texte">
          <h2 id="offres-titre" className="titre titre--section">mes offres</h2>
          <p className="texte">Choisissez votre cas : chaque page détaille le format, le lieu et l'organisation.</p>
        </div>
        <div className="roue-offres__zone">
          <div className="tuiles roue-offres__disque">
            {offres.map((offre) => (
              <Tuile key={offre.to} titre={offre.titre} to={offre.to}>
                <p className="texte">{offre.texte}</p>
              </Tuile>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
