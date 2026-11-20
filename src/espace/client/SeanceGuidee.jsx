import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PhotoStockee from '../coach/PhotoStockee.jsx'
import { nomBloc } from '../donnees/programme.js'
import { enDuree, estFourchette, fr, lignesExercice, resumeFormat, texteDuree, texteReps } from '../donnees/seances.js'
import { ChoixRpe } from './BlocResultat.jsx'
import { chargeParMain } from '../donnees/banque.js'

// Séance du coaché, version simple (15 novembre 2026, choix de Thomas) :
// - téléphone : un exercice à la fois, un seul gros bouton « Série faite » (UnExercice) ;
// - ordinateur : tout le bloc en liste, avec un bandeau noir en haut (BandeauBloc + ListeBloc).
// Plus de minuteur ni de temps de repos : le repos reste une indication de Marie dans son programme, il n'est plus affiché ici.

// Téléphone ou ordinateur : même seuil que les autres écrans de l'espace
export function useMobile() {
  const requete = '(max-width: 899px)'
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia(requete).matches)
  useEffect(() => {
    const m = window.matchMedia(requete)
    const maj = () => setMobile(m.matches)
    m.addEventListener?.('change', maj)
    return () => m.removeEventListener?.('change', maj)
  }, [])
  return mobile
}

const Coche = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
)
const Image = () => (
  <svg viewBox="0 0 256 256" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="40" y="48" width="176" height="160" rx="16" /><circle cx="96" cy="100" r="16" /><path d="M40 176l56-56 40 40 32-32 48 48" /></svg>
)


// Gros bouton unique de la page
export function Gros({ children, onClick, discret = false, desactive = false }) {
  return <button type="button" className={`ec-s2-gros${discret ? ' est-discret' : ''}`} onClick={onClick} disabled={desactive}>{children}</button>
}

// ---------- Ordinateur ----------

// Bandeau noir : séance, nom du bloc, avancement, et les blocs en pastilles pour changer de bloc
export function BandeauBloc({ surtitre, bloc, prog, etape, blocs, aller, finir, verrou }) {
  const p = prog.blocs[etape]
  const pct = p?.total ? Math.round((p.faites / p.total) * 100) : 0
  return (
    <header className="ec-s2-bandeau">
      <div className="ec-s2-bandeau__texte">
        <small>{surtitre}</small>
        <b>{nomBloc(bloc)}</b>
        <div className="ec-s2-barre" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Avancement du bloc"><i style={{ width: `${pct}%` }} /></div>
      </div>
      <span className="ec-s2-bandeau__compte" aria-label={`${p?.faites ?? 0} sur ${p?.total ?? 0}`}>{p?.faites ?? 0}/{p?.total ?? 0}</span>
      <nav className="ec-s2-plan" aria-label="Blocs de la séance">
        {blocs.map((b, i) => (
          <button key={b.id} type="button" className={`ec-s2-pastille${i === etape ? ' est-actif' : prog.blocs[i]?.complet ? ' est-fini' : ''}`} aria-current={i === etape ? 'step' : undefined}
            aria-label={`${nomBloc(b)}${prog.blocs[i]?.complet ? ', fait' : ''}`} title={nomBloc(b)} onClick={() => aller(i)}>
            {prog.blocs[i]?.complet && i !== etape ? '✓' : b.lettre}
          </button>
        ))}
        <button type="button" className="ec-s2-pastille ec-s2-pastille--fin" onClick={finir}>{verrou ? 'Bilan' : 'Fin'}</button>
      </nav>
    </header>
  )
}

