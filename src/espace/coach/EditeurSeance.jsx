import { useState } from 'react'
import { resumeFormat } from '../donnees/seances.js'
import { LETTRES, NOM_BLOC_MAX, nomBloc } from '../donnees/programme.js'
import useReglages from './useReglages.js'
import PhotoStockee from './PhotoStockee.jsx'
import ChoixExercice, { TYPE_GLISSE } from './ChoixExercice.jsx'
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

// Idées de noms pour un bloc (le nom est facultatif : sans nom, le bloc s'appelle « Bloc A »)
const IDEES_NOMS = ['Échauffement', 'Force', 'Cardio', 'Gainage', 'Mobilité', 'Retour au calme']

// Éditeur d'une séance (maquette B de Thomas, 15 novembre 2026) : la banque d'exercices à gauche, la séance à droite,
// un exercice par ligne (séries, reps, charge, repos), le reste dans « ⋯ », des blocs que l'on peut renommer.
// `verrou` : séance faite, tout est en lecture seule.
export default function EditeurSeance({ seance, numero, semaine, verrou, attente, exercices, rm, rpeSemaine, majSeance, majBloc, majElement, retirer, ajouter }) {
  const ids = (cle) => `se-${seance.id}-${cle}`
  const blocs = seance.blocs ?? []
  const lettres = blocs.map((b) => b.lettre)
  const prochaine = LETTRES[lettres.length]
  const { types } = useReglages()
  const [cible, setCible] = useState(null)
  const [survol, setSurvol] = useState(null) // lettre du bloc au-dessus duquel on glisse un exercice
  const cibleOk = cible && (lettres.includes(cible) || cible === prochaine) ? cible : (lettres[lettres.length - 1] ?? 'A')
  const nbExos = blocs.reduce((t, b) => t + (b.elements ?? []).length, 0)
  const nbSeries = blocs.reduce((t, b) => t + (b.elements ?? []).reduce((u, e) => u + (b.format === 'series' ? (parseInt(e.series, 10) || 0) : 0), 0), 0)

  const pourDeposer = (lettre) => ({
    onDragOver: (ev) => { if ([...ev.dataTransfer.types].includes(TYPE_GLISSE)) { ev.preventDefault(); setSurvol(lettre) } },
    onDragLeave: (ev) => { if (!ev.currentTarget.contains(ev.relatedTarget)) setSurvol(null) },
    onDrop: (ev) => {
      ev.preventDefault(); setSurvol(null)
      const exo = (exercices ?? []).find((x) => x.id === ev.dataTransfer.getData(TYPE_GLISSE))
      if (exo) { ajouter(lettre, exo); setCible(lettre) }
    },
  })
  const versLaBanque = (lettre) => { setCible(lettre); document.getElementById('choix-recherche')?.focus() }

  return (
    <div className="espace-seance es2">
      <div className="es2__seance">
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
                {types.map((t) => <option key={t.id} value={t.id}>{t.nom}</option>)}
                {!types.some((t) => t.id === seance.type) && <option value={seance.type}>Type supprimé</option>}
              </select>
            </div>
            <Champ id={ids('lieu')} label="Lieu" valeur={seance.lieu} changer={(v) => majSeance('lieu', v)} />
            <Champ id={ids('duree')} label="Durée (min)" valeur={seance.duree} changer={(v) => majSeance('duree', v)} />
            <Champ id={ids('objectif')} label="Objectif" valeur={seance.objectif} changer={(v) => majSeance('objectif', v)} />
            {seance.type !== 'course' && (
              <p className="es2__resume" aria-live="polite">
                {nbExos} exercice{nbExos > 1 ? 's' : ''} · {nbSeries} série{nbSeries > 1 ? 's' : ''}{blocs.length > 0 && <> · {blocs.length} bloc{blocs.length > 1 ? 's' : ''}</>}
              </p>
            )}
            {seance.type === 'course' && (
              <>
                <Champ id={ids('distance')} label="Distance" valeur={seance.distance} changer={(v) => majSeance('distance', v)} />
                <Champ id={ids('temps')} label="Temps" valeur={seance.temps} changer={(v) => majSeance('temps', v)} />
                <Champ id={ids('consigne')} label="Consigne" large multiligne valeur={seance.consigne} changer={(v) => majSeance('consigne', v)} />
              </>
            )}
          </div>

          {seance.type !== 'course' && (
            <>
              {blocs.length === 0 && (
                <p className="espace-texte">Aucun exercice pour l’instant. Cherchez-en un dans la banque et touchez ＋, ou glissez-le ici.</p>
              )}
              {blocs.map((b, bi) => (
                <section key={b.id} className={`es2-bloc${cibleOk === b.lettre ? ' est-cible' : ''}${survol === b.lettre ? ' est-depot' : ''}`} aria-labelledby={`bloc-${b.id}`} data-format={b.format === 'series' ? 'series' : 'autre'} {...pourDeposer(b.lettre)}>
                  <div className="es2-bloc__tete">
                    <EnteteBloc bloc={b} verrou={verrou} renommer={(v) => majBloc(bi, 'nom', v)} idTitre={`bloc-${b.id}`} />
                    <div className="champ-groupe es2-bloc__format">
                      <label htmlFor={`bloc-${b.id}-format`} className="sr-only">Format du bloc {b.lettre}</label>
                      <select id={`bloc-${b.id}-format`} className="champ" value={b.format} onChange={(e) => {
                        const f = e.target.value
                        majBloc(bi, 'format', f)
                        Object.entries(REGLAGES_FORMAT[f] ?? {}).forEach(([cle, v]) => { if (!b[cle]) majBloc(bi, cle, v) })
                      }}>
                        {FORMATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  {(b.format === 'emom' || b.format === 'amrap' || b.format === 'tabata' || b.format === 'hiit') && (
                    <div className="espace-params espace-params--bloc es2-bloc__reglages">
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
                  )}
                  {(b.elements ?? []).length > 0 && (
                    <div className="es2-colonnes" aria-hidden="true">
                      <span />
                      <span className="es2-colonnes__vide" />
                      {b.format === 'series' && <span>Séries</span>}
                      <span>Reps</span>
                      <span>Charge</span>
                      {b.format === 'series' && <span>Repos</span>}
                      <span />
                    </div>
                  )}
                  <ol className="es2-lignes">
                    {(b.elements ?? []).map((el, ei) => (
                      <LigneExo key={el.id} element={el} code={`${b.lettre}${ei + 1}`} series={b.format === 'series'} verrou={verrou} rm={rm} rpeSemaine={rpeSemaine}
                        maj={(cle, v) => majElement(bi, ei, cle, v)} retirer={() => retirer(el)}
                        photo={el.photos?.[0] || (exercices ?? []).find((x) => x.id === el.exoId)?.photos?.[0]} />
                    ))}
                  </ol>
                  {!verrou && (
                    <button type="button" className="es2-ajouter" onClick={() => versLaBanque(b.lettre)}>
                      {survol === b.lettre ? 'Déposez l’exercice ici' : '＋ Ajouter un exercice'}
                    </button>
                  )}
                </section>
              ))}
              {!verrou && prochaine && (
                <div className={`es2-nouveau${survol === prochaine ? ' est-depot' : ''}${cibleOk === prochaine ? ' est-cible' : ''}`} {...pourDeposer(prochaine)}>
                  <button type="button" onClick={() => versLaBanque(prochaine)}>＋ Nouveau bloc {prochaine}</button>
                  <span>{survol === prochaine ? 'Déposez l’exercice ici pour créer ce bloc' : 'ou glissez un exercice ici'}</span>
                </div>
              )}
            </>
          )}
        </fieldset>
      </div>

      {seance.type !== 'course' && !verrou && (
        <aside className="es2__banque" aria-label="Banque d’exercices">
          <ChoixExercice exercices={exercices} lettres={lettres} ajouter={ajouter} cible={cibleOk} changerCible={setCible} laterale />
        </aside>
      )}
    </div>
  )
}

// Nom du bloc : la lettre dans un carré noir, le nom à côté ; un clic sur le crayon le rend modifiable (Entrée valide, Échap annule)
function EnteteBloc({ bloc, verrou, renommer, idTitre }) {
  const [edition, setEdition] = useState(false)
  const [brouillon, setBrouillon] = useState('')
  const ouvrir = () => { setBrouillon(bloc.nom ?? ''); setEdition(true) }
  const valider = (v = brouillon) => { renommer(String(v).replace(/\s+/g, ' ').trim().slice(0, NOM_BLOC_MAX)); setEdition(false) }
  if (edition) {
    return (
      <div className="es2-nom es2-nom--edition">
        <span className="es2-lettre" aria-hidden="true">{bloc.lettre}</span>
        <div className="es2-nom__champ">
          <label className="sr-only" htmlFor={`${idTitre}-nom`}>Nom du bloc {bloc.lettre}</label>
          <input id={`${idTitre}-nom`} className="champ" autoFocus maxLength={NOM_BLOC_MAX} autoComplete="off" value={brouillon} placeholder={`Bloc ${bloc.lettre}`}
            onChange={(e) => setBrouillon(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); valider() } if (e.key === 'Escape') { e.preventDefault(); setEdition(false) } }} />
          <button type="button" className="bouton bouton--principal bouton--compact" onClick={() => valider()}>OK</button>
          <span className="es2-nom__aide">Entrée pour valider · Échap pour annuler</span>
        </div>
        <ul className="es2-idees" aria-label="Idées de noms">
          {IDEES_NOMS.map((n) => <li key={n}><button type="button" className="filtre-coaches" onClick={() => valider(n)}>{n}</button></li>)}
        </ul>
      </div>
    )
  }
  return (
    <div className="es2-nom">
      <h2 id={idTitre} className="es2-nom__titre"><span className="es2-lettre" aria-hidden="true">{bloc.lettre}</span>{nomBloc(bloc)}</h2>
      {!verrou && (
        <button type="button" className="es2-crayon" onClick={ouvrir} aria-label={`Renommer le bloc ${bloc.lettre}`} title="Renommer le bloc">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4zM13.5 6.5l4 4" /></svg>
        </button>
      )}
    </div>
  )
}

