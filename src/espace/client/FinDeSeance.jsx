import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RESSENTIS } from '../donnees/seances.js'

const EFFORTS = [5, 6, 7, 8, 9, 10]
const NOMS = { 5: 'Modéré', 6: 'Moyennement difficile', 7: 'Difficile', 8: 'Très difficile', 9: 'Extrêmement difficile', 10: 'Effort maximal' }
const AIDE = 'Touchez une note : 5 modéré, 10 effort maximal.'

// Panneau « Fin de séance » (maquette) : effort global 5 à 10, ressenti, commentaire (« Mes sensations » en course),
// « Enregistrer ma séance ». Séance terminée (`fait.statut === 'terminée'`) : même panneau en lecture seule.
// `etat` : texte d'enregistrement (réseau) ; `envoyer(fin)` : { effort, ressenti, commentaire }.
export default function FinDeSeance({ course, fait, etat, envoyer }) {
  const terminee = fait?.statut === 'terminée'
  const [fin, setFin] = useState({ effort: null, ressenti: '', commentaire: '' })
  const [erreur, setErreur] = useState('')
  const v = terminee
    ? { effort: fait.effort ?? null, ressenti: fait.ressenti ?? '', commentaire: fait.commentaire ?? '' }
    : fin
  const maj = (cle, val) => { setErreur(''); setFin((f) => ({ ...f, [cle]: val })) }

  const valider = (e) => {
    e.preventDefault()
    if (!fin.effort) { setErreur('Touchez une note d’effort pour enregistrer votre séance.'); return }
    envoyer(fin)
  }

  return (
    <aside className="ec-fin" aria-labelledby="titre-fin">
      <form className="ec-fin__form" onSubmit={valider} noValidate>
        <h2 id="titre-fin" className="ec-h3">Fin de séance</h2>
        <fieldset className="ec-fin__groupe">
          <legend className="ec-fin__legende">Effort global de la séance</legend>
          <div className="ec-fin__efforts">
            {EFFORTS.map((n) => (
              <button key={n} type="button" className="ec-effort" aria-pressed={v.effort === n} aria-label={`${n}, ${NOMS[n]}`}
                disabled={terminee} onClick={() => maj('effort', n)}>{n}</button>
            ))}
          </div>
          <p className={erreur ? 'ec-erreur ec-fin__aide' : 'ec-petit ec-fin__aide'} aria-live="polite">
            {erreur || (v.effort ? `${v.effort} · ${NOMS[v.effort]}` : AIDE)}
          </p>
        </fieldset>
        <fieldset className="ec-fin__groupe">
          <legend className="ec-fin__legende">Mon ressenti</legend>
          <div className="ec-fin__ressentis">
            {RESSENTIS.map((r) => (
              <button key={r} type="button" className="ec-choix" aria-pressed={v.ressenti === r} disabled={terminee}
                onClick={() => maj('ressenti', r)}>{r}</button>
            ))}
          </div>
        </fieldset>
        <div className="ec-fin__commentaire">
          <label htmlFor="fin-commentaire" className="ec-fin__legende">{course ? 'Mes sensations' : 'Mon commentaire'}</label>
          <textarea id="fin-commentaire" className="ec-champ" rows="4" value={v.commentaire} readOnly={terminee}
            placeholder={terminee ? '' : 'Sensations, douleurs, ce qui a été facile ou difficile'}
            onChange={(e) => maj('commentaire', e.target.value)} />
        </div>
        {!terminee && <button type="submit" className="ec-bouton">Enregistrer ma séance</button>}
      </form>
      {etat && (
        <p role="status" className="ec-fin__etat">
          {etat}{etat === 'Séance enregistrée.' && <> <Link className="ec-lien" to="/espace">Voir mon tableau de bord</Link></>}
        </p>
      )}
      {terminee && fait.commentaireCoach && <p className="ec-texte ec-fin__marie">Marie : {fait.commentaireCoach}</p>}
    </aside>
  )
}
