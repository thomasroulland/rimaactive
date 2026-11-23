import MotSemaine from './MotSemaine.jsx'
import { useEffect, useRef, useState } from 'react'
import PhotoStockee from '../coach/PhotoStockee.jsx'
import { nomBloc } from '../donnees/programme.js'
import { champsResultat, enDuree, estEnSeries, estFourchette, fr, lignesExercice, resumeFormat, texteDuree, texteRepos, texteReps } from '../donnees/seances.js'
import { chargeParMain } from '../donnees/banque.js'

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

export default function BlocTelephone({ bloc, etape, blocs, prog, lignes, notes, resultats, actions, voirConsignes, aller, finir, retour, semaine }) {
  const [plan, setPlan] = useState(false)
  const [feuille, setFeuille] = useState(null) // { type: 'serie' | 'tour' | 'bloc' | 'note', ... }
  const nb = blocs.length
  const dernier = etape >= nb - 1
  const suivant = () => (dernier ? finir() : aller(etape + 1))
  const libSuivant = dernier ? 'Fin de séance' : 'Bloc suivant'
  const els = bloc.elements ?? []
  const enSeries = estEnSeries(bloc.format)

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
              {/* le plan : les blocs et leur nombre d'exercices, sans le détail (23 novembre 2026) */}
              <span>{prog.blocs[i]?.complet ? '✓ ' : ''}{nomBloc(b)}</span><span>{(b.elements ?? []).length} exercice{(b.elements ?? []).length > 1 ? 's' : ''}</span></button></li>
          ))}
          <li><button type="button" onClick={finir}><span>Fin de séance</span></button></li>
        </ul>
      )}
      {/* au premier bloc : le mot de Marie pour la semaine et le RPE visé (23 novembre 2026) */}
      {etape === 0 && <MotSemaine semaine={semaine} classe="ec-motsem--seance" />}
      {/* seulement le nom du bloc de Marie, sans « Biset », « Séries »… (23 novembre 2026) */}
      <p className="ec-st__sur">{nomBloc(bloc)}</p>

      {els.length === 0
        ? <p className="ec-texte">Ce bloc n’a pas encore d’exercice.</p>
        : enSeries
            ? <Series bloc={bloc} lignes={lignes} notes={notes} actions={actions} voirConsignes={voirConsignes} ouvrir={setFeuille} />
            : <Chrono bloc={bloc} resultat={resultats[bloc.id]} actions={actions} voirConsignes={voirConsignes} ouvrir={setFeuille} />}

      {/* bloc EMOM, AMRAP… pas encore fait : un seul gros bouton. Plus de « Bloc précédent / Bloc suivant » (Marie, 23 novembre 2026) :
          on change de bloc avec « Plan » ou les traits du haut, et la fenêtre de l'effort propose le bloc suivant */}
      {!enSeries && !resultats[bloc.id]?.fait && els.length > 0 && (
        <button type="button" className="ec-st__gros" onClick={() => { actions.blocValeurs(bloc.id, { fait: true }); setFeuille({ type: 'bloc' }) }}>Bloc fait <Coche taille={18} /></button>
      )}

      {feuille && (
        <FeuilleEffort key={JSON.stringify(feuille)} feuille={feuille} bloc={bloc} lignes={lignes} notes={notes} resultat={resultats[bloc.id]} actions={actions}
          libSuivant={libSuivant} fermer={() => setFeuille(null)} blocSuivant={suivant} />
      )}
    </div>
  )
}

// ---------- Séries et supersets : le même écran (Marie, 23 novembre 2026) ----------
// Les photos en haut (nom, matériel, séries × reps), puis une seule série ouverte avec « Terminé ». Les séries faites
// tiennent sur une ligne avec ce qui a été fait ; les suivantes sont regroupées. Rien n'est rempli à la place du coaché :
// ce qu'il note pour une série est seulement proposé dans la suivante. L'effort se note une fois, à la fin.
// Séries classiques : un exercice après l'autre ; superset : les exercices du bloc enchaînés dans chaque série.

const materielDe = (el) => (el.materiel && el.materiel !== 'À préciser' ? el.materiel : '')

