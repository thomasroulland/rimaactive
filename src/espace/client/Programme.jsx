import { useState } from 'react'
import { listeSeances, semaineCourante, aujourdhuiIso } from '../donnees/calculs.js'
import { dateLongue, statutSeance } from '../donnees/seances.js'
import LigneSeance from './LigneSeance.jsx'

// « Mon programme » : semaines S1…Sn, puis les séances de la semaine choisie (faites, en cours ou à faire).
export default function Programme({ programme, seances }) {
  const nb = programme?.semaines?.length ?? 0
  const courante = programme ? Math.max(1, semaineCourante(programme.debut, aujourdhuiIso(), nb)) : 1
  const [choix, setChoix] = useState(null)
  const semaine = Math.min(choix ?? courante, Math.max(nb, 1))

  if (!programme) {
    return (
      <section className="client-page">
        <div className="client-pile">
          <h1 className="client-titre">Mon programme</h1>
          <p className="espace-texte">Votre programme arrive bientôt. Marie le prépare pour vous.</p>
        </div>
      </section>
    )
  }

  const liste = listeSeances(programme)
  const items = liste.filter((x) => x.semaine === semaine)
  const sem = programme.semaines[semaine - 1]

  return (
    <section className="client-page">
      <div className="client-pile">
        <p className="surtitre">{programme.nom}</p>
        <h1 className="client-titre">Mon programme</h1>
        <p className="espace-texte">Depuis le {dateLongue(programme.debut)}, {nb} {nb > 1 ? 'semaines' : 'semaine'}.</p>
      </div>

      {nb > 0 && (
        <div className="client-pile">
          <h2 className="client-sous-titre" id="titre-semaines">Mes semaines</h2>
          <div className="espace-pastilles" role="group" aria-labelledby="titre-semaines">
            {programme.semaines.map((s, i) => (
              <button key={s.id ?? i} type="button" className="espace-pastille" aria-pressed={semaine === i + 1}
                aria-label={`Semaine ${i + 1}${i + 1 === courante ? ', en cours' : ''}`} onClick={() => setChoix(i + 1)}>
                S{i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {sem?.mot && (
        <figure className="client-mot">
          <blockquote className="client-mot__texte">{sem.mot}</blockquote>
          <figcaption className="client-mot__auteur">Le mot de Marie{sem.rpe ? ` · RPE visé ${sem.rpe}` : ''}</figcaption>
        </figure>
      )}

      {items.length === 0
        ? <p className="espace-texte">Pas de séance prévue cette semaine.</p>
        : (
          <ul className="client-liste" aria-label={`Séances de la semaine ${semaine}`}>
            {items.map((x) => (
              <LigneSeance key={x.seance.id} programmeId={programme.id} item={x} numero={liste.indexOf(x) + 1}
                statut={statutSeance(seances, programme.id, x.seance.id)}
                detail={[x.seance.lieu, x.seance.duree].filter(Boolean).join(' · ')} />
            ))}
          </ul>
        )}
    </section>
  )
}
