import { useEffect, useRef } from 'react'
import { jourCourt } from '../donnees/calculs.js'
import { nomBloc } from '../donnees/programme.js'
import { estEnSeries, resumeFormat, texteReps } from '../donnees/seances.js'

// Aperçu d'une séance avant le début du programme (Marie, 22 novembre 2026) : une bulle par-dessus la page,
// l'ordre des blocs et des exercices avec séries et répétitions. La séance elle-même ne s'ouvre pas.
export default function ApercuSeance({ seance, numero, debut, fermer }) {
  const ref = useRef(null)
  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
    return () => { if (d?.open) d.close() }
  }, [])
  const course = seance.type === 'course'
  return (
    <dialog ref={ref} className="ec-tuto ec-apercu" aria-labelledby="apercu-titre" onClose={fermer} onClick={(e) => { if (e.target === e.currentTarget) fermer() }}>
      <div className="ec-tuto__corps">
        <span className="ec-tuto__poignee" aria-hidden="true" />
        <p className="ec-apercu__surtitre">Séance {numero}</p>
        <h2 id="apercu-titre" className="ec-tuto__titre">{seance.titre || `Séance ${numero}`}</h2>
        {course
          ? <p className="ec-apercu__course">{[seance.distance, seance.temps].filter(Boolean).join(' · ') || 'Sortie de course'}</p>
          : (seance.blocs ?? []).length === 0
            ? <p className="ec-apercu__course">Marie n’a pas encore ajouté d’exercice.</p>
            : (
              <ol className="ec-apercu__blocs">
                {(seance.blocs ?? []).map((b) => {
                  const format = estEnSeries(b.format) && b.format !== 'superset' ? '' : resumeFormat(b)
                  return (
                    <li key={b.id} className="ec-apercu__bloc">
                      <p className="ec-apercu__nombloc">{nomBloc(b)}{format && <span> · {format}</span>}</p>
                      <ul className="ec-apercu__exos">
                        {(b.elements ?? []).map((el, i) => (
                          <li key={el.id}>
                            <span className="ec-apercu__code">{b.lettre}{i + 1}</span>
                            <span className="ec-apercu__nom">{el.nom || 'Exercice'}</span>
                            <span className="ec-apercu__dose">{dose(el, b)}</span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  )
                })}
              </ol>
            )}
        <p className="ec-apercu__quand">Vous pourrez la commencer {jourCourt(debut)}</p>
        <button type="button" className="ec-bouton ec-tuto__ok" onClick={fermer}>Fermer</button>
      </div>
    </dialog>
  )
}

// « 4 × 10 », « 3 × 8 à 10 », « 3 × 45 s », ou seulement les répétitions hors séries (EMOM…)
function dose(el, bloc) {
  const reps = texteReps(el.reps)
  const r = reps && (el.mesure === 'duree' ? `${reps} s` : reps)
  if (!estEnSeries(bloc.format)) return r || ''
  return [el.series, r].filter(Boolean).join(' × ')
}
