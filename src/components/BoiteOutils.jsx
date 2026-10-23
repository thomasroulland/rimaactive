import { useEffect, useRef, useState } from 'react'

// Rubrique « ma boîte à outils » : un carrousel horizontal en boucle. La carte du milieu est nette,
// ses voisines dépassent sur les côtés, floutées. On change de carte avec les flèches, les ronds du bas,
// le clavier (← →) ou en faisant glisser au doigt et à la souris.
// Flèche au trait fin, comme les pictogrammes Phosphor Light de la marque
function FlecheOutils() {
  return (
    <svg aria-hidden="true" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
      <path d="M40 128h176M144 56l72 72-72 72" />
    </svg>
  )
}

export default function BoiteOutils({ formats }) {
  const [actif, setActif] = useState(0)
  const glisse = useRef(null)
  const n = formats.length
  const aller = (i) => setActif(((i % n) + n) % n)

  // Écart d'une carte à la carte active, ramené entre -n/2 et n/2 : c'est ce qui fait boucler le carrousel
  const ecart = (i) => {
    let d = i - actif
    if (d > n / 2) d -= n
    if (d < -n / 2) d += n
    return d
  }

  useEffect(() => {
    const fin = () => { glisse.current = null }
    window.addEventListener('pointerup', fin)
    return () => window.removeEventListener('pointerup', fin)
  }, [])

  const auClavier = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); aller(actif + 1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); aller(actif - 1) }
  }
  const debutGlisse = (e) => { glisse.current = e.clientX }
  const pendantGlisse = (e) => {
    if (glisse.current === null) return
    const d = e.clientX - glisse.current
    if (Math.abs(d) > 60) {
      aller(actif + (d < 0 ? 1 : -1))
      glisse.current = e.clientX
    }
  }

  return (
    <section id="outils" className="outils sur-encre" aria-labelledby="outils-titre">
      <div className="conteneur outils__entete">
        <h2 id="outils-titre" className="titre titre--section">Ma boîte à outils</h2>
      </div>

      <div
        className="outils__piste"
        role="group"
        aria-roledescription="carrousel"
        aria-label="Formats d'entraînement"
        tabIndex={0}
        onKeyDown={auClavier}
        onPointerDown={debutGlisse}
        onPointerMove={pendantGlisse}
      >
        {formats.map((format, i) => {
          const d = ecart(i)
          return (
            <article
              key={format.nom}
              className={`outil ${d === 0 ? 'outil--actif' : ''}`}
              style={{ '--ecart': d, visibility: Math.abs(d) > 2 ? 'hidden' : undefined }}
              aria-hidden={d !== 0}
              onClick={() => d !== 0 && aller(i)}
            >
              <p className="outil__numero">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="titre titre--tuile outil__nom">{format.nom}</h3>
              <p className="outil__texte">{format.texte}</p>
              <ul className="outil__objectifs" aria-label="Objectifs">
                {format.objectifs.map((objectif) => (
                  <li key={objectif}>{objectif}</li>
                ))}
              </ul>
            </article>
          )
        })}
      </div>

      <div className="conteneur outils__commandes">
        <button type="button" className="outils__fleche outils__fleche--precedent" onClick={() => aller(actif - 1)} aria-label="Format précédent">
          <FlecheOutils />
        </button>
        {/* Un rond par format : la page active est pleine, en jaune (pagination en ronds de la marque) */}
        <div className="outils__ronds" role="tablist" aria-label="Choisir un format">
          {formats.map((format, i) => (
            <button key={format.nom} type="button" role="tab" aria-selected={i === actif} aria-label={format.nom}
              className={i === actif ? 'rma-actif' : ''} onClick={() => aller(i)} />
          ))}
        </div>
        <button type="button" className="outils__fleche" onClick={() => aller(actif + 1)} aria-label="Format suivant">
          <FlecheOutils />
        </button>
      </div>
      <p className="visuellement-cache" aria-live="polite">{`${formats[actif].nom}, ${actif + 1} sur ${n}`}</p>
    </section>
  )
}
