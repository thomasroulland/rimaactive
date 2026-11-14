import { frNombre } from '../donnees/resume.js'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RESSENTIS } from '../donnees/seances.js'

const EFFORTS = [5, 6, 7, 8, 9, 10]
const NOMS = { 5: 'Modéré', 6: 'Moyennement difficile', 7: 'Difficile', 8: 'Très difficile', 9: 'Extrêmement difficile', 10: 'Effort maximal' }
const AIDE = 'Touchez une note : 5 modéré, 10 effort maximal.'

// Panneau « Fin de séance » (maquette) : effort global 5 à 10, ressenti, commentaire (« Mes sensations » en course),
// « Enregistrer ma séance ». Séance terminée (`fait.statut === 'terminée'`) : même panneau en lecture seule.
// `etat` : texte d'enregistrement (réseau) ; `envoyer(fin)` : { effort, ressenti, commentaire } (effort facultatif : null).
export default function FinDeSeance({ course, fait, etat, envoyer, suite, vientDeFinir, records = [] }) {
  const terminee = fait?.statut === 'terminée'
  const [fin, setFin] = useState({ effort: null, ressenti: '', commentaire: '' })
  const [envoye, setEnvoye] = useState(false) // un seul envoi, même après un double appui
  const [revoir, setRevoir] = useState(false)
  const v = terminee
    ? { effort: fait.effort ?? null, ressenti: fait.ressenti ?? '', commentaire: fait.commentaire ?? '' }
    : fin
  const maj = (cle, val) => setFin((f) => ({ ...f, [cle]: val }))

  const valider = (e) => {
    e.preventDefault()
    if (envoye) return
    setEnvoye(true)
    envoyer(fin)
  }

  // Juste après « Enregistrer ma séance » : un écran de fin clair (13 novembre 2026), avec la suite du programme
  if (terminee && vientDeFinir && !revoir) {
    return <Bravo fait={fait} suite={suite} records={records} revoir={() => setRevoir(true)} />
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
          {(v.effort || !terminee) && (
            <p className="ec-petit ec-fin__aide" aria-live="polite">{v.effort ? (NOMS[v.effort] ? `${v.effort} · ${NOMS[v.effort]}` : `${v.effort} sur 10`) : AIDE}</p>
          )}
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
        {!terminee && <button type="submit" className="ec-bouton" disabled={envoye}>Enregistrer ma séance</button>}
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


function Bravo({ fait, suite, records, revoir }) {
  const p = suite?.prochaine
  return (
    <aside className="ec-fin ec-bravo" aria-labelledby="titre-bravo">
      <span className="ec-bravo__rond" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      </span>
      <h2 id="titre-bravo" className="ec-bravo__titre">Séance enregistrée</h2>
      <p role="status" className="sr-only">Séance enregistrée.</p>
      {suite && suite.prevues > 0 && (
        <p className="ec-texte ec-gris">
          {suite.faites === suite.prevues
            ? 'Programme terminé, bravo ! Marie la verra dans votre suivi.'
            : `Bravo, c’est votre ${suite.faites}${suite.faites === 1 ? 're' : 'e'} séance sur ${suite.prevues}. Marie la verra dans votre suivi.`}
        </p>
      )}
      {(Number.isInteger(fait?.effort) || fait?.ressenti) && (
        <ul className="ec-bravo__tags">
          {Number.isInteger(fait.effort) && <li>Effort {fait.effort} sur 10</li>}
          {fait.ressenti && <li>Ressenti : {fait.ressenti}</li>}
        </ul>
      )}
      {records.length > 0 && (
        <div className="ec-records">
          <p className="ec-surtitre ec-records__titre"><Trophee />{records.length > 1 ? `${records.length} nouveaux records` : 'Nouveau record'}</p>
          <ul className="ec-records__liste">
            {records.map((r) => (
              <li key={r.exoId}>
                <span className="ec-records__nom">{r.nom}</span>
                <span className="ec-records__val">{frNombre(r.charge)} kg × {frNombre(r.reps)}</span>
                <span className="ec-records__avant">avant : {frNombre(r.ancien.charge)} kg</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {p && (
        <Link className="ec-bravo__suite" to={`/espace/seance/${suite.programmeId}/${p.seance.id}`}>
          <span>
            <span className="ec-surtitre ec-bravo__surtitre">Prochaine séance</span>
            <span className="ec-bravo__nom">{p.seance.titre || 'Ma prochaine séance'}</span>
          </span>
          <span className="ec-bouton ec-bravo__voir">Voir</span>
        </Link>
      )}
      <div className="ec-bravo__actions">
        <button type="button" className="ec-bouton ec-bouton--clair" onClick={revoir}>Revoir ma séance</button>
        <Link className="ec-bouton" to="/espace">Retour au tableau de bord</Link>
      </div>
    </aside>
  )
}

export function Trophee() {
  return (
    <svg className="ec-trophee" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4z" /><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4" /><path d="M12 13v4M9 20h6M10 17h4v3h-4z" />
    </svg>
  )
}
