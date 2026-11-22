import { useEffect, useRef, useState } from 'react'
import PhotoStockee from '../coach/PhotoStockee.jsx'
import { nomBloc } from '../donnees/programme.js'
import { champsResultat, enDuree, estEnSeries, estFourchette, fr, lignesExercice, resumeFormat, texteDuree, texteRepos, texteReps } from '../donnees/seances.js'
import { chargeParMain } from '../donnees/banque.js'
import { nomSuperset } from './SeanceGuidee.jsx'

// Séance sur téléphone (maquette « B » validée par Marie, 22 novembre 2026) :
// - séries classiques : une carte par exercice, une ligne par série (répétitions, kilos, ✓) ;
// - biset / triset : rangé par tour, une ligne par exercice et un seul ✓ pour l'enchaînement ;
// - EMOM, AMRAP, TABATA, HIIT : les exercices à enchaîner, le résultat, puis « Bloc fait ✓ ».
// L'effort (RPE) et la note se remplissent à la fin : d'une série, d'un tour ou du bloc, dans une bulle du bas.

const Coche = ({ taille = 20 }) => (
  <svg viewBox="0 0 24 24" width={taille} height={taille} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
)
const vide = (v) => !String(v ?? '').trim()
const texteRpe = (v) => fr(String(v ?? '').replace('.', ','))

export default function BlocTelephone({ bloc, etape, blocs, prog, lignes, notes, resultats, actions, voirConsignes, aller, finir, retour }) {
  const [plan, setPlan] = useState(false)
  const [feuille, setFeuille] = useState(null) // { type: 'serie' | 'tour' | 'bloc' | 'note', ... }
  const nb = blocs.length
  const dernier = etape >= nb - 1
  const suivant = () => (dernier ? finir() : aller(etape + 1))
  const libSuivant = dernier ? 'Fin de séance' : 'Bloc suivant'
  const els = bloc.elements ?? []
  const superset = bloc.format === 'superset'
  const enSeries = estEnSeries(bloc.format)
  const format = superset ? nomSuperset(bloc) : enSeries ? 'Séries' : String(bloc.format ?? '').toUpperCase()

  return (
    <div className="ec-st">
      <div className="ec-st__haut">
        {retour}
        <div className="ec-st__blocs" role="group" aria-label="Blocs de la séance">
          {blocs.map((b, i) => (
            <button key={b.id} type="button" className={i === etape ? 'est-actif' : prog.blocs[i]?.complet ? 'est-fini' : ''} aria-current={i === etape ? 'step' : undefined}
              aria-label={`${nomBloc(b)}${prog.blocs[i]?.complet ? ', fait' : ''}`} onClick={() => aller(i)} />
          ))}
        </div>
        <button type="button" className="ec-st__plan" aria-expanded={plan} onClick={() => setPlan((p) => !p)}>{plan ? 'Fermer' : 'Plan'}</button>
      </div>
      {plan && (
        <ul className="ec-s2-planliste">
          {blocs.map((b, i) => (
            <li key={b.id}><button type="button" className={i === etape ? 'est-actif' : ''} onClick={() => { setPlan(false); aller(i) }}>
              <span>{nomBloc(b)}</span><span>{prog.blocs[i]?.faites ?? 0}/{prog.blocs[i]?.total ?? 0}</span></button></li>
          ))}
          <li><button type="button" onClick={finir}><span>Fin de séance</span></button></li>
        </ul>
      )}
      <p className="ec-st__sur">{nomBloc(bloc)} · {format}</p>

      {els.length === 0
        ? <p className="ec-texte">Ce bloc n’a pas encore d’exercice.</p>
        : superset
          ? <Tours bloc={bloc} lignes={lignes} notes={notes} actions={actions} voirConsignes={voirConsignes} ouvrir={setFeuille} />
          : enSeries
            ? <Series bloc={bloc} lignes={lignes} notes={notes} actions={actions} voirConsignes={voirConsignes} ouvrir={setFeuille} />
            : <Chrono bloc={bloc} resultat={resultats[bloc.id]} actions={actions} voirConsignes={voirConsignes} ouvrir={setFeuille} />}

      {/* bloc EMOM, AMRAP… pas encore fait : un seul gros bouton ; sinon on passe d'un bloc à l'autre */}
      {!enSeries && !resultats[bloc.id]?.fait && els.length > 0
        ? <button type="button" className="ec-st__gros" onClick={() => { actions.blocValeurs(bloc.id, { fait: true }); setFeuille({ type: 'bloc' }) }}>Bloc fait <Coche taille={18} /></button>
        : (
          <div className="ec-st__nav" role="group" aria-label="Changer de bloc">
            <button type="button" className="ec-st__pas" onClick={() => aller(etape - 1)} disabled={etape === 0}><span aria-hidden="true">‹</span> Bloc précédent</button>
            <button type="button" className="ec-st__pas" onClick={suivant}>{libSuivant} <span aria-hidden="true">›</span></button>
          </div>
        )}

      {feuille && (
        <FeuilleEffort key={JSON.stringify(feuille)} feuille={feuille} bloc={bloc} lignes={lignes} notes={notes} resultat={resultats[bloc.id]} actions={actions}
          libSuivant={libSuivant} fermer={() => setFeuille(null)} blocSuivant={suivant} />
      )}
    </div>
  )
}

