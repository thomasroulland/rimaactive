import { useEffect, useState } from 'react'
import PhotoStockee from '../coach/PhotoStockee.jsx'
import { nomBloc } from '../donnees/programme.js'
import { enDuree, fr, lignesExercice, texteDuree } from '../donnees/seances.js'
import { ChoixRpe } from './BlocResultat.jsx'

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
      <div className="ec-s2-carte__tete">
        {!grand && (
          <button type="button" className="ec-s2-vignette" onClick={voirConsignes} aria-label={`Voir les photos et consignes : ${el.nom}`}>
            {el.photos?.[0] ? <PhotoStockee chemin={el.photos[0]} alt="" classe="ec-s2-vignette__img" /> : <Image />}
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
                value={l[cle] ?? ''} placeholder={duree ? texteDuree(el.reps) : String(el.reps ?? '')} readOnly={lecture} onChange={(e) => actions?.serie(el, i, cle, e.target.value)} />
              <span aria-hidden="true">×</span>
              <input className="ec-s2-champ" type="text" inputMode="decimal" autoComplete="off" aria-label={`${el.nom}, série ${i + 1}, charge en kilos`}
                value={l.charge ?? ''} placeholder={fr(el.charge ?? '')} readOnly={lecture} onChange={(e) => actions?.serie(el, i, 'charge', e.target.value)} />
              <span className="ec-s2-unite">kg</span>
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
export function BlocOrdinateur(props) {
  return <ListeBloc {...props} grand />
}

// Grande photo d'un exercice (ordinateur) : les photos se font défiler avec les points, un clic agrandit avec les consignes
function GrandePhoto({ el, voirConsignes }) {
  const photos = el.photos ?? []
  const [n, setN] = useState(0)
  return (
    <div className="ec-s4-photo">
      <button type="button" className="ec-s4-photo__bouton" onClick={voirConsignes} aria-label={`Agrandir les photos et consignes : ${el.nom}`}>
        {photos.length > 0
          ? <PhotoStockee key={photos[n]} chemin={photos[n]} alt="" classe="ec-s4-photo__img" />
          : <span className="ec-s4-photo__vide"><Image /><span>Pas encore de photo</span></span>}
      </button>
      {photos.length > 1 && (
        <div className="ec-s4-points" role="group" aria-label={`Photos : ${el.nom}`}>
          {photos.map((p, k) => <button key={p} type="button" aria-pressed={k === n} aria-label={`Photo ${k + 1}`} onClick={() => setN(k)}><span /></button>)}
        </div>
      )}
    </div>
  )
}

// ---------- Téléphone : un exercice à la fois ----------

function Reglage({ libelle, valeur, changer, mode, id }) {
  return (
    <label className="ec-s2-reglage" htmlFor={id}>
      <span className="ec-s2-reglage__lib">{libelle}</span>
      <input id={id} type="text" inputMode={mode} autoComplete="off" enterKeyHint="done" value={valeur} onFocus={(e) => e.target.select()} onChange={(e) => changer(e.target.value)} />
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
  const nb = blocs.length
  const dernier = etape >= nb - 1

  if (els.length === 0) return <p className="ec-texte">Ce bloc n’a pas encore d’exercice.</p>

  const el = els[Math.min(exo, els.length - 1)]
  const ls = lignes(el)
  const cle = enDuree(el) ? 'duree' : 'reps'
  const premiere = ls.findIndex((l) => !l.fait)
  const cur = choisie ?? premiere
  const ligne = cur >= 0 ? ls[cur] : null
  const repsV = brouillon?.reps ?? (ligne?.[cle] || String(el.reps ?? ''))
  const chargeV = brouillon?.charge ?? (ligne?.charge || String(el.charge ?? ''))
  const rpeV = brouillon?.rpe ?? (ligne?.rpe ?? '')
  const prevu = lignesExercice(el, true).prescription.replace(' · charge libre', '')
  const exoFait = (e) => lignes(e).every((l) => l.fait)
  const prochaineExo = (apres) => els.findIndex((e, k) => k !== apres && !exoFait(e))

  const allerExo = (k) => { setExo(k); setChoisie(null); setBrouillon(null); setDetail(false) }
  // bloc fini : directement le bloc suivant (ou la fin de séance), sans page intermédiaire
  const blocSuivant = () => (dernier ? finir() : aller(etape + 1))
  const suite = () => { const k = prochaineExo(exo); if (k >= 0) allerExo(k); else blocSuivant() }
  const precedent = () => {
    if (exo > 0) allerExo(exo - 1)
    else if (etape > 0) { versLaFin.actif = true; aller(etape - 1) }
  }
  const faite = () => {
    actions.serieComplete(el, cur, { reps: repsV, charge: chargeV, rpe: rpeV })
    setBrouillon(null); setChoisie(null)
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

      <button type="button" className="ec-s2-photo" onClick={() => voirConsignes(el)} aria-label={`Voir les photos et consignes : ${el.nom}`}>
        {el.photos?.[0] ? <PhotoStockee chemin={el.photos[0]} alt="" classe="ec-s2-photo__img" /> : <Image />}
        <span>Voir les consignes</span>
      </button>
      <h2 className="ec-s2-un__nom">{el.nom}</h2>
      {prevu && <p className="ec-s2-un__prevu">Prévu : {prevu}</p>}

      {cur >= 0 ? (
        <>
          <p className="ec-s2-un__serie">Série {cur + 1} sur {ls.length}</p>
          <div className="ec-s2-reglages">
            <Reglage id={`reps-${el.id}`} libelle={cle === 'duree' ? 'Durée' : 'Répétitions'} valeur={repsV} mode={cle === 'duree' ? 'text' : 'numeric'} changer={maj('reps')} />
            <Reglage id={`charge-${el.id}`} libelle="Charge · kg" valeur={chargeV} mode="decimal" changer={maj('charge')} />
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

      <div className="ec-s2-nav">
        {(exo > 0 || etape > 0) && <button type="button" className="ec-s2-precedent" onClick={precedent}>← {exo > 0 ? 'Exercice précédent' : 'Bloc précédent'}</button>}
        {cur >= 0 && <button type="button" className="ec-s2-passer" onClick={suite}>Passer →</button>}
      </div>
      <Gros onClick={cur >= 0 ? faite : suite}>{cur >= 0 ? 'Série faite ✓' : (prochaineExo(exo) >= 0 ? 'Exercice suivant →' : dernier ? 'Terminer la séance →' : 'Bloc suivant →')}</Gros>
    </div>
  )
}

// Bloc qui n'est pas en séries (EMOM, AMRAP…) sur téléphone : on garde son écran, avec un seul bouton pour continuer
export function BoutonBloc({ etape, nb, aller, finir, suivant }) {
  const dernier = etape >= nb - 1
  return <Gros onClick={() => (dernier ? finir() : aller(etape + 1))}>{dernier ? 'Terminer la séance →' : `Bloc suivant : ${nomBloc(suivant)} →`}</Gros>
}
