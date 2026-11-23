import { useState } from 'react'
import { estEnSeries, resumeFormat } from '../donnees/seances.js'
import { LETTRES, NOM_BLOC_MAX, nomBloc } from '../donnees/programme.js'
import useReglages from './useReglages.js'
import { formatsDuType, nomType } from '../donnees/reglages.js'
import PhotoStockee from './PhotoStockee.jsx'
import ChoixExercice, { TYPE_GLISSE } from './ChoixExercice.jsx'

// glisser un bloc (ou un exercice dans son bloc) pour changer l'ordre
const TYPE_BLOC = 'application/x-rimaactive-bloc'
const TYPE_EXO = 'application/x-rimaactive-exo-bloc'
import { chargeIndicative, chargeParMain } from '../donnees/banque.js'
import { frNombre } from '../donnees/resume.js'
import { IconeCorbeille, IconePoints } from './Icones.jsx'

export const FORMATS = [
  ['series', 'Séries classiques'],
  ['superset', 'Superset (enchaîner)'],
  ['emom', 'EMOM'],
  ['amrap', 'AMRAP'],
  ['tabata', 'TABATA'],
  ['hiit', 'HIIT'],
  ['continu', 'Continu'],
  ['intervalles', 'Intervalles classiques'],
]
// blocs « Continu » et « Intervalles » (23 novembre 2026) : l'exercice est l'activité (course, vélo, rameur…),
// sans répétitions ni charge ; les réglages sont ceux du bloc
const estActivite = (format) => format === 'continu' || format === 'intervalles'
const ZONES = ['1', '2', '3', '4', '5']

// réglages proposés quand on choisit TABATA ou HIIT (maquette de Marie) : travail, repos, tours
const REGLAGES_FORMAT = { tabata: { travail: '20', repos: '10', tours: '8' }, hiit: { travail: '40', repos: '20', tours: '6' } }

