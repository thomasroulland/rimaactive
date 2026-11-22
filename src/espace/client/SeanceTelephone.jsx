import { useEffect, useRef, useState } from 'react'
import PhotoStockee from '../coach/PhotoStockee.jsx'
import { nomBloc } from '../donnees/programme.js'
import { champsResultat, enDuree, estEnSeries, estFourchette, fr, lignesExercice, resumeFormat, texteDuree, texteReps } from '../donnees/seances.js'
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
    ouvrir({ type: 'serie', id: el.id, i })
  }
  return els.map((el, e) => {
    const ls = lignes(el)
    const duree = enDuree(el)
    const cle = duree ? 'duree' : 'reps'
    const prevu = lignesExercice(el, true).prescription.replace(' · charge libre', '')
    const faites = ls.map((l, i) => ({ l, i })).filter((x) => x.l.fait)
    const note = notes[el.id] ?? ''
    return (
      <section key={el.id} className="ec-st-carte" aria-labelledby={`st-nom-${el.id}`}>
        <Tete el={el} code={`${bloc.lettre}${e + 1}`} actif={actuelle?.id === el.id} prevu={[el.materiel && el.materiel !== 'À préciser' ? el.materiel : '', prevu ? `prévu ${prevu}` : ''].filter(Boolean).join(' · ')} voirConsignes={voirConsignes} />
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
        {(faites.length > 0 || note) && (
          <div className="ec-st-pastilles">
            {faites.filter((x) => !vide(x.l.rpe)).map((x) => (
              <button key={x.i} type="button" className="est-rempli" onClick={() => ouvrir({ type: 'serie', id: el.id, i: x.i, correction: true })}>S{x.i + 1} · RPE {texteRpe(x.l.rpe)}</button>
            ))}
            <button type="button" className={note ? 'est-rempli' : ''} onClick={() => ouvrir({ type: 'note', id: el.id })}>{note ? '✎ Note' : '＋ Note'}</button>
          </div>
        )}
      </section>
    )
  })
}

// En-tête d'un exercice : vignette (ouvre les photos et consignes), code, nom, matériel et prévu
function Tete({ el, code, actif, prevu, voirConsignes }) {
  const photo = (el.photos ?? []).filter(Boolean)
  return (
    <div className="ec-st-tete">
      {photo.length > 0
        ? (
          <button type="button" className="ec-st-vignette" onClick={() => voirConsignes(el)} aria-label={`Voir les photos et consignes : ${el.nom}`}>
            <PhotoStockee chemin={photo[0]} alt="" classe="ec-st-vignette__img" />
            {photo.length > 1 && <em>1/{photo.length}</em>}
          </button>
        )
        : <span className={`ec-st-code${actif ? ' est-actif' : ''}`}>{code}</span>}
      <div className="ec-st-tete__txt">
        <h3 id={`st-nom-${el.id}`} className="ec-st-nom">{photo.length > 0 && <span className={`ec-st-code ec-st-code--petit${actif ? ' est-actif' : ''}`}>{code}</span>}{el.nom}</h3>
        {prevu && <p className="ec-st-prevu">{prevu}</p>}
        {photo.length === 0 && String(el.consignes ?? '').trim() && <button type="button" className="ec-st-lien" onClick={() => voirConsignes(el)}>Voir les consignes</button>}
      </div>
    </div>
  )
}

// ---------- Biset, triset : rangé par tour, un ✓ par tour ----------

