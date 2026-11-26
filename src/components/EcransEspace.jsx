import { useEffect, useRef, useState } from 'react'
import telAccueil from '../assets/ecrans/accueil.webp'
import telSeance from '../assets/ecrans/seance.webp'
import telProgramme from '../assets/ecrans/programme.webp'
import telProgression from '../assets/ecrans/progression.webp'
import pcAccueil from '../assets/ecrans/pc-accueil.webp'
import pcSeance from '../assets/ecrans/pc-seance.webp'
import pcProgramme from '../assets/ecrans/pc-programme.webp'
import pcProgression from '../assets/ecrans/pc-progression.webp'

// Haut de l'accueil, ordinateur (15 novembre 2026, refait le même jour) : un panneau rangé dans la colonne de droite.
// Changement de page : l'ancienne part vers le haut, la nouvelle arrive par le bas (demande de Thomas).
// Au centre, la page ouverte en grand (fenêtre d'ordinateur) avec la même page sur téléphone posée sur son coin ;
// à droite, les vignettes de toutes les pages, cliquables, dont celle en cours avec une barre de temps.
// Captures faites avec une coachée fictive.
// Dans l'ordre du parcours (accueil, programme, séance, progression ; « Messages » retiré par Marie le 16 novembre 2026), avec les titres des pages de l'espace.
const ECRANS = [
  // titres et phrases de Marie (21 novembre 2026)
  { pc: pcAccueil, tel: telAccueil, titre: 'Tableau de bord', sous: 'Votre prochaine séance, prête à démarrer.' },
  { pc: pcProgramme, tel: telProgramme, titre: 'Mon programme', sous: 'Votre programme sur mesure, adapté à vos objectifs.' },
  { pc: pcSeance, tel: telSeance, titre: 'Ma séance', sous: 'Vos exercices, charges et consignes au même endroit.' },
  { pc: pcProgression, tel: telProgression, titre: 'Ma progression', sous: 'Visualisez vos progrès, séance après séance.' },
]
const DUREE = 5000
const N = ECRANS.length

export default function EcransEspace() {
  const [idx, setIdxBrut] = useState(0)
  const [prec, setPrec] = useState(null)
  const actuel = useRef(0)
  // change de page en gardant la précédente, qui part vers le haut pendant que la nouvelle arrive par le bas
  const setIdx = (suite) => {
    const n = typeof suite === 'function' ? suite(actuel.current) : suite
    if (n === actuel.current) return
    setPrec(actuel.current); actuel.current = n; setIdxBrut(n)
  }
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
    <div className="ecrans ecrans--carte" ref={racine} aria-label="Aperçu de votre espace client"
      onMouseEnter={() => setEnPause(true)} onMouseLeave={() => setEnPause(false)}
      onFocus={() => setEnPause(true)} onBlur={() => setEnPause(false)}>
      <div className="ecrans__panneau">
        <div className="ecrans__tete">
          <p className="ecrans__surtitre">Votre espace</p>
          <p className="ecrans__titre">Suivez votre programme et mesurez vos progrès</p>
        </div>

        <div className="ecrans__corps">
          <div className="ecrans__scene">
            <div className="ecrans__fenetre">
              {/* plus d'adresse dans la barre de la fenêtre (Marie, 26 novembre 2026) */}
              <span className="ecrans__barre" aria-hidden="true"><i /><i /><i /></span>
              <div className="ecrans__vues">
                {ECRANS.map((ecran, i) => (
                  <img key={ecran.titre} className={`ecrans__vue${i === idx ? ' est-devant' : i === prec ? ' est-sortie' : ''}`} src={ecran.pc}
                    alt={i === idx ? `Espace client sur ordinateur : ${ecran.titre.toLowerCase()}` : ''} aria-hidden={i !== idx}
                    width="1200" height="650" loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />
                ))}
              </div>
            </div>
            <div className="ecrans__tel">
              {ECRANS.map((ecran, i) => (
                <img key={ecran.titre} className={`ecrans__vue${i === idx ? ' est-devant' : i === prec ? ' est-sortie' : ''}`} src={ecran.tel}
                  alt={i === idx ? 'La même page sur téléphone' : ''} aria-hidden={i !== idx}
                  width="540" height="1169" loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />
              ))}
            </div>
            <div key={`etiquette-${idx}`} className="ecrans__etiquette" aria-live="polite">
              <span className="ecrans__numero">{String(idx + 1).padStart(2, '0')}</span>
              <span className="ecrans__textes"><strong>{e.titre}</strong><span>{e.sous}</span></span>
            </div>
          </div>

        </div>
        {/* des points sous l'aperçu (maquette du 20 novembre 2026) à la place des vignettes ; celui en cours se remplit */}
        <div className="ecrans__points" role="group" aria-label="Les pages de l'espace">
          {ECRANS.map((ecran, i) => (
            <button key={ecran.titre} type="button" className="ecrans__point" aria-pressed={i === idx} aria-label={ecran.titre} onClick={() => setIdx(i)}>
              {i === idx && !calme && <span key={`temps-${idx}-${tour}`} className={`ecrans__temps${enPause ? ' est-pause' : ''}`} style={{ animationDuration: `${DUREE}ms` }} aria-hidden="true" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
