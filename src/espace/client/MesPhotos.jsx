import { useEffect, useId, useState } from 'react'
import { aujourdhuiIso } from '../donnees/calculs.js'
import { dateComplete } from '../donnees/progression.js'
import { ajouterPhoto, ecouterMesPhotos, supprimerPhoto } from '../depots.js'
import { messageErreur } from '../erreurs.js'
import { useUrlAvatar } from './Avatar.jsx'

// Rubrique « Mes photos » : ajout (avec date), comparaison avant / après, galerie par date, suppression avec confirmation.
export default function MesPhotos({ uid }) {
  const idDate = useId()
  const idFichier = useId()
  const [photos, setPhotos] = useState(null)
  const [date, setDate] = useState(aujourdhuiIso())
  const [encours, setEncours] = useState(false)
  const [erreur, setErreur] = useState('')
  const [aSupprimer, setASupprimer] = useState(null)
  const [avant, setAvant] = useState('')
  const [apres, setApres] = useState('')

  useEffect(() => ecouterMesPhotos(uid, setPhotos, () => setErreur('Impossible de charger vos photos. Vérifiez votre connexion.')), [uid])
  const liste = photos ?? []
  const pAvant = liste.find((p) => p.id === avant) ?? liste[0]
  const pApres = liste.find((p) => p.id === apres) ?? liste[liste.length - 1]

  const choisir = async (e) => {
    const fichier = e.target.files?.[0]
    e.target.value = ''
    if (!fichier) return
    setErreur('')
    setEncours(true)
    try {
      await ajouterPhoto(uid, fichier, date || aujourdhuiIso())
    } catch (err) {
      setErreur(messageErreur(err?.code))
    } finally {
      setEncours(false)
    }
  }

  const supprimer = async (photo) => {
    if (aSupprimer !== photo.id) { setASupprimer(photo.id); return }
    setErreur('')
    try {
      await supprimerPhoto(uid, photo)
    } catch (err) {
      setErreur(messageErreur(err?.code))
    }
    setASupprimer(null)
  }

  return (
    <>
      <p className="ec-petit ec-sous-titre">Privées : visibles uniquement par vous et Marie.</p>
      <div className="ec-carte ec-ajout">
        <div className="ec-ajout__date">
          <label className="ec-etiquette" htmlFor={idDate}>Date de la photo</label>
          <input id={idDate} className="ec-champ" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <input id={idFichier} className="ec-fichier" type="file" accept="image/*" onChange={choisir} disabled={encours} />
        <label className="ec-bouton" htmlFor={idFichier} aria-busy={encours}>{encours ? 'Envoi en cours…' : 'Ajouter une photo'}</label>
      </div>
      {erreur && <p className="ec-erreur" role="alert">{erreur}</p>}
      {photos && liste.length === 0 && <p className="ec-texte ec-gris">Aucune photo pour l’instant.</p>}
      {liste.length >= 2 && (
        <div className="ec-carte ec-pile ec-pile--serre">
          <h3 className="ec-h4">Comparer avant / après</h3>
          <div className="ec-comparer">
            <div>
              <label className="ec-etiquette" htmlFor={`${idFichier}-avant`}>Avant</label>
              <select id={`${idFichier}-avant`} className="ec-champ" value={pAvant.id} onChange={(e) => setAvant(e.target.value)}>
                {liste.map((p) => <option key={p.id} value={p.id}>{dateComplete(p.date)}</option>)}
              </select>
            </div>
            <div>
              <label className="ec-etiquette" htmlFor={`${idFichier}-apres`}>Après</label>
              <select id={`${idFichier}-apres`} className="ec-champ" value={pApres.id} onChange={(e) => setApres(e.target.value)}>
                {liste.map((p) => <option key={p.id} value={p.id}>{dateComplete(p.date)}</option>)}
              </select>
            </div>
            <Image photo={pAvant} />
            <Image photo={pApres} />
          </div>
        </div>
      )}
      {(
        <div className="ec-galerie">
          {liste.map((p) => (
            <figure key={p.id} className="ec-carte ec-vignette-photo">
              <Image photo={p} />
              <figcaption>{dateComplete(p.date)}</figcaption>
              <button type="button" className="ec-lien" onClick={() => supprimer(p)}>
                {aSupprimer === p.id ? 'Confirmer la suppression' : 'Supprimer'}
              </button>
            </figure>
          ))}
        </div>
      )}
    </>
  )
}

function Image({ photo }) {
  const url = useUrlAvatar(photo?.chemin)
  return (
    <div
      className="ec-photo"
      role="img"
      aria-label={photo ? `Photo de progression du ${dateComplete(photo.date)}` : ''}
      style={url ? { backgroundImage: `url("${url}")` } : undefined}
    />
  )
}