// ---------- Séries classiques : une carte par exercice ----------

function Series({ bloc, lignes, notes, actions, voirConsignes, ouvrir }) {
  const els = bloc.elements ?? []
  const [alerte, setAlerte] = useState('')
  // la série à faire : la première pas faite, dans l'ordre des exercices
  let actuelle = null
  for (const el of els) { const i = lignes(el).findIndex((l) => !l.fait); if (i >= 0) { actuelle = { id: el.id, i }; break } }
  const cocher = (el, i, l) => {
    if (l.fait) { actions.serie(el, i, 'fait', false); return }
    // fourchette (« 8 à 10 ») : le coaché écrit d'abord combien il en a fait
    if (!enDuree(el) && estFourchette(el.reps) && vide(l.reps)) { setAlerte(`${el.id}-${i}`); document.getElementById(`st-${el.id}-${i}`)?.focus(); return }
    setAlerte('')
    actions.serie(el, i, 'fait', true)
    // l'effort se note une fois, à la fin des séries de l'exercice (Marie, 22 novembre 2026)
    if (lignes(el).every((x, k) => k === i || x.fait)) ouvrir({ type: 'exo', id: el.id })
  }
  return els.map((el, e) => {
    const ls = lignes(el)
    const duree = enDuree(el)
    const cle = duree ? 'duree' : 'reps'
    const prevu = lignesExercice(el, true).prescription.replace(' · charge libre', '')
    const toutFait = ls.length > 0 && ls.every((l) => l.fait)
    const rpe = ls.map((l) => l.rpe).find((v) => !vide(v))
    const note = notes[el.id] ?? ''
    return (
      <section key={el.id} className="ec-st-carte" aria-labelledby={`st-nom-${el.id}`}>
        <Tete el={el} code={`${bloc.lettre}${e + 1}`} actif={actuelle?.id === el.id} prevu={[el.materiel && el.materiel !== 'À préciser' ? el.materiel : '', prevu, texteRepos(el.repos) ? `repos ${texteRepos(el.repos)}` : ''].filter(Boolean).join(' · ')} voirConsignes={voirConsignes} />
        <div className={`ec-st-cols${duree ? ' est-duree' : ''}`} aria-hidden="true"><span /><span>{duree ? 'Secondes' : 'Reps'}</span>{!duree && <span>{chargeParMain(el.materiel) ? 'Kg / main' : 'Kg'}</span>}<span /></div>
        {ls.map((l, i) => {
          const enCours = actuelle?.id === el.id && actuelle.i === i
          return (
            <div key={i} className={`ec-st-ligne${duree ? ' est-duree' : ''}${l.fait ? ' est-faite' : ''}${enCours ? ' est-en-cours' : ''}`} role="group" aria-label={`${el.nom}, série ${i + 1}`}>
              <span className="ec-st-num" aria-hidden="true">{l.fait ? <Coche taille={14} /> : i + 1}</span>
              <input id={`st-${el.id}-${i}`} className={`ec-st-champ${alerte === `${el.id}-${i}` ? ' est-a-remplir' : ''}`} type="text" inputMode={duree ? 'text' : 'numeric'} autoComplete="off"
                aria-label={`Série ${i + 1}, ${duree ? 'durée' : 'répétitions'}`} value={l[cle] ?? ''} placeholder={duree ? texteDuree(el.reps) : texteReps(el.reps)}
                onFocus={(ev) => ev.target.select()} onChange={(ev) => { setAlerte(''); actions.valeur(el, i, cle, ev.target.value) }} />
              {!duree && (
                <input className="ec-st-champ" type="text" inputMode="decimal" autoComplete="off" aria-label={`Série ${i + 1}, kilos${chargeParMain(el.materiel) ? ' par main' : ''}`}
                  value={l.charge ?? ''} placeholder={fr(el.charge ?? '') || '–'} onFocus={(ev) => ev.target.select()} onChange={(ev) => actions.valeur(el, i, 'charge', ev.target.value)} />
              )}
              <button type="button" className="ec-st-ok" aria-pressed={!!l.fait} aria-label={`Série ${i + 1} ${l.fait ? 'faite (toucher pour décocher)' : 'faite ?'}`} onClick={() => cocher(el, i, l)}><Coche /></button>
            </div>
          )
        })}
        {alerte.startsWith(el.id) && <p className="ec-st-alerte" role="alert">Notez d’abord vos répétitions faites</p>}
        {(toutFait || note) && (
          <div className="ec-st-pastilles">
            <button type="button" className={rpe ? 'est-rempli' : ''} onClick={() => ouvrir({ type: 'exo', id: el.id, correction: true })}>{rpe ? `RPE ${texteRpe(rpe)}` : '＋ Effort (RPE)'}</button>
            <button type="button" className={note ? 'est-rempli' : ''} onClick={() => ouvrir({ type: 'exo', id: el.id, correction: true })}>{note ? '✎ Note' : '＋ Note'}</button>
          </div>
        )}
      </section>
    )
  })
}

