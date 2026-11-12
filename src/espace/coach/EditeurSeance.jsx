import { JOURS } from '../donnees/calculs.js'
import PhotoStockee from './PhotoStockee.jsx'
import ChoixExercice from './ChoixExercice.jsx'

export const FORMATS = [
  ['series', 'Séries classiques'],
  ['emom', 'EMOM'],
  ['amrap', 'AMRAP'],
  ['tabata', 'TABATA'],
  ['hiit', 'HIIT'],
]

function resumeFormat(b) {
  if (b.format === 'emom' || b.format === 'amrap') return b.duree ? `${b.format.toUpperCase()} ${b.duree} min` : b.format.toUpperCase()
  if (b.format === 'tabata' || b.format === 'hiit') {
    const d = [b.duree && `${b.duree} min`, b.repos && `repos ${b.repos} s`].filter(Boolean).join(', ')
    return `${b.format.toUpperCase()}${d ? ` ${d}` : ''}`
  }
  return 'Séries classiques'
}

function Champ({ id, label, valeur, changer, large, mode, multiligne }) {
  return (
    <div className={`champ-groupe espace-param${large ? ' espace-param--large' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {multiligne
        ? <textarea id={id} className="champ" rows={3} value={valeur ?? ''} onChange={(e) => changer(e.target.value)} />
        : <input id={id} className="champ" autoComplete="off" inputMode={mode} value={valeur ?? ''} onChange={(e) => changer(e.target.value)} />}
    </div>
  )
}

// Éditeur d'une séance : champs de la séance, puis (force) blocs et exercices, ou (course) distance et temps.
// `verrou` : séance faite, tout est en lecture seule.
export default function EditeurSeance({ seance, numero, semaine, verrou, exercices, majSeance, majBloc, majElement, retirer, ajouter }) {
  const ids = (cle) => `se-${seance.id}-${cle}`
  const lettres = (seance.blocs ?? []).map((b) => b.lettre)

  return (
    <div className="espace-seance">
      {verrou && <p className="espace-verrou espace-verrou--fort">Séance faite : non modifiable</p>}
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
                      <select id={`bloc-${b.id}-format`} className="champ" value={b.format} onChange={(e) => majBloc(bi, 'format', e.target.value)}>
                        {FORMATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    {b.format !== 'series' && (
                      <Champ id={`bloc-${b.id}-duree`} label="Durée (min)" mode="numeric" valeur={b.duree} changer={(v) => majBloc(bi, 'duree', v)} />
                    )}
                    {(b.format === 'tabata' || b.format === 'hiit') && (
                      <Champ id={`bloc-${b.id}-repos`} label="Repos (s)" mode="numeric" valeur={b.repos} changer={(v) => majBloc(bi, 'repos', v)} />
                    )}
                  </div>
                </div>
                <ol className="espace-elements">
                  {(b.elements ?? []).map((el, ei) => (
                    <Element key={el.id} element={el} code={`${b.lettre}${ei + 1}`} series={b.format === 'series'} verrou={verrou}
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

function Element({ element: el, code, series, verrou, maj, retirer }) {
  const id = (cle) => `el-${el.id}-${cle}`
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
        <Champ id={id('charge')} label="Charge (kg)" mode="decimal" valeur={el.charge} changer={(v) => maj('charge', v)} />
        <Champ id={id('pct')} label="% 1RM" mode="decimal" valeur={el.pct} changer={(v) => maj('pct', v)} />
        {series && <Champ id={id('rpe')} label="RPE" mode="decimal" valeur={el.rpe} changer={(v) => maj('rpe', v)} />}
        {series && <Champ id={id('repos')} label="Repos" valeur={el.repos} changer={(v) => maj('repos', v)} />}
        {series && <Champ id={id('tempo')} label="Tempo" valeur={el.tempo} changer={(v) => maj('tempo', v)} />}
        <Champ id={id('commentaire')} label="Commentaire pour cette séance" large valeur={el.commentaire} changer={(v) => maj('commentaire', v)} />
      </div>
    </li>
  )
}
