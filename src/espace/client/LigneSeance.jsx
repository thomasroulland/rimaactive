import { Link } from 'react-router-dom'
import { dateLongue } from '../donnees/seances.js'

const CLASSES = { Faite: 'client-case client-case--faite', 'En cours': 'client-case client-case--encours', 'À faire': 'client-case' }

// Une séance dans une liste (Ma semaine, Mon programme) : case d'état, titre, jour, statut ; ouvre la séance.
export default function LigneSeance({ programmeId, item, numero, statut, detail }) {
  const { seance, date } = item
  return (
    <li>
      <Link className="client-ligne" to={`/espace/seance/${programmeId}/${seance.id}`}>
        <span className={CLASSES[statut]} aria-hidden="true" />
        <span className="client-ligne__corps">
          <span className="client-ligne__titre">{seance.titre || `Séance ${numero}`}</span>
          <span className="client-ligne__meta">
            Séance {numero} · {dateLongue(date)}{detail ? ` · ${detail}` : ''}
          </span>
        </span>
        <span className="client-ligne__statut">{statut}</span>
      </Link>
    </li>
  )
}