// Zone cardiaque visée (1 à 5) pour les blocs Continu et Intervalles
function ChoixZone({ id, valeur, changer }) {
  return (
    <div className="champ-groupe espace-param">
      <label htmlFor={id}>Zone</label>
      <select id={id} className="champ" value={valeur ?? ''} onChange={(e) => changer(e.target.value)}>
        <option value="">–</option>
        {ZONES.map((z) => <option key={z} value={z}>Zone {z}</option>)}
      </select>
    </div>
  )
}

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
export default function EditeurSeance({ seance, numero, semaine, verrou, attente, exercices, rm, majSeance, majBloc, majElement, retirer, ajouter, ajouterBloc, supprimerBloc, deplacerBloc, deplacerElement }) {
  const ids = (cle) => `se-${seance.id}-${cle}`
  const blocs = seance.blocs ?? []
  const lettres = blocs.map((b) => b.lettre)
  const prochaine = LETTRES[lettres.length]
  const { types } = useReglages()
  const [survol, setSurvol] = useState(null) // lettre du bloc au-dessus duquel on glisse un exercice
  // glisser un bloc pour changer l'ordre (18 novembre 2026) : index du bloc tenu, et place où il tomberait
  const [blocTenu, setBlocTenu] = useState(null)
  const [placeBloc, setPlaceBloc] = useState(null)
  // glisser un exercice dans son bloc pour changer l'ordre (20 novembre 2026) : { bi, ei } tenu, et { bi, ei } où il tomberait
  const [exoTenu, setExoTenu] = useState(null)
  const [placeExo, setPlaceExo] = useState(null)
  const finExo = () => { setExoTenu(null); setPlaceExo(null) }
  const glisserExo = (bi, ei) => ({
    onDragOver: (ev) => {
      if (!exoTenu || exoTenu.bi !== bi || ![...ev.dataTransfer.types].includes(TYPE_EXO)) return
      ev.preventDefault(); ev.stopPropagation()
      const r = ev.currentTarget.getBoundingClientRect()
      const place = ev.clientY < r.top + r.height / 2 ? ei : ei + 1
      if (placeExo?.bi !== bi || placeExo?.ei !== place) setPlaceExo({ bi, ei: place })
    },
    onDrop: (ev) => {
      if (!exoTenu || exoTenu.bi !== bi || ![...ev.dataTransfer.types].includes(TYPE_EXO)) return
      ev.preventDefault(); ev.stopPropagation()
      const place = placeExo?.bi === bi ? placeExo.ei : ei
      deplacerElement?.(bi, exoTenu.ei, place > exoTenu.ei ? place - 1 : place)
      finExo()
    },
  })
  // un exercice créé dans la banque va dans le dernier bloc (ou crée le bloc A)
  const dernier = lettres[lettres.length - 1] ?? 'A'
  const nbExos = blocs.reduce((t, b) => t + (b.elements ?? []).length, 0)
  const nbSeries = blocs.reduce((t, b) => t + (b.elements ?? []).reduce((u, e) => u + (estEnSeries(b.format) ? (parseInt(e.series, 10) || 0) : 0), 0), 0)

  const pourDeposer = (lettre) => ({
    onDragOver: (ev) => { if ([...ev.dataTransfer.types].includes(TYPE_GLISSE)) { ev.preventDefault(); setSurvol(lettre) } },
    onDragLeave: (ev) => { if (!ev.currentTarget.contains(ev.relatedTarget)) setSurvol(null) },
    onDrop: (ev) => {
      ev.preventDefault(); setSurvol(null)
      const exo = (exercices ?? []).find((x) => x.id === ev.dataTransfer.getData(TYPE_GLISSE))
      if (exo) ajouter(lettre, exo)
    },
  })
  const glisserBloc = (bi) => ({
    onDragOver: (ev) => {
      if (blocTenu === null || ![...ev.dataTransfer.types].includes(TYPE_BLOC)) return
      ev.preventDefault()
      const r = ev.currentTarget.getBoundingClientRect()
      setPlaceBloc(ev.clientY < r.top + r.height / 2 ? bi : bi + 1)
    },
    onDrop: (ev) => {
      if (blocTenu === null || ![...ev.dataTransfer.types].includes(TYPE_BLOC)) return
      ev.preventDefault()
      const vers = placeBloc === null ? bi : (placeBloc > blocTenu ? placeBloc - 1 : placeBloc)
      deplacerBloc?.(blocTenu, vers)
      setBlocTenu(null); setPlaceBloc(null)
    },
  })

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
                {!types.some((t) => t.id === seance.type) && <option value={seance.type}>{nomType(seance.type, types)} (ancien type)</option>}
              </select>
            </div>
            <Champ id={ids('lieu')} label="Lieu" valeur={seance.lieu} changer={(v) => majSeance('lieu', v)} />
            {/* plus de durée (18 novembre 2026) ni d'objectif (23 novembre 2026, Marie ne l'écrivait pas) */}
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
                <p className="espace-texte">Aucun exercice pour l’instant.</p>
              )}
              {blocs.map((b, bi) => (
                <section key={b.id} className={`es2-bloc${survol === b.lettre ? ' est-depot' : ''}${blocTenu === bi ? ' est-tenu' : ''}${placeBloc === bi && blocTenu !== null && blocTenu !== bi && blocTenu !== bi - 1 ? ' depot-avant' : ''}${placeBloc === bi + 1 && bi === blocs.length - 1 && blocTenu !== null && blocTenu !== bi ? ' depot-apres' : ''}`}
                  aria-labelledby={`bloc-${b.id}`} data-format={estEnSeries(b.format) ? 'series' : 'autre'}
                  onDragOver={(ev) => { pourDeposer(b.lettre).onDragOver(ev); glisserBloc(bi).onDragOver(ev) }}
                  onDragLeave={pourDeposer(b.lettre).onDragLeave}
                  onDrop={(ev) => { if (blocTenu !== null) glisserBloc(bi).onDrop(ev); else pourDeposer(b.lettre).onDrop(ev) }}>
                  <div className="es2-bloc__tete">
                    {!verrou && blocs.length > 1 && (
                      <span className="es2-bloc__poignee" draggable title="Glisser pour changer l’ordre des blocs" aria-label={`Déplacer le ${nomBloc(b).toLowerCase()}`} role="img"
                        onDragStart={(ev) => {
                          ev.dataTransfer.setData(TYPE_BLOC, b.id); ev.dataTransfer.effectAllowed = 'move'
                          const sec = ev.currentTarget.closest('.es2-bloc'); if (sec) ev.dataTransfer.setDragImage(sec, 24, 24)
                          setBlocTenu(bi)
                        }}
                        onDragEnd={() => { setBlocTenu(null); setPlaceBloc(null) }}>
                        <svg viewBox="0 0 10 16" width="10" height="16" fill="currentColor" aria-hidden="true"><circle cx="2" cy="2" r="1.5" /><circle cx="8" cy="2" r="1.5" /><circle cx="2" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" /><circle cx="2" cy="14" r="1.5" /><circle cx="8" cy="14" r="1.5" /></svg>
                      </span>
                    )}
                    <EnteteBloc bloc={b} verrou={verrou} renommer={(v) => majBloc(bi, 'nom', v)} idTitre={`bloc-${b.id}`} />
                    <div className="champ-groupe es2-bloc__format">
                      <label htmlFor={`bloc-${b.id}-format`} className="sr-only">Format du bloc {b.lettre}</label>
                      <select id={`bloc-${b.id}-format`} className="champ" value={b.format} onChange={(e) => {
                        const f = e.target.value
                        majBloc(bi, 'format', f)
                        Object.entries(REGLAGES_FORMAT[f] ?? {}).forEach(([cle, v]) => { if (!b[cle]) majBloc(bi, cle, v) })
                      }}>
                        {/* seulement les formats prévus pour le type de séance (Marie, 23 novembre 2026) ; un bloc déjà créé garde le sien */}
                        {FORMATS.filter(([v]) => formatsDuType(seance.type).includes(v) || v === b.format).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    {!verrou && <SupprimerBloc bloc={b} supprimer={() => supprimerBloc(b.id, nomBloc(b))} />}
                  </div>
                  {b.format === 'continu' && (
                    <div className="espace-params espace-params--bloc es2-bloc__reglages">
                      <Champ id={`bloc-${b.id}-duree`} label="Durée (min)" mode="numeric" valeur={b.duree} changer={(v) => majBloc(bi, 'duree', v)} />
                      <Champ id={`bloc-${b.id}-distance`} label="Distance (km)" mode="decimal" valeur={b.distance} changer={(v) => majBloc(bi, 'distance', v)} />
                      <Champ id={`bloc-${b.id}-allure`} label="Allure (/km)" valeur={b.allure} changer={(v) => majBloc(bi, 'allure', v)} indice="ex. 6:00" />
                      <ChoixZone id={`bloc-${b.id}-zone`} valeur={b.zone} changer={(v) => majBloc(bi, 'zone', v)} />
                    </div>
                  )}
                  {b.format === 'intervalles' && (
                    <div className="espace-params espace-params--bloc es2-bloc__reglages">
                      <Champ id={`bloc-${b.id}-repetitions`} label="Répétitions" mode="numeric" valeur={b.repetitions} changer={(v) => majBloc(bi, 'repetitions', v)} />
                      <Champ id={`bloc-${b.id}-effort`} label="Effort (durée ou distance)" valeur={b.effort} changer={(v) => majBloc(bi, 'effort', v)} indice="ex. 3 min ou 400 m" />
                      <Champ id={`bloc-${b.id}-recup`} label="Récupération" valeur={b.recup} changer={(v) => majBloc(bi, 'recup', v)} indice="ex. 1 min 30" />
                      <Champ id={`bloc-${b.id}-allure`} label="Allure (/km)" valeur={b.allure} changer={(v) => majBloc(bi, 'allure', v)} indice="ex. 4:45" />
                      <ChoixZone id={`bloc-${b.id}-zone`} valeur={b.zone} changer={(v) => majBloc(bi, 'zone', v)} />
                    </div>
                  )}
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
                      {estEnSeries(b.format) && <span>Séries</span>}
                      {!estActivite(b.format) && <span>Reps</span>}
                      {!estActivite(b.format) && <span>Charge</span>}
                      {estEnSeries(b.format) && <span>RPE</span>}
                      {estEnSeries(b.format) && <span>Tempo</span>}
                      {estEnSeries(b.format) && <span>Repos</span>}
                      <span />
                    </div>
                  )}
                  <ol className="es2-lignes">
                    {(b.elements ?? []).map((el, ei) => (
                      <LigneExo key={el.id} element={el} code={`${b.lettre}${ei + 1}`} series={estEnSeries(b.format)} activite={estActivite(b.format)} verrou={verrou} rm={rm}
                        maj={(cle, v) => majElement(bi, ei, cle, v)} retirer={() => retirer(el)}
                        materiel={el.materiel || (exercices ?? []).find((x) => x.id === el.exoId)?.materiel}
                        parMain={chargeParMain(el.materiel || (exercices ?? []).find((x) => x.id === el.exoId)?.materiel)}
                        nbDansBloc={(b.elements ?? []).length} monter={ei > 0 ? () => deplacerElement?.(bi, ei, ei - 1) : null}
                        descendre={ei < (b.elements ?? []).length - 1 ? () => deplacerElement?.(bi, ei, ei + 1) : null}
                        tenu={exoTenu?.bi === bi && exoTenu.ei === ei}
                        depot={placeExo?.bi === bi && exoTenu && exoTenu.ei !== ei && exoTenu.ei !== ei - 1 && placeExo.ei === ei ? 'avant'
                          : placeExo?.bi === bi && exoTenu && ei === (b.elements ?? []).length - 1 && exoTenu.ei !== ei && placeExo.ei === ei + 1 ? 'apres' : ''}
                        prendre={(ev) => { ev.dataTransfer.setData(TYPE_EXO, el.id); ev.dataTransfer.effectAllowed = 'move'; const li = ev.currentTarget.closest('.es2-ligne'); if (li) ev.dataTransfer.setDragImage(li, 20, 20); setExoTenu({ bi, ei }) }}
                        lacher={finExo} {...glisserExo(bi, ei)}
                        photo={el.photos?.[0] || (exercices ?? []).find((x) => x.id === el.exoId)?.photos?.[0]} />
                    ))}
                  </ol>
                  {/* plus de bouton « Ajouter » (18 novembre 2026) : on glisse un exercice de la banque dans le bloc */}
                  {!verrou && (
                    <p className="es2-ajouter" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
                      {survol === b.lettre ? 'Déposez l’exercice ici' : 'Glissez un exercice ici'}
                    </p>
                  )}
                </section>
              ))}
              {!verrou && prochaine && (
                <div className={`es2-nouveau${survol === prochaine ? ' est-depot' : ''}`} {...pourDeposer(prochaine)}>
                  <button type="button" onClick={() => ajouterBloc()}>＋ Nouveau bloc {prochaine}</button>
                  <span>{survol === prochaine ? 'Déposez l’exercice ici pour créer ce bloc' : 'ou glissez un exercice ici'}</span>
                </div>
              )}
            </>
          )}
        </fieldset>
      </div>

      {seance.type !== 'course' && !verrou && (
        <aside className="es2__banque" aria-label="Banque d’exercices">
          <ChoixExercice exercices={exercices} ajouter={(exo) => ajouter(dernier, exo)} laterale />
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
        <div className="es2-nom__ligne">
          <span className="es2-lettre" aria-hidden="true">{bloc.lettre}</span>
          <label className="sr-only" htmlFor={`${idTitre}-nom`}>Nom du bloc {bloc.lettre}</label>
          <input id={`${idTitre}-nom`} className="es2-nom__saisie" autoFocus maxLength={NOM_BLOC_MAX} autoComplete="off" value={brouillon} placeholder={`Bloc ${bloc.lettre}`}
            title="Entrée pour valider, Échap pour annuler"
            onChange={(e) => setBrouillon(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); valider() } if (e.key === 'Escape') { e.preventDefault(); setEdition(false) } }} />
          <button type="button" className="es2-nom__rond es2-nom__rond--ok" aria-label="Valider le nom" title="Valider" onClick={() => valider()}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          </button>
          <button type="button" className="es2-nom__rond" aria-label="Annuler" title="Annuler" onClick={() => setEdition(false)}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <ul className="es2-idees" aria-label="Idées de noms">
          {IDEES_NOMS.map((n) => <li key={n}><button type="button" onClick={() => valider(n)}>{n}</button></li>)}
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

