import { useEffect, useRef, useState } from 'react'
import ecranAccueil from '../assets/ecrans/accueil.webp'
import ecranSeance from '../assets/ecrans/seance.webp'
import ecranProgramme from '../assets/ecrans/programme.webp'
import ecranProgression from '../assets/ecrans/progression.webp'
import ecranMessages from '../assets/ecrans/messages.webp'

// Haut de l'accueil, ordinateur (15 novembre 2026) : les vrais écrans de l'espace coaché, en pile 3D qui défile seule.
// Inspiré de la maquette « Tous les écrans en 3D » : l'écran du dessus porte une étiquette, les puces dessous
// permettent d'en choisir un, la pile s'incline légèrement sous la souris. Captures faites avec une coachée fictive.
const ECRANS = [
  { image: ecranAccueil, titre: 'Votre semaine', sous: 'La prochaine séance, prête à ouvrir', court: 'Accueil' },
  { image: ecranSeance, titre: 'La séance guidée', sous: 'Charges, répétitions et consignes en photo', court: 'Séance' },
  { image: ecranProgramme, titre: 'Votre programme', sous: 'Semaine par semaine, préparé pour vous', court: 'Programme' },
  { image: ecranProgression, titre: 'Vos progrès', sous: 'Records, poids et régularité', court: 'Progrès' },
  { image: ecranMessages, titre: 'Les messages', sous: 'Une question ? Je vous réponds ici', court: 'Messages' },
]
const DUREE = 3600
const N = ECRANS.length

// Place de chaque écran selon son rang derrière celui du dessus (0 = dessus ; le dernier vient de partir, à gauche)
function place(rang) {
  if (rang === 0) return { transform: 'translate3d(0, 0, 0)', opacity: 1, filter: 'none', zIndex: N }
  if (rang === N - 1) return { transform: 'translate3d(-46%, 14%, 120px) rotateY(14deg)', opacity: 0, filter: 'none', zIndex: N + 1 }
  return {
    transform: `translate3d(${rang * 19}%, ${-rang * 3}%, ${-rang * 130}px)`,
    opacity: Math.max(0.3, 1 - rang * 0.24),
    filter: `saturate(${1 - rang * 0.25}) brightness(${1 - rang * 0.04})`,
    zIndex: N - rang,
  }
}

export default function EcransEspace() {
  const [idx, setIdx] = useState(0)
  const [incline, setIncline] = useState({ x: 0, y: 0 })
  const pauseJusque = useRef(0)
  const survol = useRef(false)
  const racine = useRef(null)

  // défilement seul (sauf « moins d'animations », survol, onglet caché ou bloc hors écran)
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined
    let visible = true
    const obs = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => { visible = e.isIntersecting }) : null
    if (obs && racine.current) obs.observe(racine.current)
    const t = setInterval(() => {
      if (!visible || survol.current || document.hidden || Date.now() < pauseJusque.current) return
      setIdx((i) => (i + 1) % N)
    }, DUREE)
    return () => { clearInterval(t); obs?.disconnect() }
  }, [])

  const bouger = (e) => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    setIncline({ x: Math.round(-y * 100) / 10, y: Math.round(x * 140) / 10 })
  }
  const choisir = (i) => { setIdx(i); pauseJusque.current = Date.now() + 9000 }
  const e = ECRANS[idx]

  return (
    <div className="heros__outil ecrans" ref={racine} aria-label="Aperçu de votre espace client">
      <p className="ecrans__surtitre">Votre espace client</p>
      <div className="ecrans__scene" onMouseMove={bouger}
        onMouseEnter={() => { survol.current = true }}
        onMouseLeave={() => { survol.current = false; setIncline({ x: 0, y: 0 }) }}>
        <div className="ecrans__ombre" aria-hidden="true" />
        <div className="ecrans__pile" style={{ transform: `rotateX(${incline.x}deg) rotateY(${incline.y}deg)` }}>
          <div className="ecrans__entree">
            <div className="ecrans__angle">
              {ECRANS.map((ecran, i) => {
                const rang = (i - idx + N) % N
                return (
                  <figure key={ecran.court} className={`ecrans__tel${rang === 0 ? ' est-devant' : ''}`} style={place(rang)} aria-hidden={rang !== 0}>
                    <img src={ecran.image} alt={rang === 0 ? `Espace client : ${ecran.titre.toLowerCase()}` : ''} width="540" height="1169" loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />
                    {rang === 0 && <span key={`reflet-${idx}`} className="ecrans__reflet" aria-hidden="true" />}
                  </figure>
                )
              })}
            </div>
          </div>
        </div>
        <div key={`etiquette-${idx}`} className="ecrans__etiquette" aria-live="polite">
          <span className="ecrans__numero">{String(idx + 1).padStart(2, '0')}</span>
          <span className="ecrans__textes">
            <strong>{e.titre}</strong>
            <span>{e.sous}</span>
          </span>
        </div>
      </div>
      <div className="ecrans__puces" role="group" aria-label="Choisir un écran">
        {ECRANS.map((ecran, i) => (
          <button key={ecran.court} type="button" className="ecrans__puce" aria-pressed={i === idx} onClick={() => choisir(i)}>{ecran.court}</button>
        ))}
      </div>
    </div>
  )
}
