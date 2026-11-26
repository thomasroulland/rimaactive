import { useEffect, useState } from 'react'
import { ecouterMesMesures, majProfilSportif } from '../depots.js'
import { CHIFFRES, chiffresChoisis } from '../donnees/chiffres.js'
import { exercicesDe } from '../donnees/seances.js'
import { messageErreur } from '../erreurs.js'
import CarteChiffres from '../client/CarteChiffres.jsx'

const PLACES = ['En grand', 'En bas à gauche', 'En bas à droite']

// Fiche du coaché : Marie choisit les 3 chiffres en haut de « Ma progression » (26 novembre 2026), avec l'aperçu de la carte.
export default function ChoixChiffres({ uid, client, majClient, programme, programmes, faites, seances }) {
  const enregistres = chiffresChoisis(client)
  const [cles, setCles] = useState(enregistres)
  const [mesures, setMesures] = useState([])
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  useEffect(() => ecouterMesMesures(uid, setMesures, () => setMesures([])), [uid])

  const { noms } = exercicesDe(programmes ?? [])
  const exos = [...noms.entries()].sort((a, b) => a[1].localeCompare(b[1], 'fr'))
  const change = cles.join() !== enregistres.join()
  const choisir = (i, v) => { setCles(cles.map((c, j) => (j === i ? v : c))); setMessage('') }

  async function enregistrer(e) {
    e.preventDefault()
    if (new Set(cles).size < 3) { setErreur('Choisissez trois chiffres différents.'); return }
    setEnvoi(true); setErreur(''); setMessage('')
    try {
      await majProfilSportif(uid, { chiffresProgression: cles })
      majClient({ chiffresProgression: cles })
      setMessage(`Enregistré : ${client.prenom} voit ces chiffres.`)
    } catch (err) { setErreur(messageErreur(err.code)) }
    setEnvoi(false)
  }

  return (
    <section className="espace-carte fiche-carte choix-chiffres" aria-labelledby="fiche-chiffres">
      <h2 id="fiche-chiffres" className="fiche-carte__titre">Ce que voit {client.prenom} dans « Ma progression »</h2>
      <form className="choix-chiffres__form" onSubmit={enregistrer}>
        {PLACES.map((place, i) => (
          <div key={place} className="champ-groupe">
            <label htmlFor={`chiffre-${i}`}>{place}</label>
            <select id={`chiffre-${i}`} className="champ" value={cles[i]} onChange={(e) => choisir(i, e.target.value)}>
              {CHIFFRES.map(([k, nom]) => <option key={k} value={k}>{k === 'progres' ? 'Progrès de charge (le meilleur)' : nom}</option>)}
              {exos.length > 0 && (
                <optgroup label="Progrès sur un exercice">
                  {exos.map(([id, nom]) => <option key={id} value={`progres:${id}`}>Progrès au {nom.toLowerCase()}</option>)}
                </optgroup>
              )}
            </select>
          </div>
        ))}
        <div className="choix-chiffres__apercu">
          <p className="espace-aide">Aperçu</p>
          <CarteChiffres cles={cles} ctx={{ programme, programmes, faites, seances, mesures }} etiquette="Mon programme" />
        </div>
        <button type="submit" className="bouton bouton--secondaire bouton--compact" disabled={envoi || !change}>{envoi ? 'Enregistrement…' : 'Enregistrer'}</button>
      </form>
      <p className="espace-message" role="status">{message}</p>
      <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>
    </section>
  )
}
