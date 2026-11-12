import { meilleuresCharges } from '../donnees/calculs.js'
import { dateCourte, evolutionCharges, fr } from '../donnees/seances.js'

const NB_POINTS = 8 // dernières séances montrées par exercice

// Exercices des programmes publiés : élément → exercice de la banque, et nom de chaque exercice (le plus récent)
function exercicesDe(programmes) {
  const exoIdParElement = new Map()
  const noms = new Map()
  for (const p of programmes) {
    for (const sem of p.semaines ?? []) {
      for (const s of sem.seances ?? []) {
        for (const b of s.blocs ?? []) {
          for (const el of b.elements ?? []) {
            if (!el.exoId) continue
            exoIdParElement.set(el.id, el.exoId)
            if (!noms.has(el.exoId)) noms.set(el.exoId, el.nom)
          }
        }
      }
    }
  }
  return { exoIdParElement, noms }
}

// « Mes charges » : pour chaque exercice, la meilleure charge de chaque séance terminée.
export default function MesCharges({ programmes, seances }) {
  const { exoIdParElement, noms } = exercicesDe(programmes)
  const courbes = [...noms.entries()]
    .map(([exoId, nom]) => ({ exoId, nom, points: meilleuresCharges(seances, exoIdParElement, exoId) }))
    .filter((c) => c.points.length > 0)
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))

  return (
    <section className="client-page">
      <div className="client-pile">
        <h1 className="client-titre">Mes charges</h1>
        <p className="espace-texte">
          {courbes.length === 0
            ? 'Vos charges apparaîtront ici dès votre première séance de force enregistrée.'
            : 'Votre meilleure charge à chaque séance, exercice par exercice.'}
        </p>
      </div>
      {courbes.length > 0 && (
        <ul className="client-liste client-charges">
          {courbes.map((c) => <Courbe key={c.exoId} {...c} />)}
        </ul>
      )}
    </section>
  )
}

function Courbe({ nom, points }) {
  const vus = points.slice(-NB_POINTS)
  const valeur = (p) => parseFloat(String(p.charge).replace(',', '.')) || 0
  const max = Math.max(...vus.map(valeur), 1)
  const der = points[points.length - 1]
  const description = vus
    .map((p) => `${dateCourte(p.date)}, ${fr(p.charge)} kg${p.reps ? ` pour ${p.reps} répétitions` : ''}`)
    .join(' ; ')
  return (
    <li className="espace-carte client-courbe">
      <div className="client-courbe__tete">
        <h2 className="espace-element__titre">{nom}</h2>
        <p className="client-courbe__derniere">{fr(der.charge)} kg{der.reps ? ` × ${der.reps}` : ''}</p>
      </div>
      <div className="client-courbe__barres" role="img" aria-label={`${nom} : ${description}`}>
        {vus.map((p, i) => (
          <div key={i} className="client-courbe__point">
            <span className="client-courbe__valeur">{fr(p.charge)}</span>
            <span className="client-courbe__barre" style={{ height: `${Math.max(6, Math.round((valeur(p) / max) * 104))}px` }} />
            <span className="client-courbe__date">{dateCourte(p.date)}</span>
          </div>
        ))}
      </div>
      <p className="espace-aide">{evolutionCharges(vus)}</p>
    </li>
  )
}
