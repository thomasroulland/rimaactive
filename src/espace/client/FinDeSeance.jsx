import { useState } from 'react'

const RESSENTIS = ['Facile', 'Bien', 'Difficile']
const EFFORTS = Array.from({ length: 10 }, (_, i) => i + 1)

// « Fin de séance » : effort 1 à 10, ressenti, douleur (oui / non, endroit, note) ; course : distance et temps.
// `fait` : la séance faite déjà terminée (affichée en lecture seule).
export default function FinDeSeance({ course, fait, envoyer }) {
  const [fin, setFin] = useState({ effort: null, ressenti: '', douleur: { oui: false, endroit: '', note: '' }, distance: '', temps: '' })
  const [erreur, setErreur] = useState('')
  const maj = (cle, v) => setFin((f) => ({ ...f, [cle]: v }))
  const majDouleur = (cle, v) => setFin((f) => ({ ...f, douleur: { ...f.douleur, [cle]: v } }))

  if (fait?.statut === 'terminée') {
    const d = fait.douleur
    return (
      <section className="espace-carte client-fin" aria-labelledby="titre-fin">
        <h2 id="titre-fin" className="client-sous-titre">Fin de séance</h2>
        <dl className="client-bilan">
          {course && <><dt>Distance</dt><dd>{fait.distance ? `${fait.distance} km` : '–'}</dd><dt>Temps</dt><dd>{fait.temps || '–'}</dd></>}
          <dt>Effort</dt><dd>{fait.effort ? `${fait.effort} sur 10` : '–'}</dd>
          <dt>Ressenti</dt><dd>{fait.ressenti || '–'}</dd>
          <dt>Douleur</dt><dd>{d?.oui ? ['Oui', d.endroit, d.note].filter(Boolean).join(' · ') : 'Non'}</dd>
        </dl>
        {fait.commentaireCoach && <p className="client-exo__commentaire">Marie : {fait.commentaireCoach}</p>}
      </section>
    )
  }

  const valider = (e) => {
    e.preventDefault()
    if (!fin.effort) { setErreur('Choisissez votre effort, de 1 à 10.'); return }
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
        <p className="espace-aide" id="fin-effort-aide">1 très facile, 10 effort maximal.</p>
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

      <fieldset className="champ-groupe">
        <legend>Une douleur pendant la séance ?</legend>
        <div className="client-choix">
          <button type="button" className="client-choix__bouton client-choix__bouton--mot" aria-pressed={!fin.douleur.oui} onClick={() => majDouleur('oui', false)}>Non</button>
          <button type="button" className="client-choix__bouton client-choix__bouton--mot" aria-pressed={fin.douleur.oui} onClick={() => majDouleur('oui', true)}>Oui</button>
        </div>
      </fieldset>
      {fin.douleur.oui && (
        <>
          <div className="champ-groupe">
            <label htmlFor="fin-endroit">Endroit</label>
            <input id="fin-endroit" className="champ" autoComplete="off" placeholder="Ex. genou droit" value={fin.douleur.endroit} onChange={(e) => majDouleur('endroit', e.target.value)} />
          </div>
          <div className="champ-groupe">
            <label htmlFor="fin-note">Note</label>
            <textarea id="fin-note" className="champ" rows={3} placeholder="Quand, sur quel exercice, à quel point" value={fin.douleur.note} onChange={(e) => majDouleur('note', e.target.value)} />
          </div>
        </>
      )}

      <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>
      <button type="submit" className="bouton bouton--principal">Enregistrer ma séance</button>
    </form>
  )
}
