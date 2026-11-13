import { resumeFormat } from '../donnees/seances.js'
import { JOURS } from '../donnees/calculs.js'
import PhotoStockee from './PhotoStockee.jsx'
import ChoixExercice from './ChoixExercice.jsx'
import { chargeIndicative } from '../donnees/banque.js'
import { frNombre } from '../donnees/resume.js'

export const FORMATS = [
  ['series', 'Séries classiques'],
  ['emom', 'EMOM'],
  ['amrap', 'AMRAP'],
  ['tabata', 'TABATA'],
  ['hiit', 'HIIT'],
]

// réglages proposés quand on choisit TABATA ou HIIT (maquette de Marie) : travail, repos, tours
const REGLAGES_FORMAT = { tabata: { travail: '20', repos: '10', tours: '8' }, hiit: { travail: '40', repos: '20', tours: '6' } }

function Champ({ id, label, valeur, changer, large, mode, multiligne, indice, aide }) {
  return (
    <div className={`champ-groupe espace-param${large ? ' espace-param--large' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {multiligne
        ? <textarea id={id} className="champ" rows={3} value={valeur ?? ''} onChange={(e) => changer(e.target.value)} />
        : <input id={id} className="champ" autoComplete="off" inputMode={mode} value={valeur ?? ''} placeholder={indice}
          aria-describedby={aide ? `${id}-aide` : undefined} onChange={(e) => changer(e.target.value)} />}
      {aide && <span id={`${id}-aide`} className="espace-param__aide">{aide}</span>}
    </div>
  )
}

// Éditeur d'une séance : champs de la séance, puis (force) blocs et exercices, ou (course) distance et temps.
// `verrou` : séance faite, tout est en lecture seule.
export default function EditeurSeance({ seance, numero, semaine, verrou, attente, exercices, rm, rpeSemaine, majSeance, majBloc, majElement, retirer, ajouter }) {
  const ids = (cle) => `se-${seance.id}-${cle}`
  const lettres = (seance.blocs ?? []).map((b) => b.lettre)

  return (
    <div className="espace-seance">
      {verrou && (attente
        ? <p className="espace-verrou" role="status">Vérification des séances déjà faites…</p>
        : <p className="espace-verrou espace-verrou--fort">Séance faite : non modifiable</p>)}
      <fieldset className="espace-seance__champs" disabled={verrou}>
        <legend className="sr-only">Séance {numero} de la semaine S{semaine}</legend>
        <div className="espace-carte espace-params espace-params--seance">
          <Champ id={ids('titre')} label="Titre" large valeur={seance.titre} changer={(v) => majSeance('titre', v)} />
          <div className="champ-groupe espace-param">
            <label htmlFor={ids('type')}>Type</label>
            <select id={ids('type')} className="champ" value={seance.type} onChange={(e) => majSeance('type', e.target.value)}>
              <option value="force">Force</option>
              <option value="course">Course</option>
            </select>
          </div>
          <div className="champ-groupe espace-param">
            <label htmlFor={ids('jour')}>Jour</label>
            <select id={ids('jour')} className="champ" value={seance.jour} onChange={(e) => majSeance('jour', e.target.value)}>
              {JOURS.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          <Champ id={ids('lieu')} label="Lieu" valeur={seance.lieu} changer={(v) => majSeance('lieu', v)} />
          <Champ id={ids('duree')} label="Durée" valeur={seance.duree} changer={(v) => majSeance('duree', v)} />
          <Champ id={ids('objectif')} label="Objectif" valeur={seance.objectif} changer={(v) => majSeance('objectif', v)} />
          {seance.type === 'course' && (
            <>
              <Champ id={ids('distance')} label="Distance" valeur={seance.distance} changer={(v) => majSeance('distance', v)} />
              <Champ id={ids('temps')} label="Temps" valeur={seance.temps} changer={(v) => majSeance('temps', v)} />
              <Champ id={ids('consigne')} label="Consigne" large multiligne valeur={seance.consigne} changer={(v) => majSeance('consigne', v)} />
            </>
          )}
        </div>

        {seance.type === 'force' && (
          <>
            {(seance.blocs ?? []).length === 0 && (
              <p className="espace-texte">Aucun exercice pour l’instant. Ajoutez-en depuis votre banque.</p>
            )}
            {(seance.blocs ?? []).map((b, bi) => (
              <section key={b.id} className="espace-bloc" aria-labelledby={`bloc-${b.id}`}>
                <div className="espace-bloc__tete">
                  <h2 id={`bloc-${b.id}`} className="espace-sous-titre">Bloc {b.lettre} <span className="espace-bloc__format">{resumeFormat(b)}</span></h2>
                  <div className="espace-params espace-params--bloc">
                    <div className="champ-groupe espace-param">
                      <label htmlFor={`bloc-${b.id}-format`}>Format du bloc</label>
                      <select id={`bloc-${b.id}-format`} className="champ" value={b.format} onChange={(e) => {
                        const f = e.target.value
                        majBloc(bi, 'format', f)
                        Object.entries(REGLAGES_FORMAT[f] ?? {}).forEach(([cle, v]) => { if (!b[cle]) majBloc(bi, cle, v) })
                      }}>
                        {FORMATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    {(b.format === 'emom' || b.format === 'amrap') && (
                      <Champ id={`bloc-${b.id}-duree`} label="Durée (min)" mode="numeric" valeur={b.duree} changer={(v) => majBloc(bi, 'duree', v)} />
                    )}
                    {(b.format === 'tabata' || b.format === 'hiit') && (
                      <>
                        <Champ id={`bloc-${b.id}-travail`} label="Travail (s)" mode="numeric" valeur={b.travail} changer={(v) => majBloc(bi, 'travail', v)} />
                        <Champ id={`bloc-${b.id}-repos`} label="Repos (s)" mode="numeric" valeur={b.repos} changer={(v) => majBloc(bi, 'repos', v)} />
                        <Champ id={`bloc-${b.id}-tours`} label="Tours" mode="numeric" valeur={b.tours} changer={(v) => majBloc(bi, 'tours', v)} />
                      </>
                    )}
                  </div>
                </div>
                <ol className="espace-elements">
                  {(b.elements ?? []).map((el, ei) => (
                    <Element key={el.id} element={el} code={`${b.lettre}${ei + 1}`} series={b.format === 'series'} verrou={verrou} rm={rm} rpeSemaine={rpeSemaine}
                      maj={(cle, v) => majElement(bi, ei, cle, v)} retirer={() => retirer(el)} />
                  ))}
                </ol>
              </section>
            ))}
          </>
        )}
      </fieldset>

      {seance.type === 'force' && !verrou && <ChoixExercice exercices={exercices} lettres={lettres} ajouter={ajouter} />}
    </div>
  )
}

function Element({ element: el, code, series, verrou, rm, rpeSemaine, maj, retirer }) {
  const id = (cle) => `el-${el.id}-${cle}`
  const calculee = chargeIndicative(el.nom, el.pct, rm)
  const aideCharge = calculee !== null && String(el.charge ?? '').trim() === '' ? `≈ ${frNombre(calculee)} kg d’après le 1RM` : undefined
  return (
    <li className="espace-carte espace-element">
      <div className="espace-element__tete">
        <PhotoStockee chemin={el.photos?.[0]} alt="" classe="espace-vignette" />
        <div className="espace-element__nom">
          <span className="espace-element__code" aria-hidden="true">{code}</span>
          <h3 className="espace-element__titre"><span className="sr-only">{code} : </span>{el.nom}</h3>
          {el.muscles?.length > 0 && <p className="espace-element__muscles">{el.muscles.join(', ')}</p>}
        </div>
        {!verrou && <button type="button" className="espace-lien" onClick={retirer}>Retirer<span className="sr-only"> {el.nom}</span></button>}
      </div>
      <div className="espace-params">
        {series && <Champ id={id('series')} label="Séries" mode="numeric" valeur={el.series} changer={(v) => maj('series', v)} />}
        <Champ id={id('reps')} label={series ? 'Répétitions' : 'Répétitions ou durée'} valeur={el.reps} changer={(v) => maj('reps', v)} />
        <Champ id={id('charge')} label="Charge (kg)" mode="decimal" valeur={el.charge} indice={calculee !== null ? frNombre(calculee) : undefined} aide={aideCharge} changer={(v) => maj('charge', v)} />
        <Champ id={id('pct')} label="% 1RM" mode="decimal" valeur={el.pct} changer={(v) => maj('pct', v)} />
        {series && <Champ id={id('rpe')} label="RPE cible" mode="decimal" valeur={el.rpe} indice={rpeSemaine || undefined} aide={rpeSemaine && String(el.rpe ?? '').trim() === '' ? `RPE de la semaine : ${rpeSemaine}` : undefined} changer={(v) => maj('rpe', v)} />}
        {series && <Champ id={id('repos')} label="Repos" valeur={el.repos} changer={(v) => maj('repos', v)} />}
        {series && <Champ id={id('tempo')} label="Tempo" valeur={el.tempo} changer={(v) => maj('tempo', v)} />}
        <Champ id={id('commentaire')} label="Commentaire pour cette séance" large valeur={el.commentaire} changer={(v) => maj('commentaire', v)} />
      </div>
    </li>
  )
}
