import { useState } from 'react'
import { Link } from 'react-router-dom'
import { seDeconnecter } from './firebase.js'
import { donnerAccord } from './depots.js'
import { messageErreur } from './erreurs.js'

// Écran d'accord affiché au premier accès du client (texte à faire valider par Marie)
export default function Accord({ uid, prenom }) {
  const [coche, setCoche] = useState(false)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')

  async function valider(event) {
    event.preventDefault()
    if (!coche) return
    setEnvoi(true); setErreur('')
    try {
      await donnerAccord(uid)
    } catch (e) {
      setErreur(messageErreur(e.code))
      setEnvoi(false)
    }
  }

  return (
    <section className="section espace-connexion">
      <div className="conteneur">
        <div className="espace-carte espace-connexion__carte">
          <h1 className="titre titre--tuile">{prenom ? `Bienvenue, ${prenom}` : 'Bienvenue'}</h1>
          <p className="espace-texte">
            Pour suivre votre programme, Marie enregistre vos mesures, vos séances et, si vous le souhaitez, vos photos.
            Ces informations liées à votre santé et à votre pratique ne sont visibles que par vous et par Marie.
            Vous pouvez en demander la suppression à tout moment.
          </p>
          <form className="espace-formulaire" onSubmit={valider} noValidate>
            <label className="espace-case">
              <input type="checkbox" checked={coche} onChange={(e) => setCoche(e.target.checked)} aria-describedby="accord-erreur" />
              <span>J’accepte que mes mesures, mes séances et mes photos soient enregistrées pour le suivi de mon coaching.</span>
            </label>
            <p className="espace-texte">
              <Link to="/mentions-legales#confidentialite" className="espace-lien-texte" target="_blank" rel="noopener">Lire la politique de confidentialité</Link>
            </p>
            <p id="accord-erreur" className="espace-message espace-message--erreur" role="alert">{erreur}</p>
            <button type="submit" className="bouton bouton--principal" disabled={!coche || envoi}>
              {envoi ? 'Enregistrement…' : 'Accéder à mon espace'}
            </button>
            <button type="button" className="espace-lien" onClick={seDeconnecter}>Se déconnecter</button>
          </form>
        </div>
      </div>
    </section>
  )
}
