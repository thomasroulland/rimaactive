import { useEffect, useRef, useState } from 'react'
import telAccueil from '../assets/ecrans/accueil.webp'
import telSeance from '../assets/ecrans/seance.webp'
import telProgramme from '../assets/ecrans/programme.webp'
import telProgression from '../assets/ecrans/progression.webp'
import telMessages from '../assets/ecrans/messages.webp'
import pcAccueil from '../assets/ecrans/pc-accueil.webp'
import pcSeance from '../assets/ecrans/pc-seance.webp'
import pcProgramme from '../assets/ecrans/pc-programme.webp'
import pcProgression from '../assets/ecrans/pc-progression.webp'
import pcMessages from '../assets/ecrans/pc-messages.webp'

// Haut de l'accueil, ordinateur (15 novembre 2026, refait le même jour) : un panneau rangé dans la colonne de droite.
// Au centre, la page ouverte en grand (fenêtre d'ordinateur) avec la même page sur téléphone posée sur son coin ;
// à droite, les vignettes de toutes les pages, cliquables, dont celle en cours avec une barre de temps.
// Captures faites avec une coachée fictive.
const ECRANS = [
  { pc: pcAccueil, tel: telAccueil, titre: 'Votre semaine', sous: 'La prochaine séance, prête à ouvrir', court: 'Accueil' },
  { pc: pcSeance, tel: telSeance, titre: 'La séance guidée', sous: 'Charges, répétitions et consignes en photo', court: 'Séance' },
  { pc: pcProgramme, tel: telProgramme, titre: 'Votre programme', sous: 'Semaine par semaine, préparé pour vous', court: 'Programme' },
  { pc: pcProgression, tel: telProgression, titre: 'Vos progrès', sous: 'Records, poids et régularité', court: 'Progrès' },
  { pc: pcMessages, tel: telMessages, titre: 'Les messages', sous: 'Une question ? Je vous réponds ici', court: 'Messages' },
]
const DUREE = 5000
const N = ECRANS.length

export default function EcransEspace() {
  const [idx, setIdx] = useState(0)
  const [tour, setTour] = useState(0)
  const [enPause, setEnPause] = useState(false)
  const [calme] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  const racine = useRef(null)
  const visible = useRef(true)

  useEffect(() => {
    if (!('IntersectionObserver' in window) || !racine.current) return undefined
    const obs = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting })
    obs.observe(racine.current)
    return () => obs.disconnect()
  }, [])

  // passe à la page suivante après DUREE (relancé à chaque changement, donc aussi après un clic) ;
  // hors écran ou onglet caché : on attend un tour de plus
  useEffect(() => {
    if (calme || enPause) return undefined
    const t = setTimeout(() => {
      if (visible.current && !document.hidden) setIdx((i) => (i + 1) % N)
      else setTour((n) => n + 1)
    }, DUREE)
    return () => clearTimeout(t)
  }, [idx, tour, enPause, calme])

  const e = ECRANS[idx]
  return (
    <div className="heros__outil ecrans" ref={racine} aria-label="Aperçu de votre espace client"
      onMouseEnter={() => setEnPause(true)} onMouseLeave={() => setEnPause(false)}
      onFocus={() => setEnPause(true)} onBlur={() => setEnPause(false)}>
      <div className="ecrans__panneau">
        <div className="ecrans__tete">
          <p className="ecrans__surtitre">Votre espace client</p>
          <p className="ecrans__titre">Tout votre suivi, sur ordinateur et sur téléphone</p>
        </div>

        <div className="ecrans__corps">
          <div className="ecrans__scene">
            <div className="ecrans__fenetre">
              <span className="ecrans__barre" aria-hidden="true"><i /><i /><i /><span className="ecrans__adresse">rimaactive.fr/espace</span></span>
              <div className="ecrans__vues">
                {ECRANS.map((ecran, i) => (
                  <img key={ecran.court} className={`ecrans__vue${i === idx ? ' est-devant' : ''}`} src={ecran.pc}
                    alt={i === idx ? `Espace client sur ordinateur : ${ecran.titre.toLowerCase()}` : ''} aria-hidden={i !== idx}
                    width="1200" height="650" loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />
                ))}
              </div>
            </div>
            <div className="ecrans__tel">
              {ECRANS.map((ecran, i) => (
                <img key={ecran.court} className={`ecrans__vue${i === idx ? ' est-devant' : ''}`} src={ecran.tel}
                  alt={i === idx ? 'La même page sur téléphone' : ''} aria-hidden={i !== idx}
                  width="540" height="1169" loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />
              ))}
            </div>
            <div key={`etiquette-${idx}`} className="ecrans__etiquette" aria-live="polite">
              <span className="ecrans__numero">{String(idx + 1).padStart(2, '0')}</span>
              <span className="ecrans__textes"><strong>{e.titre}</strong><span>{e.sous}</span></span>
            </div>
          </div>

          <ul className="ecrans__vignettes" aria-label="Les pages de l'espace">
            {ECRANS.map((ecran, i) => (
              <li key={ecran.court}>
                <button type="button" className="ecrans__vignette" aria-pressed={i === idx} onClick={() => setIdx(i)}>
                  <span className="ecrans__mini"><img src={ecran.pc} alt="" width="1200" height="650" loading="lazy" decoding="async" /></span>
                  <span className="ecrans__nom">{ecran.court}</span>
                  {i === idx && !calme && <span key={`temps-${idx}-${tour}`} className={`ecrans__temps${enPause ? ' est-pause' : ''}`} style={{ animationDuration: `${DUREE}ms` }} aria-hidden="true" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
