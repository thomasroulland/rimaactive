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

  // Même style que la séance sur téléphone (Marie, 23 novembre 2026) : titre en petites capitales, cartes blanches,
  // effort en couleurs comme la RPE, ressenti, commentaire, gros bouton jaune.
  return (
    <aside className="ec-fin ec-fin--st" aria-labelledby="titre-fin">
      <form className="ec-fin__form" onSubmit={valider} noValidate>
        <h2 id="titre-fin" className="ec-st__sur ec-fin__titre">Fin de séance</h2>
        <fieldset className="ec-st-carte ec-fin__groupe">
          <legend className="ec-st-feuille__lab ec-fin__lab">Effort global de la séance</legend>
          <p className="ec-st-legende" aria-hidden="true"><span>Modéré</span><span>Maximal</span></p>
          <div className="ec-st-rpe ec-fin__efforts" role="radiogroup" aria-label="Effort global de la séance">
            {EFFORTS.map((n) => (
              <button key={n} type="button" role="radio" className={`rpe-${n}`} aria-checked={v.effort === n} aria-label={`${n}, ${NOMS[n]}`}
                disabled={terminee} onClick={() => maj('effort', v.effort === n ? null : n)}>{n}</button>
            ))}
          </div>
          <p className={`ec-st-rpe__texte${v.effort ? ` rpe-${v.effort}` : ''}`} aria-live="polite">
            {v.effort ? (NOMS[v.effort] ?? `${v.effort} sur 10`) : (terminee ? '' : AIDE)}
          </p>
        </fieldset>
        <fieldset className="ec-st-carte ec-fin__groupe">
          <legend className="ec-st-feuille__lab ec-fin__lab">Mon ressenti</legend>
          <div className="ec-fin__ressentis">
            {RESSENTIS.map((r) => (
              <button key={r} type="button" className="ec-choix" aria-pressed={v.ressenti === r} disabled={terminee}
                onClick={() => maj('ressenti', r)}>{r}</button>
            ))}
          </div>
        </fieldset>
        <div className="ec-st-carte ec-fin__groupe">
          <label htmlFor="fin-commentaire" className="ec-st-feuille__lab ec-fin__lab">{course ? 'Mes sensations' : 'Mon commentaire'}</label>
          <textarea id="fin-commentaire" className="ec-st-note" rows="3" value={v.commentaire} readOnly={terminee}
            placeholder={terminee ? '' : 'Sensations, douleurs, ce qui a été facile ou difficile'}
            onChange={(e) => maj('commentaire', e.target.value)} />
        </div>
        {!terminee && <button type="submit" className="ec-st__gros" disabled={envoye}>Enregistrer ma séance <Coche /></button>}
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

function Coche() {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
}


// Écran épuré (14 novembre 2026, demande de Thomas) : coche, titre, une phrase, le record s'il y en a un, un seul bouton.
// La prochaine séance est sur le tableau de bord ; « Revoir ma séance » reste en petit lien.
function Bravo({ suite, records, revoir }) {
  const phrase = !suite || !suite.prevues ? 'Marie la verra dans votre suivi.'
    : suite.faites === suite.prevues ? 'Programme terminé, bravo !'
      : `${suite.faites} séance${suite.faites > 1 ? 's' : ''} sur ${suite.prevues}, bravo !`
  return (
    <aside className="ec-fin ec-bravo" aria-labelledby="titre-bravo">
      <span className="ec-bravo__rond" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      </span>
      <h2 id="titre-bravo" className="ec-bravo__titre">Séance enregistrée</h2>
      <p role="status" className="sr-only">Séance enregistrée.</p>
      <p className="ec-texte ec-gris">{phrase}</p>
      {records.length > 0 && (
        <ul className="ec-records ec-records--court">
          {records.slice(0, 2).map((r) => (
            <li key={r.exoId}><Trophee /><span>Record : <strong>{r.nom} {frNombre(r.charge)} kg</strong> <span className="ec-gris">(avant {frNombre(r.ancien.charge)})</span></span></li>
          ))}
          {records.length > 2 && <li className="ec-gris ec-records__autres">et {records.length - 2} autre{records.length > 3 ? 's' : ''} record{records.length > 3 ? 's' : ''}, à voir dans « Ma progression »</li>}
        </ul>
      )}
      <Link className="ec-bouton ec-bravo__principal" to="/espace">Retour à l’accueil</Link>
      <button type="button" className="ec-bravo__revoir" onClick={revoir}>Revoir ma séance</button>
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