// Un exercice sur une ligne : séries, reps, charge, RPE et tempo visibles (18 novembre 2026), le commentaire juste en dessous ;
// « ⋯ » garde « se mesure en », le % du 1RM et « Retirer ». Repos par exercice revenu le 22 novembre 2026 ; plus de RPE de la semaine en exemple
// (il se juge sur le ressenti global de fin de séance). Haltères : la charge est celle d'un haltère, « par main ».
function LigneExo({ element: el, code, series, activite, verrou, rm, maj, retirer, photo, parMain, materiel, nbDansBloc, monter, descendre, tenu, depot, prendre, lacher, onDragOver, onDrop }) {
  const [plus, setPlus] = useState(false)
  const id = (cle) => `el-${el.id}-${cle}`
  const calculee = chargeIndicative(el.nom, el.pct, rm)
  const aideCharge = calculee !== null && String(el.charge ?? '').trim() === '' ? `≈ ${frNombre(calculee)} kg d’après le 1RM` : undefined
  const duree = el.mesure === 'duree'
  const cellule = (cle, libelle, mode, indice) => (
    <input id={id(cle)} className="es2-cellule" autoComplete="off" inputMode={mode} aria-label={`${code} ${el.nom}, ${libelle}`} value={el[cle] ?? ''} placeholder={indice} onChange={(e) => maj(cle, e.target.value)} />
  )
  return (
    <li className={`es2-ligne${tenu ? ' est-tenu' : ''}${depot ? ` depot-${depot}` : ''}`} onDragOver={onDragOver} onDrop={onDrop}>
      <div className="es2-ligne__principal">
        <PhotoStockee chemin={photo} alt="" classe="espace-vignette" />
        <p className="es2-ligne__nom">
          {!verrou && nbDansBloc > 1 && (
            <span className="es2-ligne__poignee" draggable title="Glisser pour changer l’ordre dans le bloc" onDragStart={prendre} onDragEnd={lacher} aria-hidden="true">
              <svg viewBox="0 0 10 16" width="8" height="13" fill="currentColor"><circle cx="2" cy="2" r="1.5" /><circle cx="8" cy="2" r="1.5" /><circle cx="2" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" /><circle cx="2" cy="14" r="1.5" /><circle cx="8" cy="14" r="1.5" /></svg>
            </span>
          )}
          <span className="es2-code" aria-hidden="true">{code}</span> {el.nom}
          {/* le matériel, pour distinguer deux exercices du même nom (20 novembre 2026) */}
          {(materiel || el.muscles?.length > 0) && <small>{materiel && <b className="es2-mat">{materiel}</b>}{materiel && el.muscles?.length > 0 && ' · '}{el.muscles?.join(', ')}</small>}
        </p>
        {series && cellule('series', 'séries', 'numeric')}
        {/* répétitions : un nombre ou une fourchette « 8-10 » (le coaché note ce qu'il a fait) */}
        {!activite && cellule('reps', duree ? 'durée' : 'répétitions (ex. 10 ou 8-10)', 'text', duree ? '45 s' : undefined)}
        {!activite && (
          <span className={`es2-charge${parMain ? ' es2-charge--main' : ''}`}>
            {cellule('charge', parMain ? 'charge d’un haltère, par main, en kilos' : 'charge en kilos', 'decimal', calculee !== null ? frNombre(calculee) : undefined)}
            {parMain && <span className="es2-charge__main" aria-hidden="true">par main</span>}
          </span>
        )}
        {series && cellule('rpe', 'RPE', 'decimal')}
        {series && cellule('tempo', 'tempo (ex. 3-1-1)', 'text')}
        {/* repos après la série, de retour (Marie, 22 novembre 2026) : séries classiques et supersets */}
        {series && cellule('repos', 'repos en secondes (ex. 90)', 'text', 's')}
        <button type="button" className="es2-plus" aria-expanded={plus} aria-label={`Plus de réglages pour ${el.nom}`} onClick={() => setPlus((p) => !p)}><IconePoints /></button>
      </div>
      <div className="es2-ligne__note">
        <label className="sr-only" htmlFor={id('commentaire')}>Commentaire pour cet exercice ({code} {el.nom})</label>
        <input id={id('commentaire')} className="es2-note" autoComplete="off" placeholder="Commentaire pour cet exercice" value={el.commentaire ?? ''} onChange={(e) => maj('commentaire', e.target.value)} />
      </div>
      {plus && (
        <div className="es2-opt">
          <div className="es2-opt__grille">
            <div className="es2-opt__champ">
              <span id={id('mesure')}>Se mesure en</span>
              <div className="es2-opt__bascule" role="group" aria-labelledby={id('mesure')}>
                <button type="button" aria-pressed={!duree} onClick={() => maj('mesure', '')}>Répétitions</button>
                <button type="button" aria-pressed={duree} onClick={() => maj('mesure', 'duree')}>Durée</button>
              </div>
            </div>
            <label className="es2-opt__champ" htmlFor={id('pct')}><span>% du 1RM</span>
              <input id={id('pct')} autoComplete="off" inputMode="decimal" value={el.pct ?? ''} onChange={(e) => maj('pct', e.target.value)} /></label>
          </div>
          {aideCharge && <p className="es2-opt__aide">{aideCharge}</p>}
          {!verrou && (monter || descendre) && (
            <div className="es2-opt__ordre" role="group" aria-label="Place dans le bloc">
              <button type="button" disabled={!monter} onClick={() => monter?.()}>↑ Monter</button>
              <button type="button" disabled={!descendre} onClick={() => descendre?.()}>↓ Descendre</button>
            </div>
          )}
          {!verrou && <button type="button" className="es2-opt__retirer" onClick={retirer}>Retirer {el.nom} de la séance</button>}
        </div>
      )}
    </li>
  )
}

// Corbeille du bloc : un bloc vide part tout de suite ; un bloc avec des exercices demande d'abord confirmation
function SupprimerBloc({ bloc, supprimer }) {
  const [confirme, setConfirme] = useState(false)
  const n = (bloc.elements ?? []).length
  if (confirme) {
    return (
      <span className="es2-bloc__confirme" role="group" aria-label={`Supprimer le ${nomBloc(bloc).toLowerCase()} ?`}>
        <span>Supprimer avec {n} exercice{n > 1 ? 's' : ''} ?</span>
        <button type="button" className="es2-bloc__oui" onClick={supprimer}>Supprimer</button>
        <button type="button" onClick={() => setConfirme(false)}>Garder</button>
      </span>
    )
  }
  return (
    <button type="button" className="es2-bloc__corbeille" aria-label={`Supprimer le ${nomBloc(bloc).toLowerCase()}`} title="Supprimer le bloc" onClick={() => (n === 0 ? supprimer() : setConfirme(true))}>
      <IconeCorbeille />
    </button>
  )
}
