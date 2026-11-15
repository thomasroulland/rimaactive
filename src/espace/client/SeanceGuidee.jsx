import { useEffect, useRef, useState } from 'react'
import PhotoStockee from '../coach/PhotoStockee.jsx'
import { minutesSecondes, resumeFormat } from '../donnees/seances.js'
import { nomBloc } from '../donnees/programme.js'

// Page séance guidée bloc par bloc (15 novembre 2026, maquette D validée par Thomas) :
// récapitulatif à gauche (Récap), étapes, minuteur de repos et navigation entre blocs (PiedBloc).

// Anneau de progression (pourcentage au centre)
export function Anneau({ pct, taille = 64 }) {
  return (
    <span className="ec-anneau" style={{ '--pct': `${pct}%`, width: taille, height: taille }} aria-hidden="true">
      <span className="ec-anneau__centre">{pct}%</span>
    </span>
  )
}

// Récapitulatif (ordinateur) : séance, progression, plan des blocs cliquable, « Terminer ma séance »
export function Recap({ surtitre, titre, infos, progression, blocs, etape, aller, finir, verrou }) {
  const pct = progression.total ? Math.round((progression.faites / progression.total) * 100) : 0
  const nb = blocs.length
  return (
    <aside className="ec-recap" aria-label="Récapitulatif de la séance">
      <div>
        <p className="ec-recap__surtitre">{surtitre}</p>
        <h1 className="ec-recap__titre">{titre}</h1>
      </div>
      <div className="ec-recap__avance">
        <Anneau pct={pct} />
        <p className="ec-recap__texte">
          {progression.faites} {progression.faites > 1 ? 'séries faites' : 'série faite'} sur {progression.total}
          {infos.length > 0 && <><br />{infos.join(' · ')}</>}
        </p>
      </div>
      <ol className="ec-recap__plan">
        {blocs.map((b, i) => {
          const p = progression.blocs[i]
          const etat = i === etape ? 'est-actif' : p?.complet ? 'est-fini' : ''
          return (
            <li key={b.id}>
              <button type="button" className={`ec-recap__bloc ${etat}`} aria-current={i === etape ? 'step' : undefined} onClick={() => aller(i)}>
                <span className="ec-recap__ligne">
                  <span className="ec-recap__lettre" aria-hidden="true">{p?.complet && i !== etape ? '✓' : b.lettre}</span>
                  <span className="ec-recap__nom">{nomBloc(b)}{(b.format ?? 'series') !== 'series' ? ` · ${resumeFormat(b)}` : ''}</span>
                  <span className="ec-recap__compte">{p?.faites ?? 0}/{p?.total ?? 0}</span>
                </span>
                <span className="ec-recap__exos">
                  {(b.elements ?? []).map((el) => <span key={el.id}>{el.nom}</span>)}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
      <button type="button" className={`ec-bouton ec-recap__fin${etape === nb ? ' est-actif' : ''}`} onClick={finir}>
        {verrou ? 'Mon bilan de séance' : 'Terminer ma séance'}
      </button>
    </aside>
  )
}

// Récapitulatif (téléphone) : bande noire en haut, pastilles des blocs
export function RecapMobile({ surtitre, titre, progression, blocs, etape, aller, finir }) {
  const pct = progression.total ? Math.round((progression.faites / progression.total) * 100) : 0
  return (
    <div className="ec-recapm">
      <div className="ec-recapm__haut">
        <Anneau pct={pct} taille={52} />
        <div className="ec-recapm__titres"><p className="ec-recap__surtitre">{surtitre}</p><p className="ec-recapm__titre">{titre}</p></div>
      </div>
      <div className="ec-recapm__pastilles" role="group" aria-label="Blocs de la séance">
        {blocs.map((b, i) => {
          const p = progression.blocs[i]
          return (
            <button key={b.id} type="button" className={`ec-recapm__pastille${i === etape ? ' est-actif' : p?.complet ? ' est-fini' : ''}`}
              aria-current={i === etape ? 'step' : undefined} aria-label={`${nomBloc(b)}${b.nom ? ` (bloc ${b.lettre})` : ''}${p?.complet ? ', fait' : ''}`} onClick={() => aller(i)}>
              {b.lettre}{p?.complet ? ' ✓' : ''}
            </button>
          )
        })}
        <button type="button" className={`ec-recapm__pastille ec-recapm__pastille--fin${etape === blocs.length ? ' est-actif' : ''}`} onClick={finir}>Fin</button>
      </div>
    </div>
  )
}

// Étapes : une barre par bloc, puis la fin
export function Etapes({ nb, etape, progression }) {
  return (
    <div className="ec-etapes" aria-hidden="true">
      {Array.from({ length: nb + 1 }, (_, i) => (
        <span key={i} className={i === etape ? 'est-actif' : (i < nb ? progression.blocs[i]?.complet : false) ? 'est-fini' : ''} />
      ))}
    </div>
  )
}

// Minuteur de repos : démarre quand une série est cochée « Fait » (repos prévu par Marie) ; « Passer » l'arrête
export function Repos({ depart }) {
  const [maintenant, setMaintenant] = useState(() => Date.now())
  const [passe, setPasse] = useState(null)
  useEffect(() => {
    if (!depart) return undefined
    const t = setInterval(() => setMaintenant(Date.now()), 250)
    return () => clearInterval(t)
  }, [depart])
  const actif = depart && passe !== depart.debut && maintenant < depart.debut + depart.secondes * 1000
  const reste = actif ? (depart.debut + depart.secondes * 1000 - maintenant) / 1000 : 0
  return (
    <div className={`ec-repos${actif ? ' est-actif' : ''}`} role="timer" aria-live="off">
      {actif ? (
        <>
          <b className="ec-repos__temps">{minutesSecondes(reste)}</b>
          <span className="ec-repos__texte">Repos{depart.apres ? ` · ${depart.apres}` : ''}</span>
          <span className="ec-repos__jauge"><i style={{ width: `${100 - (reste / depart.secondes) * 100}%` }} /></span>
          <button type="button" className="ec-repos__passer" onClick={() => setPasse(depart.debut)}>Passer</button>
        </>
      ) : (
        <>
          <span className="ec-repos__icone" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9 2h6" /></svg>
          </span>
          <span className="ec-repos__texte">Cochez « Fait » : le repos se lance tout seul.</span>
        </>
      )}
    </div>
  )
}

// Navigation : retour rond, carte « Bloc suivant » (photo du premier exercice) ou « Fin de séance »
export function PiedBloc({ etape, blocs, aller, depart }) {
  const suivant = blocs[etape + 1]
  const photo = suivant?.elements?.[0]?.photos?.[0]
  return (
    <div className="ec-piedbloc">
      <Repos depart={depart} />
      <button type="button" className="ec-piedbloc__retour" onClick={() => aller(etape - 1)} disabled={etape === 0}
        aria-label={etape > 0 ? `Revenir : ${nomBloc(blocs[etape - 1])}` : 'Pas de bloc précédent'}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
      </button>
      <button type="button" className="ec-piedbloc__suivant" onClick={() => aller(etape + 1)}>
        <span className="ec-piedbloc__vignette">
          {suivant ? (photo ? <PhotoStockee chemin={photo} alt="" classe="ec-piedbloc__img" /> : <span className="ec-piedbloc__lettre">{suivant.lettre}</span>)
            : <span className="ec-piedbloc__lettre">✓</span>}
        </span>
        <span className="ec-piedbloc__textes">
          <small>{suivant ? 'Bloc suivant' : 'Dernier bloc'}</small>
          <b>{suivant ? `${suivant.lettre} · ${suivant.nom?.trim() || (suivant.elements ?? []).map((e) => e.nom).join(', ') || 'Bloc ' + suivant.lettre}` : 'Fin de séance'}</b>
        </span>
        <span className="ec-piedbloc__fleche" aria-hidden="true">→</span>
      </button>
    </div>
  )
}

// Garde la page en haut du bloc quand on change d'étape
export function useHautDeBloc(etape) {
  const ref = useRef(null)
  const premier = useRef(true)
  useEffect(() => {
    if (premier.current) { premier.current = false; return }
    const el = ref.current
    if (!el) return
    const haut = el.getBoundingClientRect().top
    if (haut < 0 || haut > window.innerHeight * 0.6) el.scrollIntoView({ behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  }, [etape])
  return ref
}