// En-tête d'un exercice : vignette (ouvre les photos et consignes), code, nom, matériel et prévu
function Tete({ el, code, actif, prevu, voirConsignes }) {
  // une photo pour chaque exercice, comme dans les supersets (Marie, 23 novembre 2026) : la case reste là même sans photo
  const photo = (el.photos ?? []).filter(Boolean)
  return (
    <button type="button" className="ec-st-tete2" onClick={() => voirConsignes(el)} aria-label={`${el.nom} : voir les photos et consignes`}>
      <span className="ec-st-tete2__img">
        {photo.length > 0 && <PhotoStockee chemin={photo[0]} alt="" />}
        <span className={`ec-st-code sur-photo${actif ? ' est-actif' : ''}`}>{code}</span>
        {photo.length > 1 && <em>1/{photo.length}</em>}
      </span>
      <span className="ec-st-tete2__txt">
        <span id={`st-nom-${el.id}`} className="ec-st-nom">{el.nom}</span>
        {prevu && <span className="ec-st-prevu">{prevu}</span>}
      </span>
    </button>
  )
}

// ---------- Biset, triset : une série (un passage sur chaque exercice) à la fois ----------
// Avant / après validé par Marie (22 novembre 2026) : les photos en haut, la série en cours ouverte avec un grand bouton
// « Série 2 faite », les séries faites résumées sur une ligne, celles à venir regroupées. L'effort se note à la fin du bloc.

