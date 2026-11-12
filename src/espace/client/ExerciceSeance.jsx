import { useRef } from 'react'
import PhotoStockee from '../coach/PhotoStockee.jsx'
import { prescription } from '../donnees/seances.js'
import LigneSerie from './LigneSerie.jsx'

// Un exercice de la séance : photo (ouvre la fiche), ce que Marie a prévu, puis les séries à noter.
// `element` null : exercice retiré du programme par Marie, ses séries déjà notées restent affichées (lecture seule).
export default function ExerciceSeance({ element, code, enSeries, lignes, changer, verrou }) {
  const fiche = useRef(null)
  const lecture = verrou || !element
  const id = element ? `ex-${element.id}` : `ex-retire-${code}`

  // modifier une valeur coche la série « Fait »
  const majLigne = (i, cle, v) => changer(lignes.map((l, j) => (j === i ? { ...l, [cle]: v, ...(cle === 'fait' ? {} : { fait: true }) } : l)))
  const ajouter = () => changer([...lignes, { ...(lignes[lignes.length - 1] ?? { charge: '', reps: '' }), rpe: '', fait: false }])
  const retirer = () => changer(lignes.slice(0, -1))

  return (
    <li className="espace-carte client-exo" aria-labelledby={`${id}-nom`}>
      {element ? (
        <div className="client-exo__tete">
          <div className="client-exo__nom">
            <span className="espace-element__code" aria-hidden="true">{code}</span>
            <h3 id={`${id}-nom`} className="espace-element__titre"><span className="sr-only">{code} : </span>{element.nom}</h3>
            {prescription(element, enSeries) && <p className="client-exo__prevu">{prescription(element, enSeries)}</p>}
            {element.muscles?.length > 0 && <p className="espace-element__muscles">{element.muscles.join(', ')}</p>}
          </div>
          <button type="button" className="client-exo__photo" onClick={() => fiche.current?.showModal()}>
            <PhotoStockee chemin={element.photos?.[0]} alt="" classe="client-exo__vignette" vide="Sans photo" />
            <span className="client-exo__photo-lien">Photos et consignes<span className="sr-only"> : {element.nom}</span></span>
          </button>
        </div>
      ) : (
        <div className="client-exo__nom">
          <h3 id={`${id}-nom`} className="espace-element__titre">Exercice retiré du programme</h3>
          <p className="espace-aide">Marie a retiré cet exercice de la séance. Les séries que vous aviez notées restent enregistrées.</p>
        </div>
      )}

      {element?.commentaire && <p className="client-exo__commentaire">{element.commentaire}</p>}

      <div className="client-series" role="group" aria-label={`Séries${element ? ` : ${element.nom}` : ' notées'}`}>
        <div className="client-serie client-serie--entete" aria-hidden="true">
          <span>Série</span><span>Reps</span><span>Charge (kg)</span><span>RPE</span><span>Fait</span>
        </div>
        {lignes.map((l, i) => (
          <LigneSerie key={i} id={`${id}-s${i}`} numero={i + 1} ligne={l} lecture={lecture} changer={(cle, v) => majLigne(i, cle, v)} />
        ))}
      </div>
      {!lecture && (
        <div className="client-exo__actions">
          <button type="button" className="espace-lien" onClick={ajouter}>Ajouter une série</button>
          {lignes.length > 1 && <button type="button" className="espace-lien" onClick={retirer}>Retirer la dernière série</button>}
        </div>
      )}

      {element && (
        <dialog ref={fiche} className="espace-dialogue client-fiche" aria-labelledby={`${id}-fiche`}>
          <div className="client-fiche__tete">
            <h2 id={`${id}-fiche`} className="client-sous-titre">{element.nom}</h2>
            <button type="button" className="bouton bouton--secondaire bouton--compact" onClick={() => fiche.current?.close()}>Fermer</button>
          </div>
          {element.photos?.length > 0 && (
            <ul className="client-fiche__photos" aria-label="Photos de l’exercice">
              {element.photos.map((p, i) => (
                <li key={p}><PhotoStockee chemin={p} alt={`${element.nom}, photo ${i + 1} sur ${element.photos.length}`} classe="client-fiche__photo" /></li>
              ))}
            </ul>
          )}
          {element.muscles?.length > 0 && (
            <div className="client-pile client-pile--serre">
              <h3 className="client-fiche__intertitre">Muscles sollicités</h3>
              <p className="espace-texte">{element.muscles.join(', ')}</p>
            </div>
          )}
          {element.consignes && (
            <div className="client-pile client-pile--serre">
              <h3 className="client-fiche__intertitre">Consignes d’exécution</h3>
              <p className="espace-texte client-fiche__consignes">{element.consignes}</p>
            </div>
          )}
        </dialog>
      )}
    </li>
  )
}
