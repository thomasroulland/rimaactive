import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ecouterMesMesures, ecouterMesPhotos, lireProfil } from '../depots.js'
import { dateComplete, evolutionMesures } from '../donnees/progression.js'
import { ecartPoids, frNombre } from '../donnees/resume.js'
import EnteteCoache from './EnteteCoache.jsx'
import PhotoStockee from './PhotoStockee.jsx'

const COLONNES = [['poids', 'Poids', 'kg'], ['taille', 'Taille', 'cm'], ['hanches', 'Hanches', 'cm'], ['poitrine', 'Poitrine', 'cm'], ['bras', 'Bras', 'cm'], ['cuisse', 'Cuisse', 'cm']]

// Onglet « Mesures et photos » d'un coaché (13 novembre 2026) : ce que le coaché a saisi, en lecture seule.
export default function MesuresCoache() {
  const { uid } = useParams()
  const [client, setClient] = useState(undefined)
  const [mesures, setMesures] = useState(null)
  const [photos, setPhotos] = useState(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => { lireProfil(uid).then(setClient).catch(() => { setClient(null); setErreur('Impossible de charger ce coaché. Vérifiez votre connexion.') }) }, [uid])
  useEffect(() => ecouterMesMesures(uid, setMesures, () => setErreur('Impossible de charger les mesures. Vérifiez votre connexion.')), [uid])
  useEffect(() => ecouterMesPhotos(uid, setPhotos, () => setErreur('Impossible de charger les photos. Vérifiez votre connexion.')), [uid])

  if (!client) {
    return <section className="section"><div className="conteneur espace-coach"><p className="espace-texte" role="status">{client === null ? 'Ce coaché n’existe pas.' : 'Chargement…'}</p><p className="espace-message espace-message--erreur" role="alert">{erreur}</p></div></section>
  }
  const poids = ecartPoids(mesures)
  const fr = (v) => (typeof v === 'number' ? frNombre(v) : '–')

  return (
    <section className="section">
      <div className="conteneur espace-coach">
        <EnteteCoache client={client} uid={uid} chemin={[{ label: 'Mesures et photos' }]} />
        <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>
        <p className="espace-aide">Saisies par {client.prenom} dans son espace. Privées : visibles uniquement par {client.prenom} et vous.</p>

        <section className="espace-carte mesures-coache" aria-labelledby="mc-mesures">
          <div className="suivi-titre">
            <h2 id="mc-mesures" className="espace-sous-titre">Poids et mensurations</h2>
            {poids !== null && <span className="repere-chiffre">{frNombre(poids, true)} kg depuis la première pesée</span>}
          </div>
          {mesures === null ? <p className="espace-texte" role="status">Chargement…</p>
            : mesures.length === 0 ? <p className="espace-texte">{client.prenom} n’a pas encore saisi de mesure.</p> : (
              <>
                <div className="mesures-coache__defile">
                  <table className="mesures-coache__table">
                    <thead><tr><th scope="col">Date</th>{COLONNES.map(([c, l, u]) => <th key={c} scope="col">{l} <small>({u})</small></th>)}</tr></thead>
                    <tbody>{mesures.map((m) => <tr key={m.id}><td>{dateComplete(m.date)}</td>{COLONNES.map(([c]) => <td key={c}>{fr(m[c])}</td>)}</tr>)}</tbody>
                  </table>
                </div>
                <p className="espace-aide">{evolutionMesures(mesures)}</p>
              </>
            )}
        </section>

        <section className="espace-carte" aria-labelledby="mc-photos">
          <div className="suivi-titre"><h2 id="mc-photos" className="espace-sous-titre">Photos de progression</h2>
            {photos?.length > 0 && <span className="espace-aide">{photos.length} photo{photos.length > 1 ? 's' : ''}</span>}</div>
          {photos === null ? <p className="espace-texte" role="status">Chargement…</p>
            : photos.length === 0 ? <p className="espace-texte">{client.prenom} n’a pas encore ajouté de photo.</p> : (
              <ul className="photos-coache">
                {[...photos].reverse().map((ph) => (
                  <li key={ph.id}>
                    <PhotoStockee chemin={ph.chemin} alt={`Photo de progression du ${dateComplete(ph.date)}`} classe="photos-coache__img" />
                    <span>{dateComplete(ph.date)}</span>
                  </li>
                ))}
              </ul>
            )}
        </section>
      </div>
    </section>
  )
}