// Un exercice sur une ligne ; tempo, % 1RM, RPE, « se mesure en » et commentaire dans « ⋯ »
function LigneExo({ element: el, code, series, verrou, rm, rpeSemaine, maj, retirer, photo }) {
  const [plus, setPlus] = useState(false)
  const id = (cle) => `el-${el.id}-${cle}`
  const calculee = chargeIndicative(el.nom, el.pct, rm)
  const aideCharge = calculee !== null && String(el.charge ?? '').trim() === '' ? `≈ ${frNombre(calculee)} kg d’après le 1RM` : undefined
  const duree = el.mesure === 'duree'
  const cellule = (cle, libelle, mode, indice) => (
    <input id={id(cle)} className="es2-cellule" autoComplete="off" inputMode={mode} aria-label={`${code} ${el.nom}, ${libelle}`} value={el[cle] ?? ''} placeholder={indice} onChange={(e) => maj(cle, e.target.value)} />
  )
  return (
    <li className="es2-ligne">
      <div className="es2-ligne__principal">
        <PhotoStockee chemin={photo} alt="" classe="espace-vignette" />
        <p className="es2-ligne__nom"><span className="es2-code" aria-hidden="true">{code}</span> {el.nom}{el.muscles?.length > 0 && <small>{el.muscles.join(', ')}</small>}</p>
        {series && cellule('series', 'séries', 'numeric')}
        {cellule('reps', duree ? 'durée' : 'répétitions', duree ? 'text' : 'numeric', duree ? '45 s' : undefined)}
        {cellule('charge', 'charge en kilos', 'decimal', calculee !== null ? frNombre(calculee) : undefined)}
        {series && cellule('repos', 'repos')}
        <button type="button" className="es2-plus" aria-expanded={plus} aria-label={`Plus de réglages pour ${el.nom}`} onClick={() => setPlus((p) => !p)}>⋯</button>
      </div>
      {plus && (
        <div className="es2-ligne__plus">
          <div className="espace-params">
            <div className="champ-groupe espace-param">
              <label htmlFor={id('mesure')}>Se mesure en</label>
              <select id={id('mesure')} className="champ" value={duree ? 'duree' : 'reps'} onChange={(e) => maj('mesure', e.target.value === 'duree' ? 'duree' : '')}>
                <option value="reps">Répétitions</option>
                <option value="duree">Durée</option>
              </select>
            </div>
            <Champ id={id('pct')} label="% 1RM" mode="decimal" valeur={el.pct} aide={aideCharge} changer={(v) => maj('pct', v)} />
            {series && <Champ id={id('rpe')} label="RPE cible" mode="decimal" valeur={el.rpe} indice={rpeSemaine || undefined} aide={rpeSemaine && String(el.rpe ?? '').trim() === '' ? `RPE de la semaine : ${rpeSemaine}` : undefined} changer={(v) => maj('rpe', v)} />}
            {series && <Champ id={id('tempo')} label="Tempo" valeur={el.tempo} changer={(v) => maj('tempo', v)} />}
            <Champ id={id('commentaire')} label="Commentaire pour cette séance" large valeur={el.commentaire} changer={(v) => maj('commentaire', v)} />
          </div>
          {!verrou && <button type="button" className="espace-lien es2-retirer" onClick={retirer}>Retirer {el.nom} de la séance</button>}
        </div>
      )}
    </li>
  )
}
