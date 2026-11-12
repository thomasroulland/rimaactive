import { useEffect, useId, useRef, useState } from 'react'
import { changerAvatar, urlPhoto } from '../depots.js'
import { initiales } from '../donnees/progression.js'
import { messageErreur } from '../erreurs.js'

// Adresse affichable de la photo de profil (chemin Storage → URL) ; null sans photo ou si elle ne charge pas.
export function useUrlAvatar(chemin) {
  const [etat, setEtat] = useState({ chemin: null, url: null })
  useEffect(() => {
    if (!chemin) return undefined
    let actif = true
    urlPhoto(chemin)
      .then((url) => { if (actif) setEtat({ chemin, url }) })
      .catch(() => { if (actif) setEtat({ chemin, url: null }) })
    return () => { actif = false }
  }, [chemin])
  return chemin && etat.chemin === chemin ? etat.url : null
}

// Rond de 64 px : photo ou initiales, « + » jaune ; un clic ouvre le choix d'une photo.
export default function Avatar({ uid, profil, onErreur }) {
  const id = useId()
  const champ = useRef(null)
  const [encours, setEncours] = useState(false)
  const url = useUrlAvatar(profil?.avatar)
  const aide = profil?.avatar ? 'Changer ma photo de profil' : 'Ajouter ma photo de profil (facultatif)'

  const choisir = async (e) => {
    const fichier = e.target.files?.[0]
    e.target.value = ''
    if (!fichier) return
    onErreur?.('')
    setEncours(true)
    try {
      await changerAvatar(uid, fichier)
    } catch (err) {
      onErreur?.(messageErreur(err?.code))
    } finally {
      setEncours(false)
    }
  }
  return (
    <div className="ec-avatar-bloc">
      <input id={id} ref={champ} className="ec-fichier" type="file" accept="image/*" onChange={choisir} disabled={encours} />
      <label htmlFor={id} className="ec-avatar" title={aide} aria-busy={encours}>
        {url
          ? <span className="ec-avatar__img" style={{ backgroundImage: `url("${url}")` }} />
          : <span className="ec-avatar__initiales">{initiales(profil?.prenom, profil?.nom)}</span>}
        <span className="ec-avatar__plus" aria-hidden="true">+</span>
        <span className="ec-invisible">{aide}</span>
      </label>
    </div>
  )
}