// Un exercice : photo, nom, prévu, puis une ligne par série (rond à toucher pour cocher, valeurs modifiables)
function CarteExo({ el, code, ls, note, actions, lecture, voirConsignes, actif, grand = false }) {
  const [detail, setDetail] = useState(false)
  const duree = enDuree(el)
  const cle = duree ? 'duree' : 'reps'
  const prevu = lignesExercice(el, true).prescription.replace(' · charge libre', '')
  const enCours = lecture || !actif ? -1 : ls.findIndex((l) => !l.fait) // une seule série encadrée à la fois : la première pas faite du bloc
  const base = `ex-${el.id}`
  return (
    <li className={`ec-s2-carte${grand ? ' est-grand' : ''}`} aria-labelledby={`${base}-nom`}>
      {grand && <GrandePhoto el={el} voirConsignes={voirConsignes} />}
      <div className="ec-s2-carte__corps">
      <div className={`ec-s2-carte__tete${!grand && !el.photos?.[0] ? ' sans-vignette' : ''}`}>
        {!grand && el.photos?.[0] && (
          <button type="button" className="ec-s2-vignette" onClick={voirConsignes} aria-label={`Voir les photos et consignes : ${el.nom}`}>
            <PhotoStockee chemin={el.photos[0]} alt="" classe="ec-s2-vignette__img" />
          </button>
        )}
        <div>
          <h3 id={`${base}-nom`} className="ec-s2-carte__nom"><span className="ec-s2-code" aria-hidden="true">{code}</span> {el.nom}</h3>
          {prevu && <p className="ec-s2-carte__prevu">Prévu : {prevu}</p>}
          {grand && el.consignes && <p className="ec-s2-carte__consignes">{el.consignes}</p>}
        </div>
        {!lecture && <button type="button" className="ec-s2-plus" aria-expanded={detail} onClick={() => setDetail((d) => !d)}>{detail ? '− Masquer' : '＋ Note ou effort'}</button>}
      </div>
      <div className="ec-s2-series">
        {ls.map((l, i) => (
          <div key={i} className={`ec-s2-ligne${l.fait ? ' est-faite' : ''}${i === enCours ? ' est-en-cours' : ''}`} role="group" aria-label={`${el.nom}, série ${i + 1}`}>
            <button type="button" className="ec-s2-rond" aria-pressed={!!l.fait} aria-label={`Série ${i + 1}, ${l.fait ? 'faite' : 'à faire'}`} disabled={lecture} onClick={() => actions?.serie(el, i, 'fait', !l.fait)}>
              {l.fait ? <Coche /> : i + 1}
            </button>
            <span className="ec-s2-ligne__nom">Série {i + 1}</span>
            <span className="ec-s2-val">
              <input className="ec-s2-champ" type="text" inputMode={duree ? 'text' : 'numeric'} autoComplete="off" aria-label={`${el.nom}, série ${i + 1}, ${duree ? 'durée' : 'répétitions'}`}
                value={l[cle] ?? ''} placeholder={duree ? texteDuree(el.reps) : texteReps(el.reps)} readOnly={lecture} onChange={(e) => actions?.serie(el, i, cle, e.target.value)} />
              <span aria-hidden="true">×</span>
              <input className="ec-s2-champ" type="text" inputMode="decimal" autoComplete="off" aria-label={`${el.nom}, série ${i + 1}, charge en kilos${chargeParMain(el.materiel) ? ' par main' : ''}`}
                value={l.charge ?? ''} placeholder={fr(el.charge ?? '')} readOnly={lecture} onChange={(e) => actions?.serie(el, i, 'charge', e.target.value)} />
              <span className="ec-s2-unite">{chargeParMain(el.materiel) ? 'kg / main' : 'kg'}</span>
            </span>
            {(detail || lecture) && (
              <span className="ec-s2-rpe"><ChoixRpe id={`${base}-rpe${i}`} libelle={`${el.nom}, série ${i + 1}, RPE`} valeur={l.rpe} lecture={lecture} changer={(v) => actions?.serie(el, i, 'rpe', v)} /></span>
            )}
          </div>
        ))}
      </div>
      {(detail || (lecture && note)) && (
        <div className="ec-s2-note">
          <label className="ec-etiquette" htmlFor={`${base}-note`}>Note</label>
          <input id={`${base}-note`} className="ec-champ" type="text" autoComplete="off" value={note} readOnly={lecture} placeholder={lecture ? '' : 'Ex. dernière rep difficile'} onChange={(e) => actions?.note(el.id, e.target.value)} />
        </div>
      )}
      </div>
    </li>
  )
}