function Tours({ bloc, lignes, notes, actions, voirConsignes, ouvrir }) {
  const els = bloc.elements ?? []
  const [alerte, setAlerte] = useState('')
  const [ouverte, setOuverte] = useState(-1) // série faite rouverte pour la corriger
  const nb = Math.max(0, ...els.map((e) => lignes(e).length))
  const serieFaite = (t) => els.every((e) => !lignes(e)[t] || lignes(e)[t].fait)
  const actuelle = Array.from({ length: nb }, (_, t) => t).find((t) => !serieFaite(t)) ?? -1
  const toutFait = nb > 0 && actuelle < 0
  const rpe = els.flatMap((e) => lignes(e).map((l) => l.rpe)).find((v) => !vide(v))
  const note = notes[bloc.id] ?? ''
  const valider = (t) => {
    const manque = els.find((e) => lignes(e)[t] && !enDuree(e) && estFourchette(e.reps) && vide(lignes(e)[t].reps))
    if (manque) { setAlerte(`${manque.id}-${t}`); document.getElementById(`st-${manque.id}-${t}`)?.focus(); return }
    setAlerte('')
    els.forEach((e) => { if (lignes(e)[t] && !lignes(e)[t].fait) actions.serie(e, t, 'fait', true) })
    // dernière série du bloc : l'effort et la note, une seule fois pour tout le bloc
    if (Array.from({ length: nb }, (_, k) => k).every((k) => k === t || serieFaite(k))) ouvrir({ type: 'superset' })
  }
  const decocher = (t) => { els.forEach((e) => { if (lignes(e)[t]?.fait) actions.serie(e, t, 'fait', false) }); setOuverte(-1) }
  const resume = (t) => els.filter((e) => lignes(e)[t]).map((e) => {
    const l = lignes(e)[t]
    const v = enDuree(e) ? (l.duree || l.reps) : l.reps
    return [v, vide(l.charge) ? '' : fr(l.charge)].filter((x) => !vide(x)).join('×')
  }).join(' · ')
  const lignesSerie = (t, enCours) => els.map((el, k) => {
    const l = lignes(el)[t]
    if (!l) return null
    const duree = enDuree(el)
    const cle = duree ? 'duree' : 'reps'
    return (
      <div key={el.id} className="ec-st-tl" role="group" aria-label={`Série ${t + 1}, ${el.nom}`}>
        <span className={`ec-st-code${enCours && k === 0 ? ' est-actif' : ''}`}>{bloc.lettre}{k + 1}</span>
        <span className="ec-st-tl__nom">{el.nom}{texteRepos(el.repos) && <small>repos {texteRepos(el.repos)}</small>}</span>
        <span className="ec-st-unite">
          <input id={`st-${el.id}-${t}`} className={`ec-st-champ${alerte === `${el.id}-${t}` ? ' est-a-remplir' : ''}`} type="text" inputMode={duree ? 'text' : 'numeric'} autoComplete="off"
            aria-label={`${el.nom}, série ${t + 1}, ${duree ? 'durée' : 'répétitions'}`} value={l[cle] ?? ''} placeholder={duree ? texteDuree(el.reps) : texteReps(el.reps)}
            onFocus={(ev) => ev.target.select()} onChange={(ev) => { setAlerte(''); actions.valeur(el, t, cle, ev.target.value) }} />
          <small>{duree ? 's' : 'reps'}</small>
        </span>
        {duree ? <span className="ec-st-champ est-neutre" aria-hidden="true">–</span> : (
          <span className="ec-st-unite">
            <input className="ec-st-champ" type="text" inputMode="decimal" autoComplete="off" aria-label={`${el.nom}, série ${t + 1}, kilos${chargeParMain(el.materiel) ? ' par main' : ''}`}
              value={l.charge ?? ''} placeholder={fr(el.charge ?? '') || '–'} onFocus={(ev) => ev.target.select()} onChange={(ev) => actions.valeur(el, t, 'charge', ev.target.value)} />
            <small>kg</small>
          </span>
        )}
      </div>
    )
  })
  const aVenir = Array.from({ length: nb }, (_, t) => t).filter((t) => t > actuelle && actuelle >= 0)
  return (
    <>
      <div className={`ec-st-photos ec-st-photos--${Math.min(els.length, 3)}`}>
        {els.map((el, k) => {
          const photo = (el.photos ?? []).filter(Boolean)[0]
          const prevu = lignesExercice(el, true).prescription.replace(' · charge libre', '')
          return (
            <button key={el.id} type="button" className="ec-st-photo" onClick={() => voirConsignes(el)} aria-label={`Voir les photos et consignes : ${el.nom}`}>
              <span className="ec-st-photo__img">{photo && <PhotoStockee chemin={photo} alt="" />}</span>
              <span className="ec-st-code sur-photo">{bloc.lettre}{k + 1}</span>
              <span className="ec-st-photo__nom">{el.nom}<small>{prevu}</small></span>
            </button>
          )
        })}
      </div>
      {Array.from({ length: nb }, (_, t) => t).filter((t) => serieFaite(t)).map((t) => (
        ouverte === t ? (
          <section key={t} className="ec-st-carte ec-st-serie" aria-label={`Série ${t + 1}, faite`}>
            <p className="ec-st-serie__tete est-faite"><span>Série {t + 1} · faite</span><button type="button" onClick={() => setOuverte(-1)}>Fermer</button></p>
            {lignesSerie(t, false)}
            <button type="button" className="ec-st-lien ec-st-serie__decocher" onClick={() => decocher(t)}>Décocher cette série</button>
          </section>
        ) : (
          <button key={t} type="button" className="ec-st-faite" onClick={() => setOuverte(t)} aria-label={`Série ${t + 1} faite : ${resume(t)}. Toucher pour corriger`}>
            <span className="ec-st-faite__ok" aria-hidden="true"><Coche taille={13} /></span>
            <b>Série {t + 1}</b>
          </button>
        )
      ))}
      {actuelle >= 0 && (
        <section className="ec-st-carte ec-st-serie" aria-label={`Série ${actuelle + 1} sur ${nb}, en cours`}>
          <p className="ec-st-serie__tete"><span>Série {actuelle + 1} sur {nb}</span></p>
          {lignesSerie(actuelle, true)}
          {alerte && <p className="ec-st-alerte" role="alert">Notez d’abord vos répétitions faites</p>}
          <button type="button" className="ec-st__gros ec-st-serie__ok" onClick={() => valider(actuelle)}>Terminé <Coche taille={18} /></button>
        </section>
      )}
      {aVenir.length > 0 && (
        <p className="ec-st-avenir">{aVenir.length === 1 ? `Série ${aVenir[0] + 1} à venir` : `Séries ${aVenir.map((t) => t + 1).join(' · ')} à venir`}</p>
      )}
      {toutFait && (
        <div className="ec-st-pastilles">
          <button type="button" className={rpe ? 'est-rempli' : ''} onClick={() => ouvrir({ type: 'superset', correction: true })}>{rpe ? `RPE ${texteRpe(rpe)}` : '＋ Effort (RPE)'}</button>
          <button type="button" className={note ? 'est-rempli' : ''} onClick={() => ouvrir({ type: 'superset', correction: true })}>{note ? '✎ Note' : '＋ Note'}</button>
        </div>
      )}
    </>
  )
}

