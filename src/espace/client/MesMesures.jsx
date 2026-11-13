import { useEffect, useId, useState } from 'react'
import { aujourdhuiIso } from '../donnees/calculs.js'
import { dateComplete, evolutionMesures, nettoyerMesures } from '../donnees/progression.js'
import { fr } from '../donnees/seances.js'
import { ajouterMesure, ecouterMesMesures, supprimerMesure } from '../depots.js'
import { messageErreur } from '../erreurs.js'
import { SqTableau } from './Squelette.jsx'

const CHAMPS = [
  ['poids', 'Poids (kg)'], ['taille', 'Tour de taille (cm)'], ['hanches', 'Tour de hanches (cm)'],
  ['poitrine', 'Tour de poitrine (cm)'], ['bras', 'Tour de bras (cm)'], ['cuisse', 'Tour de cuisse (cm)'],
]
const vide = () => ({ date: aujourdhuiIso(), poids: '', taille: '', hanches: '', poitrine: '', bras: '', cuisse: '' })
const valeur = (v, unite = '') => (typeof v === 'number' ? `${fr(v)}${unite}` : '–')

// Rubrique « Mon poids et mes mensurations » : formulaire, évolution depuis le début, historique avec suppression.
export default function MesMesures({ uid }) {
  const id = useId()
  const [mesures, setMesures] = useState(null)
  const [saisie, setSaisie] = useState(vide)
  const [message, setMessage] = useState({ texte: '', erreur: false })
  const [aSupprimer, setASupprimer] = useState(null)

  useEffect(() => ecouterMesMesures(uid, setMesures, () => setMessage({ texte: 'Impossible de charger vos mesures. Vérifiez votre connexion.', erreur: true })), [uid])
  const liste = mesures ?? []

  const changer = (champ) => (e) => { setSaisie((s) => ({ ...s, [champ]: e.target.value })); setMessage({ texte: '', erreur: false }) }

  // Sans attendre le serveur (le cache hors ligne applique l'écriture tout de suite) ; un vrai refus s'affiche via .catch.
  const enregistrer = (e) => {
    e.preventDefault()
    const r = nettoyerMesures({ ...saisie, date: saisie.date || aujourdhuiIso() })
    if (!r.ok) { setMessage({ texte: r.erreur, erreur: true }); return }
    ajouterMesure(uid, r.mesure).catch((err) => setMessage({ texte: messageErreur(err?.code), erreur: true }))
    setSaisie(vide())
    setMessage({ texte: navigator.onLine === false ? 'Enregistré sur votre téléphone, envoyé au retour du réseau.' : 'Mesures enregistrées.', erreur: false })
  }

  const supprimer = (m) => {
    if (aSupprimer !== m.id) { setASupprimer(m.id); return }
    setASupprimer(null)
    supprimerMesure(uid, m.id).catch((err) => setMessage({ texte: messageErreur(err?.code), erreur: true }))
  }

  return (
    <>
      <p className="ec-petit ec-sous-titre">Privés : visibles uniquement par vous et Marie. Prenez vos mesures le matin, au même endroit, avec un mètre ruban.</p>
      {liste.length > 0 && <p className="ec-texte ec-gras">{evolutionMesures(liste)}</p>}
      <form className="ec-carte ec-pile ec-pile--serre" onSubmit={enregistrer} noValidate>
        <h3 className="ec-h4">Ajouter mes mesures</h3>
        <div className="ec-mesures-champs">
          <div>
            <label className="ec-etiquette" htmlFor={`${id}-date`}>Date</label>
            <input id={`${id}-date`} className="ec-champ" type="date" value={saisie.date} onChange={changer('date')} />
          </div>
          {CHAMPS.map(([champ, libelle]) => (
            <div key={champ}>
              <label className="ec-etiquette" htmlFor={`${id}-${champ}`}>{libelle}</label>
              <input id={`${id}-${champ}`} className="ec-champ" type="text" inputMode="decimal" value={saisie[champ]} onChange={changer(champ)} />
            </div>
          ))}
        </div>
        <button type="submit" className="ec-bouton ec-bouton--seul">Enregistrer mes mesures</button>
        {message.texte && <p className={message.erreur ? 'ec-petit ec-erreur-texte' : 'ec-petit'} role={message.erreur ? 'alert' : 'status'}>{message.texte}</p>}
      </form>
      {mesures === null && message.texte === '' && <SqTableau />}
      {mesures && liste.length === 0 && <p className="ec-vide">Aucune mesure pour l’instant.</p>}
      {liste.length > 0 && (
        <>
          <div className="ec-tableau-enveloppe">
            <table className="ec-tableau">
              <thead>
                <tr>
                  <th scope="col">Date</th><th scope="col">Poids</th><th scope="col">Taille</th><th scope="col">Hanches</th>
                  <th scope="col">Poitrine</th><th scope="col">Bras</th><th scope="col">Cuisse</th>
                  <th scope="col"><span className="ec-invisible">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {liste.map((m) => (
                  <tr key={m.id}>
                    <td className="ec-tableau__date">{dateComplete(m.date)}</td>
                    <td>{valeur(m.poids, ' kg')}</td><td>{valeur(m.taille)}</td><td>{valeur(m.hanches)}</td>
                    <td>{valeur(m.poitrine)}</td><td>{valeur(m.bras)}</td><td>{valeur(m.cuisse)}</td>
                    <td><button type="button" className="ec-lien ec-lien--petit" onClick={() => supprimer(m)}>{aSupprimer === m.id ? 'Confirmer' : 'Supprimer'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="ec-petit">Poids en kg, tours en cm.</p>
        </>
      )}
    </>
  )
}