// Tout le bloc d'un coup (ordinateur) : chaque exercice avec sa grande photo à gauche (16 novembre 2026)
export function ListeBloc({ bloc, lignes, notes, actions, lecture, voirConsignes, grand = false }) {
  const els = bloc.elements ?? []
  const premier = els.findIndex((e) => lignes(e).some((l) => !l.fait))
  return (
    <ol className="ec-s2-liste">
      {els.map((el, i) => (
        <CarteExo key={el.id} el={el} code={`${bloc.lettre}${i + 1}`} ls={lignes(el)} note={notes[el.id] ?? ''} actions={actions} lecture={lecture} actif={i === premier}
          voirConsignes={() => voirConsignes(el)} grand={grand} />
      ))}
    </ol>
  )
}
// Superset (biset, triset) : le coaché le voit d'emblée et sait quoi préparer avant de commencer (17 novembre 2026)
export function nomSuperset(bloc) {
  const n = (bloc?.elements ?? []).length
  return n === 2 ? 'Biset' : n === 3 ? 'Triset' : 'Superset'
}
export function SupersetInfo({ bloc, tour, compact = false, actuel = -1, choisir }) {
  const els = bloc.elements ?? []
  const tours = Math.max(0, ...els.map((e) => parseInt(e.series, 10) || 0))
  // téléphone : replié par défaut (une ligne), on l'ouvre pour voir les exercices et le matériel (17 novembre 2026)
  const [ouvert, setOuvert] = useState(() => { try { return localStorage.getItem('rima-superset-ouvert') === '1' } catch { return false } })
  const basculer = () => setOuvert((o) => { try { localStorage.setItem('rima-superset-ouvert', o ? '0' : '1') } catch { /* rien */ } return !o })
  const materiel = (e) => [e.materiel && e.materiel !== 'Poids du corps' && e.materiel !== 'À préciser' ? e.materiel : '', String(e.charge ?? '').trim() ? `${fr(e.charge)} kg${chargeParMain(e.materiel) ? ' par main' : ''}` : ''].filter(Boolean).join(' ')
  const consigne = `Enchaînez ${els.length} exercices sans pause${bloc.repos ? `, puis ${bloc.repos} s de repos` : ''}`
  const tourTxt = tours > 0 ? (tour ? `tour ${tour} sur ${tours}` : `${tours} tours`) : ''
  if (compact) {
    return (
      <div className={`ec-super est-compact${ouvert ? ' est-ouvert' : ''}`}>
        <button type="button" className="ec-super__ligne" aria-expanded={ouvert} onClick={basculer}>
          <span className="ec-super__badge">{nomSuperset(bloc)}</span>
          <span className="ec-super__codes">{els.map((_, k) => <span key={k} className={k === actuel ? 'est-actuel' : ''}>{bloc.lettre}{k + 1}</span>)}</span>
          {tourTxt && <span className="ec-super__tour">{tourTxt}</span>}
          <svg className="ec-super__chevron" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        {ouvert && (
          <>
            <p className="ec-super__titre">{consigne}.</p>
            <ol className="ec-super__liste" aria-label="Exercices du bloc, à préparer">
              {els.map((e, k) => (
                <li key={e.id} className={k === actuel ? 'est-actuel' : ''}>
                  {/* toucher un exercice du superset y amène, et la liste se replie pour que l'écran tienne (18 novembre 2026) */}
                  <button type="button" className="ec-super__choix" aria-current={k === actuel ? 'step' : undefined} disabled={!choisir}
                    aria-label={`Aller à ${bloc.lettre}${k + 1} : ${e.nom}`} onClick={() => { choisir?.(k); if (choisir) basculer() }}>
                    <span className="ec-super__code">{bloc.lettre}{k + 1}</span>
                    <span className="ec-super__nom">{e.nom}</span>
                    {materiel(e) && <span className="ec-super__mat">{materiel(e)}</span>}
                  </button>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    )
  }
  return (
    <div className="ec-super" role="note" aria-label={`${nomSuperset(bloc)} : exercices enchaînés`}>
      <p className="ec-super__titre">{consigne}{tourTxt ? ` · ${tourTxt}` : ''}</p>
    </div>
  )
}

// En-tête de la séance sur ordinateur (maquette) : barre noire fine (retour, séance, où on en est), titre du bloc
// (Biset / Triset, consigne du superset), pastilles des blocs. Le même pour tous les blocs et pour la fin de séance.
export function EnteteOrdi({ titre, sousTitre, lienRetour, bloc, blocs, prog, etape, aller, finir, lecture }) {
  const els = bloc?.elements ?? []
  const superset = bloc?.format === 'superset'
  const nomFormat = superset ? (els.length === 2 ? 'Biset' : els.length === 3 ? 'Triset' : 'Superset') : null
  const p = prog?.blocs?.[etape]
  const etat = !bloc ? (lecture ? 'Séance faite' : 'Fin de séance')
    : `${nomBloc(bloc)} · ${p?.faites ?? 0} sur ${p?.total ?? 0}`
  return (
    <>
      <div className="ec-s5-barre">
        <Link className="ec-s5-retour" to={lienRetour ?? '/espace'} aria-label={lienRetour === '/espace/programme' ? 'Retour à Mon programme' : 'Retour au tableau de bord'}><span aria-hidden="true">←</span></Link>
        <b>{titre}</b><span className="ec-s5-barre__sous">{sousTitre}</span>
        <span className="ec-s5-barre__etat">{etat}</span>
      </div>
      <div className="ec-s5-tete">
        <div>
          <h2 className={`ec-s5-titre${bloc ? '' : ' sr-only'}`}>{bloc ? nomBloc(bloc) : (lecture ? 'Bilan de la séance' : 'Fin de séance')}{nomFormat && <span> · {nomFormat}</span>}{bloc && !superset && bloc.format && bloc.format !== 'series' && <span> · {resumeFormat(bloc)}</span>}</h2>
          {superset && <SupersetInfo bloc={bloc} />}
        </div>
        <nav className="ec-s5-blocs" aria-label="Blocs de la séance">
          {blocs.map((b, i) => (
            <button key={b.id} type="button" className={`${i === etape ? 'est-actif' : prog?.blocs?.[i]?.complet ? 'est-fini' : ''}`} aria-current={i === etape ? 'step' : undefined}
              aria-label={`${nomBloc(b)}${prog?.blocs?.[i]?.complet ? ', fait' : ''}`} title={nomBloc(b)} onClick={() => aller(i)}>
              {prog?.blocs?.[i]?.complet && i !== etape ? '✓' : b.lettre}
            </button>
          ))}
          <button type="button" className={`ec-s5-blocs__fin${!bloc ? ' est-actif' : ''}`} aria-current={!bloc ? 'step' : undefined} onClick={finir}>{lecture ? 'Bilan' : 'Fin'}</button>
        </nav>
      </div>
    </>
  )
}

// Ordinateur (16 novembre 2026, mélange « Focus » + « Galerie » choisi par Thomas) : les exercices du bloc côte à côte avec
// leur grande photo, et sous chaque photo les séries avec de vraies cases répétitions / charge.
// Superset (biset, triset) : on avance par tour (A1 → A2 → A3, puis tour suivant) ; bloc classique : exercice après exercice.
export function BlocOrdinateur({ bloc, lignes, notes, actions, lecture, voirConsignes, etape, nb, aller, finir, suivant }) {
  const els = bloc.elements ?? []
  const superset = bloc.format === 'superset'
  // série à faire maintenant : { e: index de l'exercice, i: index de la série }
  const actuelle = (() => {
    if (lecture) return null
    if (superset) {
      const max = Math.max(0, ...els.map((e) => lignes(e).length))
      for (let i = 0; i < max; i++) {
        for (let e = 0; e < els.length; e++) {
          const l = lignes(els[e])[i]
          if (l && !l.fait) return { e, i }
        }
      }
      return null
    }
    for (let e = 0; e < els.length; e++) {
      const i = lignes(els[e]).findIndex((l) => !l.fait)
      if (i >= 0) return { e, i }
    }
    return null
  })()
  const dernier = etape >= nb - 1
  const resume = (() => {
    if (!actuelle) return 'Tout le bloc est fait'
    if (!superset) return `${bloc.lettre}${actuelle.e + 1} · série ${actuelle.i + 1}`
    const t = actuelle.i
    return `Tour ${t + 1} : ` + els.map((e, k) => `${bloc.lettre}${k + 1} ${lignes(e)[t]?.fait ? '✓' : k === actuelle.e ? 'en cours' : 'à faire'}`).join(' · ')
  })()
  const [manque, setManque] = useState(false)
  const valider = () => {
    if (!actuelle) { if (dernier) finir(); else aller(etape + 1); return }
    const el = els[actuelle.e]
    // fourchette (« 8 à 10 ») : le coaché écrit d'abord combien de répétitions il a faites (20 novembre 2026)
    if (!enDuree(el) && estFourchette(el.reps) && !String(lignes(el)[actuelle.i]?.reps ?? '').trim()) {
      setManque(true)
      document.querySelector(`[data-serie="${el.id}-${actuelle.i}"]`)?.focus()
      return
    }
    setManque(false)
    actions.serie(el, actuelle.i, 'fait', true)
  }
  return (
    <div className="ec-s5">
      <ol className={`ec-s5-grille ec-s5-grille--${Math.min(els.length, 3)}`}>
        {els.map((el, e) => (
          <CarteGalerie key={el.id} el={el} code={`${bloc.lettre}${e + 1}`} ls={lignes(el)} note={notes[el.id] ?? ''} actions={actions} lecture={lecture}
            actuelle={actuelle?.e === e ? actuelle.i : -1} voirConsignes={() => voirConsignes(el)} />
        ))}
      </ol>
      {!lecture && (
        <div className="ec-s5-bas">
          <span className={`ec-s5-resume${manque ? ' est-alerte' : ''}`} aria-live="polite">{manque ? 'Notez d’abord vos répétitions faites' : resume}</span>
          <button type="button" className="ec-s5-gros" onClick={valider}>
            {actuelle ? 'Série faite ✓' : dernier ? 'Terminer la séance →' : `Bloc suivant : ${nomBloc(suivant)} →`}
          </button>
        </div>
      )}
    </div>
  )
}

function CarteGalerie({ el, code, ls, note, actions, lecture, actuelle, voirConsignes }) {
  const photos = el.photos ?? []
  const [n, setN] = useState(0)
  const [detail, setDetail] = useState(false)
  const duree = enDuree(el)
  const cle = duree ? 'duree' : 'reps'
  const prevu = lignesExercice(el, true).prescription.replace(' · charge libre', '')
  const fini = ls.length > 0 && ls.every((l) => l.fait)
    const avecCharge = true // la charge se note toujours (demande de Thomas, 17 novembre 2026), même sans charge prévue
  const base = `g-${el.id}`
  return (
    <li className={`ec-s5-carte${actuelle >= 0 ? ' est-actuelle' : ''}${fini ? ' est-finie' : ''}`} aria-labelledby={`${base}-nom`}>
      {/* pas de photo : pas d'encart vide (demande de Marie, 20 novembre 2026), seulement le code et « Fait » sur une fine bande */}
      <div className={`ec-s5-photo${photos.length ? '' : ' ec-s5-photo--sans'}`}>
        {photos.length > 0 && (
          <button type="button" className="ec-s5-photo__bouton" onClick={voirConsignes} aria-label={`Agrandir les photos et consignes : ${el.nom}`}>
            <PhotoStockee key={photos[n]} chemin={photos[n]} alt="" classe="ec-s5-photo__img" />
          </button>
        )}
        <span className="ec-s5-code">{code}</span>
        {fini && <span className="ec-s5-fait">✓ Fait</span>}
        {photos.length > 1 && (
          <div className="ec-s4-points" role="group" aria-label={`Photos : ${el.nom}`}>
            {photos.map((p, k) => <button key={p} type="button" aria-pressed={k === n} aria-label={`Photo ${k + 1}`} onClick={() => setN(k)}><span /></button>)}
          </div>
        )}
      </div>
      <div className="ec-s5-corps">
        <h3 id={`${base}-nom`} className="ec-s5-nom">{el.nom}</h3>
        {prevu && <p className="ec-s5-prevu">Prévu {prevu}</p>}
        {el.consignes && <p className="ec-s5-consignes">{el.consignes}</p>}
        <div className={`ec-s5-ligne ec-s5-entete${avecCharge ? '' : ' sans-charge'}`} aria-hidden="true"><span /><span>{duree ? 'Durée' : 'Répétitions'}</span>{avecCharge && <span>{chargeParMain(el.materiel) ? 'Charge par main' : 'Charge'}</span>}</div>
        {ls.map((l, i) => (
          <div key={i} className={`ec-s5-ligne${avecCharge ? '' : ' sans-charge'}${l.fait ? ' est-faite' : ''}${i === actuelle ? ' est-actuelle' : ''}`} role="group" aria-label={`${el.nom}, série ${i + 1}`}>
            <button type="button" className="ec-s5-rond" aria-pressed={!!l.fait} aria-label={`Série ${i + 1}, ${l.fait ? 'faite (toucher pour décocher)' : 'à faire (toucher pour cocher)'}`} disabled={lecture}
              onClick={() => actions?.serie(el, i, 'fait', !l.fait)}>{l.fait ? <Coche /> : i + 1}</button>
            <input className="ec-s5-champ" data-serie={`${el.id}-${i}`} type="text" inputMode={duree ? 'text' : 'numeric'} autoComplete="off" aria-label={`${el.nom}, série ${i + 1}, ${duree ? 'durée' : 'répétitions'}`}
              value={l[cle] ?? ''} placeholder={duree ? texteDuree(el.reps) : texteReps(el.reps)} readOnly={lecture} onFocus={(ev) => ev.target.select()} onChange={(ev) => actions?.valeur(el, i, cle, ev.target.value)} />
            {avecCharge && (
            <span className="ec-s5-kg">
              <input className="ec-s5-champ" type="text" inputMode="decimal" autoComplete="off" aria-label={`${el.nom}, série ${i + 1}, charge en kilos${chargeParMain(el.materiel) ? ' par main' : ''}`}
                value={l.charge ?? ''} placeholder={fr(el.charge ?? '') || '–'} readOnly={lecture} onFocus={(ev) => ev.target.select()} onChange={(ev) => actions?.valeur(el, i, 'charge', ev.target.value)} />
              <small>kg</small>
            </span>
            )}
            {(detail || (lecture && l.rpe)) && (
              <span className="ec-s5-rpe"><ChoixRpe id={`${base}-rpe${i}`} libelle={`${el.nom}, série ${i + 1}, effort`} valeur={l.rpe} lecture={lecture} changer={(v) => actions?.valeur(el, i, 'rpe', v)} /></span>
            )}
          </div>
        ))}
        {!lecture && <button type="button" className="ec-s5-plus" aria-expanded={detail} onClick={() => setDetail((d) => !d)}>{detail ? '− Masquer effort et note' : '＋ Effort ou note'}</button>}
        {(detail || (lecture && note)) && (
          <input className="ec-s5-note" type="text" autoComplete="off" aria-label={`Note sur ${el.nom}`} value={note} readOnly={lecture} placeholder="Note sur l’exercice (ex. dernière rep difficile)" onChange={(ev) => actions?.note(el.id, ev.target.value)} />
        )}
      </div>
    </li>
  )
}

// ---------- Téléphone : un exercice à la fois ----------

function Reglage({ libelle, valeur, changer, mode, id, indice, alerte }) {
  return (
    <label className={`ec-s2-reglage${alerte ? ' est-a-remplir' : ''}`} htmlFor={id}>
      <span className="ec-s2-reglage__lib">{libelle}</span>
      <input id={id} type="text" inputMode={mode} autoComplete="off" enterKeyHint="done" value={valeur} placeholder={indice}
        aria-invalid={alerte || undefined} onFocus={(e) => e.target.select()} onChange={(e) => changer(e.target.value)} />
    </label>
  )
}

// Retour en arrière d'un bloc à l'autre : le bloc précédent s'ouvre sur son dernier exercice
const versLaFin = { actif: false }

export function UnExercice({ bloc, etape, blocs, prog, lignes, notes, actions, voirConsignes, aller, finir, retour }) {
  const els = bloc.elements ?? []
  const [exo, setExo] = useState(() => {
    // en revenant en arrière depuis le bloc suivant, on arrive sur le dernier exercice de ce bloc
    if (versLaFin.actif) { versLaFin.actif = false; return Math.max(0, els.length - 1) }
    return Math.max(0, els.findIndex((e) => lignes(e).some((l) => !l.fait)))
  })
  const [choisie, setChoisie] = useState(null)
  const [brouillon, setBrouillon] = useState(null)
  const [plan, setPlan] = useState(false)
  const [detail, setDetail] = useState(false)
  const [manque, setManque] = useState(false) // fourchette : « Série faite » sans avoir dit combien de répétitions
  const nb = blocs.length
  const dernier = etape >= nb - 1

  if (els.length === 0) return <p className="ec-texte">Ce bloc n’a pas encore d’exercice.</p>

  const el = els[Math.min(exo, els.length - 1)]
  const ls = lignes(el)
  const cle = enDuree(el) ? 'duree' : 'reps'
  const premiere = ls.findIndex((l) => !l.fait)
  const cur = choisie ?? premiere
  const ligne = cur >= 0 ? ls[cur] : null
  // fourchette (« 8 à 10 ») : la case reste vide, le coaché écrit combien il en a fait (20 novembre 2026)
  const fourchette = cle === 'reps' && estFourchette(el.reps)
  const repsV = brouillon?.reps ?? (ligne?.[cle] || (fourchette ? '' : String(el.reps ?? '')))
  const chargeV = brouillon?.charge ?? (ligne?.charge || String(el.charge ?? ''))
  const rpeV = brouillon?.rpe ?? (ligne?.rpe ?? '')
  const prevu = lignesExercice(el, true).prescription.replace(' · charge libre', '')
  const exoFait = (e) => lignes(e).every((l) => l.fait)
  const prochaineExo = (apres) => els.findIndex((e, k) => k !== apres && !exoFait(e))

  const allerExo = (k) => { setExo(k); setChoisie(null); setBrouillon(null); setDetail(false); setManque(false) }
  // bloc fini : directement le bloc suivant (ou la fin de séance), sans page intermédiaire
  const blocSuivant = () => (dernier ? finir() : aller(etape + 1))
  const suite = () => { const k = prochaineExo(exo); if (k >= 0) allerExo(k); else blocSuivant() }
  const precedent = () => {
    if (exo > 0) allerExo(exo - 1)
    else if (etape > 0) { versLaFin.actif = true; aller(etape - 1) }
  }
  const faite = () => {
    if (fourchette && !String(repsV).trim()) { setManque(true); document.getElementById(`reps-${el.id}`)?.focus(); return }
    setManque(false)
    actions.serieComplete(el, cur, { reps: repsV, charge: chargeV, rpe: rpeV })
    setBrouillon(null); setChoisie(null)
    if (bloc.format === 'superset') {
      // superset : exercice suivant du tour (A1 → A2 → A3), puis tour suivant
      const premiere = (k) => lignes(els[k]).findIndex((l, i) => !(l.fait || (k === exo && i === cur)))
      let cible = -1, mieux = Infinity
      for (let d = 1; d <= els.length; d++) {
        const k = (exo + d) % els.length
        const i = premiere(k)
        if (i >= 0 && i < mieux) { mieux = i; cible = k }
      }
      if (cible >= 0) allerExo(cible); else blocSuivant()
      return
    }
    if (!ls.some((l, i) => i !== cur && !l.fait)) {
      const k = els.findIndex((e, j) => j !== exo && !exoFait(e))
      if (k >= 0) allerExo(k); else blocSuivant()
    }
  }
  const maj = (champ) => (v) => setBrouillon((b) => ({ ...(b ?? {}), [champ]: v }))

  return (
    <div className="ec-s2-un">
      <div className="ec-s2-un__haut">
        <div className="ec-s2-un__ligne">
          {retour}
          <div className="ec-s2-seg" role="group" aria-label="Exercices du bloc">
            {els.map((e, k) => (
              <button key={e.id} type="button" className={`${k === exo ? 'est-actif' : exoFait(e) ? 'est-fini' : ''}`} aria-current={k === exo ? 'step' : undefined}
                aria-label={`Exercice ${k + 1} : ${e.nom}${exoFait(e) ? ', fait' : ''}`} onClick={() => allerExo(k)} />
            ))}
          </div>
        </div>
        <div className="ec-s2-un__compte">
          <span>Exercice {exo + 1} sur {els.length} · {nomBloc(bloc)}</span>
          <button type="button" aria-expanded={plan} onClick={() => setPlan((p) => !p)}>{plan ? 'Fermer' : 'Plan'}</button>
        </div>
        {plan && (
          <ul className="ec-s2-planliste">
            {blocs.map((b, i) => (
              <li key={b.id}><button type="button" className={i === etape ? 'est-actif' : ''} onClick={() => aller(i)}>
                <span>{nomBloc(b)}</span><span>{prog.blocs[i]?.faites ?? 0}/{prog.blocs[i]?.total ?? 0}</span></button></li>
            ))}
            <li><button type="button" onClick={finir}><span>Fin de séance</span></button></li>
          </ul>
        )}
      </div>

      {bloc.format === 'superset' && <SupersetInfo bloc={bloc} tour={cur >= 0 ? cur + 1 : null} compact actuel={exo} choisir={allerExo} />}
      <PhotosGlissees key={el.id} el={el} ouvrir={() => voirConsignes(el)} />
      <h2 className="ec-s2-un__nom">{el.nom}</h2>
      {prevu && <p className="ec-s2-un__prevu">Prévu : {prevu}</p>}

      {cur >= 0 ? (
        <>
          <p className="ec-s2-un__serie">Série {cur + 1} sur {ls.length}</p>
          <div className="ec-s2-reglages">
            <Reglage id={`reps-${el.id}`} libelle={cle === 'duree' ? 'Durée' : fourchette ? `Reps faites (${texteReps(el.reps)})` : 'Répétitions'} valeur={repsV} mode={cle === 'duree' ? 'text' : 'numeric'}
              indice={fourchette ? texteReps(el.reps) : undefined} alerte={manque && !String(repsV).trim()} changer={(v) => { setManque(false); maj('reps')(v) }} />
            <Reglage id={`charge-${el.id}`} libelle={chargeParMain(el.materiel) ? 'Charge · kg par main' : 'Charge · kg'} valeur={chargeV} mode="decimal" changer={maj('charge')} />
          </div>
        </>
      ) : <p className="ec-s2-un__serie est-fini">Toutes les séries sont faites</p>}

      <div className="ec-s2-chips" role="group" aria-label="Séries">
        {ls.map((l, i) => (
          <button key={i} type="button" className={`${l.fait ? 'est-faite' : ''}${i === cur ? ' est-en-cours' : ''}`} aria-label={`Série ${i + 1}${l.fait ? ', faite' : ''}`}
            onClick={() => { setChoisie(i); setBrouillon(null) }}>{l.fait ? '✓ ' : ''}{i + 1}</button>
        ))}
      </div>

      <button type="button" className="ec-s2-lien" aria-expanded={detail} onClick={() => setDetail((d) => !d)}>{detail ? '− Masquer' : '＋ Note ou effort (RPE)'}</button>
      {detail && (
        <div className="ec-s2-detail">
          {cur >= 0 && (
            <div>
              <label className="ec-etiquette" htmlFor={`rpe-${el.id}`}>Effort ressenti (RPE) de cette série</label>
              <ChoixRpe id={`rpe-${el.id}`} libelle="RPE" valeur={rpeV} classe="ec-champ" changer={maj('rpe')} />
            </div>
          )}
          <div>
            <label className="ec-etiquette" htmlFor={`note-${el.id}`}>Note sur l’exercice</label>
            <input id={`note-${el.id}`} className="ec-champ" type="text" autoComplete="off" value={notes[el.id] ?? ''} placeholder="Ex. dernière rep difficile" onChange={(e) => actions.note(el.id, e.target.value)} />
          </div>
        </div>
      )}

      {/* revenir / avancer : deux boutons bien visibles, toujours à la même place (17 novembre 2026) */}
      <div className="ec-s2-nav" role="group" aria-label="Changer d’exercice">
        <button type="button" className="ec-s2-pas" onClick={precedent} disabled={exo === 0 && etape === 0}>
          <span aria-hidden="true">‹</span> {exo > 0 ? 'Exercice précédent' : 'Bloc précédent'}
        </button>
        {/* simple navigation : l'exercice d'après (fait ou non), puis le bloc suivant */}
        <button type="button" className="ec-s2-pas" onClick={() => (exo < els.length - 1 ? allerExo(exo + 1) : blocSuivant())}>
          {exo < els.length - 1 ? 'Exercice suivant' : dernier ? 'Fin de séance' : 'Bloc suivant'} <span aria-hidden="true">›</span>
        </button>
      </div>
      {/* exercice fini : on passe à l'exercice d'après (même s'il est déjà fait), puis au bloc suivant */}
      <Gros onClick={cur >= 0 ? faite : () => (exo < els.length - 1 ? allerExo(exo + 1) : blocSuivant())}>
        {cur >= 0 ? 'Série faite ✓' : exo < els.length - 1 ? 'Exercice suivant →' : dernier ? 'Terminer la séance →' : 'Bloc suivant →'}
      </Gros>
    </div>
  )
}

// Photos de l'exercice sur téléphone (18 novembre 2026) : on glisse du doigt pour voir la suivante (points en dessous) ;
// toucher la photo ou « Voir les consignes » ouvre la fiche, comme avant.
function PhotosGlissees({ el, ouvrir }) {
  const photos = (el.photos ?? []).filter(Boolean)
  const [vue, setVue] = useState(0)
  const piste = useRef(null)
  const suivre = () => {
    const e = piste.current
    if (e) setVue(Math.round(e.scrollLeft / Math.max(1, e.clientWidth)))
  }
  const aller = (i) => piste.current?.scrollTo({ left: i * piste.current.clientWidth, behavior: 'smooth' })
  // pas de photo : pas d'encart vide (demande de Marie, 20 novembre 2026) ; s'il y a des consignes, un simple bouton pour les lire
  if (photos.length === 0) {
    return String(el.consignes ?? '').trim()
      ? <button type="button" className="ec-s2-consignes-seul" onClick={ouvrir}>Voir les consignes</button>
      : null
  }
  return (
    <div className="ec-s2-photo">
      <div className="ec-s2-photo__piste" ref={piste} onScroll={suivre}>
        {photos.map((ch, i) => (
          <button key={ch} type="button" className="ec-s2-photo__page" onClick={ouvrir} aria-label={`Photo ${i + 1} sur ${photos.length} : ${el.nom}. Voir les consignes`}>
            <PhotoStockee chemin={ch} alt="" classe="ec-s2-photo__img" />
          </button>
        ))}
      </div>
      <button type="button" className="ec-s2-photo__consignes" onClick={ouvrir}>Voir les consignes</button>
      {photos.length > 1 && (
        <span className="ec-s2-photo__points">
          {photos.map((ch, i) => <button key={ch} type="button" className={i === vue ? 'est-vue' : ''} aria-label={`Photo ${i + 1}`} aria-current={i === vue ? 'true' : undefined} onClick={() => aller(i)} />)}
        </span>
      )}
    </div>
  )
}

// Bloc qui n'est pas en séries (EMOM, AMRAP…) sur téléphone : on garde son écran, avec un seul bouton pour continuer
export function BoutonBloc({ etape, nb, aller, finir, suivant }) {
  const dernier = etape >= nb - 1
  return <Gros onClick={() => (dernier ? finir() : aller(etape + 1))}>{dernier ? 'Terminer la séance →' : `Bloc suivant : ${nomBloc(suivant)} →`}</Gros>
}
