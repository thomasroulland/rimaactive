import { useState } from 'react'
import { RESSENTIS } from '../donnees/seances.js'

const EFFORTS = [5, 6, 7, 8, 9, 10]

// « Fin de séance » : effort 5 à 10, ressenti ; course : distance et temps.
// `fait` : la séance faite déjà terminée (affichée en lecture seule).
export default function FinDeSeance({ course, fait, envoyer }) {
  const [fin, setFin] = useState({ effort: null, ressenti: '', distance: '', temps: '' })
  const [erreur, setErreur] = useState('')
  const maj = (cle, v) => setFin((f) => ({ ...f, [cle]: v }))

  if (fait?.statut === 'terminée') {
    return (
      <section className="espace-carte client-fin" aria-labelledby="titre-fin">
        <h2 id="titre-fin" className="client-sous-titre">Fin de séance</h2>
        <dl className="client-bilan">
          {course && <><dt>Distance</dt><dd>{fait.distance ? `${fait.distance} km` : '–'}</dd><dt>Temps</dt><dd>{fait.temps || '–'}</dd></>}
          <dt>Effort</dt><dd>{fait.effort ? `${fait.effort} sur 10` : '–'}</dd>
          <dt>Ressenti</dt><dd>{fait.ressenti || '–'}</dd>
        </dl>
        {fait.commentaireCoach && <p className="client-exo__commentaire">Marie : {fait.commentaireCoach}</p>}
      </section>
    )
  }

  const valider = (e) => {
    e.preventDefault()
    if (!fin.effort) { setErreur('Choisissez votre effort, de 5 à 10.'); return }
    setErreur('')
    envoyer(fin)
  }

  return (
    <form className="espace-carte client-fin" aria-labelledby="titre-fin" onSubmit={valider} noValidate>
      <h2 id="titre-fin" className="client-sous-titre">Fin de séance</h2>

      {course && (
        <div className="client-fin__duo">
          <div className="champ-groupe">
            <label htmlFor="fin-distance">Distance (km)</label>
            <input id="fin-distance" className="champ" inputMode="decimal" autoComplete="off" value={fin.distance} onChange={(e) => maj('distance', e.target.value)} />
          </div>
          <div className="champ-groupe">
            <label htmlFor="fin-temps">Temps (h:mm:ss)</label>
            <input id="fin-temps" className="champ" inputMode="numeric" autoComplete="off" placeholder="0:30:00" value={fin.temps} onChange={(e) => maj('temps', e.target.value)} />
          </div>
        </div>
      )}

      <fieldset className="champ-groupe">
        <legend>Effort de la séance</legend>
        <p className="espace-aide" id="fin-effort-aide">5 effort modéré, 10 effort maximal.</p>
        <div className="client-choix client-choix--effort">
          {EFFORTS.map((n) => (
            <button key={n} type="button" className="client-choix__bouton" aria-pressed={fin.effort === n}
              aria-describedby="fin-effort-aide" onClick={() => maj('effort', n)}>{n}</button>
          ))}
        </div>
      </fieldset>

      <fieldset className="champ-groupe">
        <legend>Mon ressenti</legend>
        <div className="client-choix">
          {RESSENTIS.map((r) => (
            <button key={r} type="button" className="client-choix__bouton client-choix__bouton--mot" aria-pressed={fin.ressenti === r}
              onClick={() => maj('ressenti', fin.ressenti === r ? '' : r)}>{r}</button>
          ))}
        </div>
      </fieldset>

      <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>
      <button type="submit" className="bouton bouton--principal">Enregistrer ma séance</button>
    </form>
  )
}
