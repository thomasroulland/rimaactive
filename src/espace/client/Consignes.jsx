import { useEffect, useRef, useState } from 'react'
import PhotoStockee from '../coach/PhotoStockee.jsx'
import { lignesExercice } from '../donnees/seances.js'
import { libelleMateriel } from '../donnees/banque.js'

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
  const { prescription, details } = element ? lignesExercice(element, true) : { prescription: '', details: '' }
  const materiel = element?.materiel && element.materiel !== 'À préciser' ? libelleMateriel(element) : ''
  const prevu = [materiel, prescription.replace(' · charge libre', '')].filter(Boolean).join(' · ')
  const reperes = details.split(' · ').filter((d) => d && !d.startsWith('Repos'))
  const aller = (pas) => setPhoto((p) => (p + pas + nb) % nb)

  return (
    <dialog ref={fenetre} className="ec-fenetre ec-fenetre--fiche" aria-labelledby="titre-consignes" onClose={fermer}
      onClick={(e) => { if (e.target === fenetre.current) fenetre.current.close() }}>
      {element && (
        // fiche refaite (Marie, 26 novembre 2026) : la photo en grand en 4:5, puis une carte avec ce qui est prévu,
        // le mot de Marie, les consignes et les muscles, dans le style de la séance
        <div className="ec-fiche">
          <div className="ec-fiche__photo"
            onTouchStart={(e) => { depart.current = e.changedTouches[0]?.clientX ?? null }}
            onTouchEnd={(e) => {
              const x = e.changedTouches[0]?.clientX
              if (depart.current == null || x == null || nb < 2) return
              const dx = x - depart.current
              depart.current = null
              if (Math.abs(dx) >= 40) aller(dx < 0 ? 1 : -1)
            }}>
            {nb > 0
              ? <PhotoStockee key={photos[photo]} chemin={photos[photo]} alt={`${element.nom}, photo ${photo + 1} sur ${nb}`} classe="ec-fiche__img" />
              : <div className="ec-fiche__img ec-fiche__img--vide"><Image /><span>Photos à venir</span></div>}
            <button type="button" className="ec-fiche__fermer" aria-label="Fermer la fiche" onClick={() => fenetre.current?.close()}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
            {nb > 1 && (
              <div role="group" aria-label="Photos de l’exercice" className="ec-fiche__points">
                {photos.map((p, i) => (
                  <button key={p} type="button" aria-pressed={i === photo} aria-label={`Photo ${i + 1}`} onClick={() => setPhoto(i)}><span /></button>
                ))}
              </div>
            )}
          </div>
          <div className="ec-fiche__corps">
            <h2 id="titre-consignes" className="ec-fiche__titre">{element.nom}</h2>
            {prevu && <p className="ec-fiche__prevu">{prevu}</p>}
            {reperes.length > 0 && <p className="ec-fiche__reperes">{reperes.map((r) => <span key={r}>{r}</span>)}</p>}
            {String(element.commentaire ?? '').trim() && (
              <section className="ec-fiche__carte ec-fiche__carte--mot">
                <h3 className="ec-fiche__lab">Le mot de Marie</h3>
                <p>{element.commentaire}</p>
              </section>
            )}
            {element.consignes && (
              <section className="ec-fiche__carte">
                <h3 className="ec-fiche__lab">Consignes</h3>
                <p>{element.consignes}</p>
              </section>
            )}
            {element.muscles?.length > 0 && (
              <section className="ec-fiche__carte">
                <h3 className="ec-fiche__lab">Muscles</h3>
                <p className="ec-fiche__muscles">{element.muscles.map((m) => <span key={m}>{m}</span>)}</p>
              </section>
            )}
          </div>
        </div>
      )}
    </dialog>
  )
}