function Tours({ bloc, lignes, notes, actions, voirConsignes, ouvrir }) {
  const els = bloc.elements ?? []
  const [alerte, setAlerte] = useState('')
  const nbTours = Math.max(0, ...els.map((e) => lignes(e).length))
  const tourFait = (t) => els.every((e) => !lignes(e)[t] || lignes(e)[t].fait)
  const actuel = Array.from({ length: nbTours }, (_, t) => t).find((t) => !tourFait(t)) ?? -1
  const note = notes[bloc.id] ?? ''
  const cocher = (t) => {
    if (tourFait(t)) { els.forEach((e) => { if (lignes(e)[t]) actions.serie(e, t, 'fait', false) }); return }
    const manque = els.find((e) => lignes(e)[t] && !enDuree(e) && estFourchette(e.reps) && vide(lignes(e)[t].reps))
    if (manque) { setAlerte(`${manque.id}-${t}`); document.getElementById(`st-${manque.id}-${t}`)?.focus(); return }
    setAlerte('')
    els.forEach((e) => { if (lignes(e)[t] && !lignes(e)[t].fait) actions.serie(e, t, 'fait', true) })
    ouvrir({ type: 'tour', t })
  }
  return (
    <>
      <div className={`ec-st-photos ec-st-photos--${Math.min(els.length, 3)}`}>
        {els.map((el, k) => {
          const photo = (el.photos ?? []).filter(Boolean)[0]
          const prevu = lignesExercice(el, true).prescription.replace(' · charge libre', '')
          return (
            <button key={el.id} type="button" className="ec-st-photo" onClick={() => voirConsignes(el)} aria-label={`Voir les photos et consignes : ${el.nom}`}>
              {photo && <span className="ec-st-photo__img"><PhotoStockee chemin={photo} alt="" /></span>}
              <span className={`ec-st-code${photo ? ' sur-photo' : ''}`}>{bloc.lettre}{k + 1}</span>
              <span className="ec-st-photo__nom">{el.nom}<small>{[el.materiel && el.materiel !== 'À préciser' && el.materiel !== 'Poids du corps' ? el.materiel : '', prevu].filter(Boolean).join(' · ')}</small></span>
            </button>
          )
        })}
      </div>
      <section className="ec-st-carte ec-st-tours" aria-label={`${nomSuperset(bloc)} : ${nbTours} tours`}>
        {Array.from({ length: nbTours }, (_, t) => {
          const fait = tourFait(t)
          const enCours = t === actuel
          const rpe = els.map((e) => lignes(e)[t]?.rpe).find((v) => !vide(v))
          return (
            <div key={t} className={`ec-st-tour${fait ? ' est-fait' : ''}${enCours ? ' est-en-cours' : ''}${!fait && !enCours ? ' est-a-venir' : ''}`}>
              <p className="ec-st-tour__tete">
                <span>{enCours ? `Tour ${t + 1} sur ${nbTours}` : `Tour ${t + 1}`}</span>
                {fait
                  ? <button type="button" onClick={() => ouvrir({ type: 'tour', t, correction: true })}>{rpe ? `RPE ${texteRpe(rpe)} · ` : ''}fait</button>
                  : enCours ? <span>en cours</span> : null}
              </p>
              <div className="ec-st-tour__corps">
                <div className="ec-st-tour__lignes">
                  {els.map((el, k) => {
                    const l = lignes(el)[t]
                    if (!l) return null
                    const duree = enDuree(el)
                    const cle = duree ? 'duree' : 'reps'
                    return (
                      <div key={el.id} className="ec-st-tl" role="group" aria-label={`Tour ${t + 1}, ${el.nom}`}>
                        <span className={`ec-st-code${enCours && k === 0 ? ' est-actif' : ''}`}>{bloc.lettre}{k + 1}</span>
                        <span className="ec-st-tl__nom">{el.nom}</span>
                        <span className="ec-st-unite">
                          <input id={`st-${el.id}-${t}`} className={`ec-st-champ${alerte === `${el.id}-${t}` ? ' est-a-remplir' : ''}`} type="text" inputMode={duree ? 'text' : 'numeric'} autoComplete="off"
                            aria-label={`${el.nom}, tour ${t + 1}, ${duree ? 'durée' : 'répétitions'}`} value={l[cle] ?? ''} placeholder={duree ? texteDuree(el.reps) : texteReps(el.reps)}
                            onFocus={(ev) => ev.target.select()} onChange={(ev) => { setAlerte(''); actions.valeur(el, t, cle, ev.target.value) }} />
                          {duree && <small>s</small>}
                        </span>
                        {duree ? <span className="ec-st-champ est-neutre" aria-hidden="true">–</span> : (
                          <span className="ec-st-unite">
                            <input className="ec-st-champ" type="text" inputMode="decimal" autoComplete="off" aria-label={`${el.nom}, tour ${t + 1}, kilos${chargeParMain(el.materiel) ? ' par main' : ''}`}
                              value={l.charge ?? ''} placeholder={fr(el.charge ?? '') || '–'} onFocus={(ev) => ev.target.select()} onChange={(ev) => actions.valeur(el, t, 'charge', ev.target.value)} />
                            <small>kg</small>
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
                <button type="button" className="ec-st-ok ec-st-ok--tour" aria-pressed={fait} aria-label={`Tour ${t + 1} ${fait ? 'fait (toucher pour décocher)' : 'fait ?'}`} onClick={() => cocher(t)}><Coche taille={24} /></button>
              </div>
              {alerte.endsWith(`-${t}`) && <p className="ec-st-alerte" role="alert">Notez d’abord vos répétitions faites</p>}
            </div>
          )
        })}
        {(note || actuel !== 0) && (
          <div className="ec-st-pastilles">
            <button type="button" className={note ? 'est-rempli' : ''} onClick={() => ouvrir({ type: 'note', id: bloc.id })}>{note ? '✎ Note' : '＋ Note'}</button>
          </div>
        )}
      </section>
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

function FeuilleEffort({ feuille, bloc, lignes, notes, resultat, actions, libSuivant, fermer, blocSuivant }) {
  const ref = useRef(null)
  const els = bloc.elements ?? []
  const el = els.find((e) => e.id === feuille.id)
  // valeurs de départ : ce qui est déjà noté
  const depart = (() => {
    if (feuille.type === 'serie') return { rpe: lignes(el)[feuille.i]?.rpe ?? '', note: notes[el.id] ?? '' }
    if (feuille.type === 'tour') return { rpe: els.map((e) => lignes(e)[feuille.t]?.rpe).find((v) => !vide(v)) ?? '', note: notes[bloc.id] ?? '' }
    if (feuille.type === 'bloc') return { rpe: resultat?.rpe ?? '', note: resultat?.note ?? '' }
    return { rpe: '', note: notes[feuille.id] ?? '' }
  })()
  const [rpe, setRpe] = useState(String(depart.rpe ?? ''))
  const [note, setNote] = useState(String(depart.note ?? ''))
  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
    return () => { if (d?.open) d.close() }
  }, [])

  // reste-t-il quelque chose à faire dans ce bloc ? (pour le libellé du bouton jaune)
  const resteSerie = (() => {
    if (feuille.type === 'serie') return els.some((e) => lignes(e).some((l, i) => !l.fait && !(e.id === feuille.id && i === feuille.i)))
    if (feuille.type === 'tour') return els.some((e) => lignes(e).some((l, i) => !l.fait && i !== feuille.t))
    return false
  })()
  const correction = feuille.correction || feuille.type === 'note'
  const bouton = correction ? 'Enregistrer' : feuille.type === 'serie' ? (resteSerie ? 'Série suivante ›' : `${libSuivant} ›`)
    : feuille.type === 'tour' ? (resteSerie ? 'Tour suivant ›' : `${libSuivant} ›`) : `${libSuivant} ›`
  const avecRpe = feuille.type !== 'note'

  const enregistrer = () => {
    if (feuille.type === 'serie') {
      if (String(rpe) !== String(depart.rpe ?? '')) actions.valeur(el, feuille.i, 'rpe', rpe)
      if (note !== String(depart.note ?? '')) actions.note(el.id, note)
    } else if (feuille.type === 'tour') {
      if (String(rpe) !== String(depart.rpe ?? '')) els.forEach((e) => { if (lignes(e)[feuille.t]) actions.valeur(e, feuille.t, 'rpe', rpe) })
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
    // dernière série, dernier tour ou bloc EMOM… : on passe au bloc suivant
    if (!correction && (feuille.type === 'bloc' || !resteSerie)) blocSuivant()
  }

  return (
    <dialog ref={ref} className="ec-tuto ec-st-feuille" aria-label={avecRpe ? 'Effort ressenti et note' : 'Note'} onClose={fermer}
      onClick={(e) => { if (e.target === e.currentTarget) fermer() }}>
      <div className="ec-tuto__corps">
        <span className="ec-tuto__poignee" aria-hidden="true" />
        {avecRpe && (
          <>
            <p className="ec-st-feuille__lab" id="st-rpe">Effort ressenti (RPE)</p>
            <div className="ec-st-rpe" role="radiogroup" aria-labelledby="st-rpe">
              {Array.from({ length: 10 }, (_, k) => String(k + 1)).map((v) => (
                <button key={v} type="button" role="radio" aria-checked={String(rpe) === v} onClick={() => setRpe(String(rpe) === v ? '' : v)}>{v}</button>
              ))}
            </div>
            <p className="ec-st-legende" aria-hidden="true"><span>Facile</span><span>Maximal</span></p>
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