// ---------- EMOM, AMRAP, TABATA, HIIT ----------

const PHRASES = { emom: 'Au début de chaque minute :', amrap: 'Un maximum de tours de :', tabata: 'Enchaînez :', hiit: 'Enchaînez :' }

function Chrono({ bloc, resultat, actions, voirConsignes, ouvrir }) {
  const els = bloc.elements ?? []
  const r = resultat ?? {}
  return (
    <section className="ec-st-carte" aria-label={resumeFormat(bloc)}>
      <div className="ec-st-noir">
        <span>{resumeFormat(bloc)}</span>
        {PHRASES[bloc.format] && <p>{PHRASES[bloc.format]}</p>}
      </div>
      <ul className="ec-st-exos">
        {els.map((el, k) => (
          <li key={el.id}>
            <button type="button" onClick={() => voirConsignes(el)} aria-label={`${el.nom} : voir les photos et consignes`}>
              {(el.photos ?? []).filter(Boolean)[0]
                ? <span className="ec-st-mini"><PhotoStockee chemin={el.photos.filter(Boolean)[0]} alt="" /></span>
                : <span className="ec-st-code">{bloc.lettre}{k + 1}</span>}
              <b>{el.nom}</b>
              <em>{lignesExercice(el, false).prescription}</em>
            </button>
          </li>
        ))}
      </ul>
      <div className="ec-st-resultat">
        {champsResultat(bloc).map((c) => (
          <label key={c.cle}>
            <span>{c.label}</span>
            <input className="ec-st-champ" type="text" inputMode="numeric" autoComplete="off" value={r[c.cle] ?? ''} placeholder={c.aide}
              onFocus={(ev) => ev.target.select()} onChange={(ev) => actions.blocValeurs(bloc.id, { [c.cle]: ev.target.value })} />
          </label>
        ))}
      </div>
      {r.fait && (
        <div className="ec-st-pastilles">
          <button type="button" className={vide(r.rpe) ? '' : 'est-rempli'} onClick={() => ouvrir({ type: 'bloc', correction: true })}>{vide(r.rpe) ? '＋ Effort (RPE)' : `RPE ${texteRpe(r.rpe)}`}</button>
          <button type="button" className={vide(r.note) ? '' : 'est-rempli'} onClick={() => ouvrir({ type: 'bloc', correction: true })}>{vide(r.note) ? '＋ Note' : '✎ Note'}</button>
        </div>
      )}
    </section>
  )
}

// ---------- Bulle du bas : effort ressenti et note ----------

// Échelle de l'effort ressenti, donnée par Marie (22 novembre 2026)
const ECHELLE = [
  ['0', 'Aucun effort'], ['1', 'Très très facile'], ['2', 'Très facile'], ['3', 'Facile'], ['4', 'Effort modéré'], ['5', 'Moyen'],
  ['6', 'Un peu dur'], ['7', 'Dur'], ['8', 'Très dur'], ['9', 'Très très dur'], ['10', 'Maximal'],
]

