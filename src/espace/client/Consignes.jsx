import { useEffect, useRef, useState } from 'react'
import PhotoStockee from '../coach/PhotoStockee.jsx'

const Image = () => (
  <svg width="48" height="48" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="32" y="56" width="192" height="152" rx="12" /><circle cx="96" cy="112" r="16" /><path d="M32 176l56-56 104 88M152 144l32-32 40 40" />
  </svg>
)

// Fenêtre « Consignes » d'un exercice (maquette) : photos à faire défiler, muscles sollicités, consignes d'exécution.
// `element` null : fenêtre fermée. Ouverte en <dialog> modale (Échap et clic à côté la ferment).
export default function Consignes({ element, fermer }) {
  const fenetre = useRef(null)
  const [photo, setPhoto] = useState(0)
  const depart = useRef(null)

  useEffect(() => {
    const d = fenetre.current
    if (!d) return
    if (element && !d.open) { setPhoto(0); d.showModal() }
    if (!element && d.open) d.close()
  }, [element])

  const photos = element?.photos ?? []
  const nb = photos.length
  const aller = (pas) => setPhoto((p) => (p + pas + nb) % nb)

  return (
    <dialog ref={fenetre} className="ec-fenetre" aria-labelledby="titre-consignes" onClose={fermer}
      onClick={(e) => { if (e.target === fenetre.current) fenetre.current.close() }}>
      {element && (
        <div className="ec-fenetre__corps">
          <div className="ec-fenetre__tete">
            <h2 id="titre-consignes" className="ec-fenetre__titre">{element.nom}</h2>
            <button type="button" className="ec-choix" aria-label="Fermer la fiche" onClick={() => fenetre.current?.close()}>Fermer</button>
          </div>

          <div className="ec-fenetre__photos"
            onTouchStart={(e) => { depart.current = e.changedTouches[0]?.clientX ?? null }}
            onTouchEnd={(e) => {
              const x = e.changedTouches[0]?.clientX
              if (depart.current == null || x == null || nb < 2) return
              const dx = x - depart.current
              depart.current = null
              if (Math.abs(dx) >= 40) aller(dx < 0 ? 1 : -1)
            }}>
            {nb > 0
              ? <PhotoStockee key={photos[photo]} chemin={photos[photo]} alt={`${element.nom}, photo ${photo + 1} sur ${nb}`} classe="ec-fenetre__photo" />
              : <div className="ec-fenetre__photo ec-fenetre__photo--vide"><Image /><span>Pas encore de photo pour cet exercice.</span></div>}
            {nb > 1 && (
              <div role="group" aria-label="Photos de l’exercice" className="ec-points">
                {photos.map((p, i) => (
                  <button key={p} type="button" className="ec-point" aria-pressed={i === photo} aria-label={`Photo ${i + 1}`} onClick={() => setPhoto(i)}>
                    <span />
                  </button>
                ))}
              </div>
            )}
          </div>

          {element.muscles?.length > 0 && (
            <div className="ec-fenetre__part">
              <h3 className="ec-fenetre__intertitre">Muscles sollicités</h3>
              <p className="ec-texte">{element.muscles.join(', ')}</p>
            </div>
          )}
          {element.consignes && (
            <div className="ec-fenetre__part">
              <h3 className="ec-fenetre__intertitre">Consignes d’exécution</h3>
              <p className="ec-texte ec-fenetre__consignes">{element.consignes}</p>
            </div>
          )}
        </div>
      )}
    </dialog>
  )
}
