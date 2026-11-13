import { Link } from 'react-router-dom'
import { seancesDeLaSemaine } from '../donnees/progression.js'
import { statutSeance } from '../donnees/seances.js'
import { Chevron, Statut } from './Statut.jsx'

// Onglet « Cette semaine » : une ligne par séance de la semaine (case, numéro, titre, état).
export default function CetteSemaine({ programme, semaine, faites, seances }) {
  const lignes = seancesDeLaSemaine(programme, semaine, faites)
  return (
    <section className="ec-semaine" aria-labelledby="titre-ma-semaine">
      <h2 id="titre-ma-semaine" className="ec-h3">Ma semaine</h2>
      <ul className="ec-semaine__liste">
        {lignes.map((x) => {
          const statut = statutSeance(seances, programme.id, x.seance.id)
          const classe = statut === 'Faite' ? 'cochee' : statut === 'En cours' ? 'encours' : ''
          return (
            <li key={x.seance.id}>
              <Link className="ec-ligne" to={`/espace/seance/${programme.id}/${x.seance.id}`}>
                <span className={`ec-case-regul ${classe}`.trim()} aria-hidden="true" />
                <span className="ec-ligne__corps">
                  <span className="ec-ligne__titre">Séance {x.numero}</span>
                  {x.seance.titre && <span className="ec-ligne__meta">{x.seance.titre}</span>}
                </span>
                <Statut statut={statut} />
                <Chevron />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