function Series({ bloc, lignes, notes, actions, voirConsignes, ouvrir }) {
  const els = bloc.elements ?? []
  if (bloc.format === 'superset') {
    return <Enchainement bloc={bloc} groupe={els.map((el, k) => ({ el, code: `${bloc.lettre}${k + 1}` }))} lignes={lignes} notes={notes} noteId={bloc.id} fin="superset" actions={actions} voirConsignes={voirConsignes} ouvrir={ouvrir} actif />
  }
  // séries classiques : l'exercice en cours est le premier qui n'est pas fini
  const enCours = els.findIndex((el) => lignes(el).some((l) => !l.fait))
  return els.map((el, k) => (
    <Enchainement key={el.id} bloc={bloc} groupe={[{ el, code: `${bloc.lettre}${k + 1}` }]} lignes={lignes} notes={notes} noteId={el.id} fin="exo" actions={actions}
      voirConsignes={voirConsignes} ouvrir={ouvrir} actif={k === enCours} />
  ))
}

function Enchainement({ groupe, lignes, notes, noteId, fin, actions, voirConsignes, ouvrir, actif }) {
  const [alerte, setAlerte] = useState('')
  const [ouverte, setOuverte] = useState(-1) // série faite rouverte pour la corriger
  const nb = Math.max(0, ...groupe.map(({ el }) => lignes(el).length))
  const serieFaite = (t) => groupe.every(({ el }) => !lignes(el)[t] || lignes(el)[t].fait)
  const actuelle = Array.from({ length: nb }, (_, t) => t).find((t) => !serieFaite(t)) ?? -1
  const toutFait = nb > 0 && actuelle < 0
  const rpe = groupe.flatMap(({ el }) => lignes(el).map((l) => l.rpe)).find((v) => !vide(v))
  const note = notes[noteId] ?? ''
  const parMain = groupe.length === 1 && chargeParMain(groupe[0].el.materiel)
  const sansCharge = groupe.every(({ el }) => enDuree(el))
  const valider = (t) => {
    // le coaché écrit ce qu'il a fait : répétitions (ou durée) obligatoires, la charge peut rester vide (poids du corps)
    const manque = groupe.find(({ el }) => { const l = lignes(el)[t]; return l && vide(enDuree(el) ? (l.duree || l.reps) : l.reps) })
    if (manque) { setAlerte(`${manque.el.id}-${t}`); document.getElementById(`st-${manque.el.id}-${t}`)?.focus(); return }
    setAlerte('')
    groupe.forEach(({ el }) => { if (lignes(el)[t] && !lignes(el)[t].fait) actions.terminerSerie(el, t) })
    if (Array.from({ length: nb }, (_, k) => k).every((k) => k === t || serieFaite(k))) ouvrir(fin === 'exo' ? { type: 'exo', id: noteId } : { type: 'superset' })
  }
  const decocher = (t) => { groupe.forEach(({ el }) => { if (lignes(el)[t]?.fait) actions.decocherSerie(el, t) }); setOuverte(-1) }
  const lignesSerie = (t, enCours) => groupe.map(({ el, code }, k) => {
    const l = lignes(el)[t]
    if (!l) return null
    const duree = enDuree(el)
    const cle = duree ? 'duree' : 'reps'
    const precedente = t > 0 ? lignes(el)[t - 1] : null
    return (
      <div key={el.id} className={`ec-st-tl${sansCharge ? ' sans-charge' : ''}`} role="group" aria-label={`Série ${t + 1}, ${el.nom}`}>
        <span className={`ec-st-code${enCours && k === 0 ? ' est-actif' : ''}`}>{code}</span>
        <span className="ec-st-tl__nom">{el.nom}{texteRepos(el.repos) && <small>repos {texteRepos(el.repos)}</small>}</span>
        <input id={`st-${el.id}-${t}`} className={`ec-st-champ${alerte === `${el.id}-${t}` ? ' est-a-remplir' : ''}`} type="text" inputMode={duree ? 'text' : 'numeric'} autoComplete="off"
          aria-label={`${el.nom}, série ${t + 1}, ${duree ? 'durée' : 'répétitions faites'}`} value={l[cle] ?? ''} placeholder={precedente?.[cle] || ''}
          onFocus={(ev) => ev.target.select()} onChange={(ev) => { setAlerte(''); actions.valeur(el, t, cle, ev.target.value) }} />
        {!sansCharge && (duree ? <span className="ec-st-champ est-neutre" aria-hidden="true">–</span> : (
          <input className="ec-st-champ" type="text" inputMode="decimal" autoComplete="off" aria-label={`${el.nom}, série ${t + 1}, kilos${chargeParMain(el.materiel) ? ' par main' : ''}`}
            value={l.charge ?? ''} placeholder={precedente?.charge || ''} onFocus={(ev) => ev.target.select()} onChange={(ev) => actions.valeur(el, t, 'charge', ev.target.value)} />
        ))}
      </div>
    )
  })
  const entete = (
    <div className={`ec-st-tl ec-st-tl--tete${sansCharge ? ' sans-charge' : ''}`} aria-hidden="true">
      <span /><span /><span>{groupe.some(({ el }) => !enDuree(el)) ? 'Reps' : 'Durée'}</span>{!sansCharge && <span>{parMain ? 'Kg / main' : 'Kg'}</span>}
    </div>
  )
  return (
    <div className="ec-st-groupe">
      <div className={`ec-st-photos ec-st-photos--${Math.min(groupe.length, 3)}`}>
        {groupe.map(({ el, code }) => {
          const photo = (el.photos ?? []).filter(Boolean)[0]
          const { prescription, details } = lignesExercice(el, true)
          const prevu = prescription.replace(' · charge libre', '')
          // tempo et RPE à suivre (le repos est déjà sous le nom, dans la série) et le commentaire de Marie (23 novembre 2026)
          const reperes = details.split(' · ').filter((d) => d && !d.startsWith('Repos'))
          const commentaire = (el.commentaire ?? '').trim()
          return (
            <button key={el.id} type="button" className="ec-st-photo" onClick={() => voirConsignes(el)} aria-label={`Voir les photos et consignes : ${el.nom}`}>
              <span className="ec-st-photo__img">{photo ? <PhotoStockee chemin={photo} alt="" /> : <span className="ec-st-photo__vide">Photos à venir</span>}</span>
              <span className="ec-st-code sur-photo">{code}</span>
              <span className="ec-st-photo__nom">{el.nom}<small>{[materielDe(el), prevu].filter(Boolean).join(' · ')}</small>
                {reperes.length > 0 && <span className="ec-st-reperes">{reperes.map((r) => <span key={r}>{r}</span>)}</span>}
                {commentaire && <span className="ec-st-com">{commentaire}</span>}
              </span>
            </button>
          )
        })}
      </div>
      {Array.from({ length: nb }, (_, t) => t).filter((t) => serieFaite(t)).map((t) => (
        ouverte === t ? (
          <section key={t} className="ec-st-carte ec-st-serie" aria-label={`Série ${t + 1}, faite`}>
            <p className="ec-st-serie__tete est-faite"><span>Série {t + 1} · faite</span><button type="button" onClick={() => setOuverte(-1)}>Fermer</button></p>
            {entete}
            {lignesSerie(t, false)}
            <button type="button" className="ec-st-lien ec-st-serie__decocher" onClick={() => decocher(t)}>Décocher cette série</button>
          </section>
        ) : (
          <button key={t} type="button" className="ec-st-faite" onClick={() => setOuverte(t)} aria-label={`Série ${t + 1} faite. Toucher pour corriger`}>
            <span className="ec-st-faite__ok" aria-hidden="true"><Coche taille={13} /></span>
            <b>Série {t + 1}</b>
          </button>
        )
      ))}
      {actif && actuelle >= 0 && (
        <section className="ec-st-carte ec-st-serie" aria-label={`Série ${actuelle + 1} sur ${nb}`}>
          <p className="ec-st-serie__tete"><span>Série {actuelle + 1} sur {nb}</span></p>
          {entete}
          {lignesSerie(actuelle, true)}
          {alerte && <p className="ec-st-alerte" role="alert">Notez le nombre de répétitions faites.</p>}
          <button type="button" className="ec-st__gros ec-st-serie__ok" onClick={() => valider(actuelle)}>Terminé <Coche taille={18} /></button>
        </section>
      )}
      {/* plus de « Séries 2 · 3 à venir » (Marie, 23 novembre 2026) : le plan suffit */}
      {toutFait && (
        <div className="ec-st-pastilles">
          {/* une seule bulle « RPE » : elle ouvre l'effort et la note (Marie, 23 novembre 2026) */}
          <button type="button" className={rpe || note ? 'est-rempli' : ''} onClick={() => ouvrir(fin === 'exo' ? { type: 'exo', id: noteId, correction: true } : { type: 'superset', correction: true })}>{rpe ? `RPE ${texteRpe(rpe)}` : 'RPE'}</button>
        </div>
      )}
    </div>
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
          <button type="button" className={vide(r.rpe) && vide(r.note) ? '' : 'est-rempli'} onClick={() => ouvrir({ type: 'bloc', correction: true })}>{vide(r.rpe) ? 'RPE' : `RPE ${texteRpe(r.rpe)}`}</button>
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