function FeuilleEffort({ feuille, bloc, lignes, notes, resultat, actions, libSuivant, fermer, blocSuivant }) {
  const ref = useRef(null)
  const els = bloc.elements ?? []
  const el = els.find((e) => e.id === feuille.id)
  // valeurs de départ : ce qui est déjà noté. Un exercice (séries) ou tout le bloc (biset, EMOM…) : un seul effort, une seule note.
  const premierRpe = (liste) => liste.flatMap((e) => lignes(e).map((l) => l.rpe)).find((v) => !vide(v)) ?? ''
  const depart = feuille.type === 'exo' ? { rpe: premierRpe([el]), note: notes[el.id] ?? '' }
    : feuille.type === 'superset' ? { rpe: premierRpe(els), note: notes[bloc.id] ?? '' }
      : feuille.type === 'bloc' ? { rpe: resultat?.rpe ?? '', note: resultat?.note ?? '' }
        : { rpe: '', note: notes[feuille.id] ?? '' }
  const [rpe, setRpe] = useState(String(depart.rpe ?? ''))
  const [note, setNote] = useState(String(depart.note ?? ''))
  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
    return () => { if (d?.open) d.close() }
  }, [])

  const blocFini = els.every((e) => lignes(e).every((l) => l.fait))
  const correction = !!feuille.correction
  const bouton = correction ? 'Enregistrer' : feuille.type === 'exo' && !blocFini ? 'Enregistrer' : `${libSuivant} ›`
  const avecRpe = feuille.type !== 'note'

  const enregistrer = () => {
    if (feuille.type === 'exo') {
      if (String(rpe) !== String(depart.rpe ?? '')) actions.rpeExercice(el, rpe)
      if (note !== String(depart.note ?? '')) actions.note(el.id, note)
    } else if (feuille.type === 'superset') {
      if (String(rpe) !== String(depart.rpe ?? '')) els.forEach((e) => actions.rpeExercice(e, rpe))
      if (note !== String(depart.note ?? '')) actions.note(bloc.id, note)
    } else if (feuille.type === 'bloc') {
      actions.blocValeurs(bloc.id, { rpe, note })
    } else {
      actions.note(feuille.id, note)
    }
  }
  const valider = () => {
    enregistrer()
    fermer()
    // bloc terminé : on passe au bloc suivant
    if (!correction && (feuille.type !== 'exo' || blocFini)) blocSuivant()
  }

  return (
    <dialog ref={ref} className="ec-tuto ec-st-feuille" aria-label={avecRpe ? 'Effort ressenti et note' : 'Note'} onClose={fermer}
      onClick={(e) => { if (e.target === e.currentTarget) fermer() }}>
      <div className="ec-tuto__corps">
        <span className="ec-tuto__poignee" aria-hidden="true" />
        {avecRpe && (
          <>
            <p className="ec-st-feuille__lab" id="st-rpe">Effort ressenti (RPE)</p>
            <p className="ec-st-legende" aria-hidden="true"><span>Facile</span><span>Maximal</span></p>
            {/* l'échelle de Marie (22 novembre 2026) : 0 aucun effort … 10 maximal, chaque chiffre avec sa couleur */}
            <div className="ec-st-rpe" role="radiogroup" aria-labelledby="st-rpe">
              {ECHELLE.map(([v, texte]) => (
                <button key={v} type="button" role="radio" className={`rpe-${v}`} aria-checked={String(rpe) === v} aria-label={`${v} : ${texte}`}
                  onClick={() => setRpe(String(rpe) === v ? '' : v)}>{v}</button>
              ))}
            </div>
            <p className={`ec-st-rpe__texte${rpe !== '' ? ` rpe-${rpe}` : ''}`} aria-live="polite">
              {ECHELLE.find(([v]) => v === String(rpe))?.[1] ?? ''}
            </p>
          </>
        )}
        <label className="ec-st-feuille__lab" htmlFor="st-note">Note</label>
        <textarea id="st-note" className="ec-st-note" rows={2} value={note} placeholder="Facultatif" onChange={(e) => setNote(e.target.value)} />
        <div className="ec-st-feuille__boutons">
          <button type="button" className="ec-st-pas" onClick={fermer}>{correction ? 'Annuler' : 'Passer'}</button>
          <button type="button" className="ec-st-pas est-jaune" onClick={valider}>{bouton}</button>
        </div>
      </div>
    </dialog>
  )
}
