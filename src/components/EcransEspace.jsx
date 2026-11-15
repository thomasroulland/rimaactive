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

// Haut de l'accueil, ordinateur (15 novembre 2026, revu le même jour) : les vrais écrans de l'espace coaché.
// Les pages de l'ordinateur sont empilées (celle de devant, les suivantes derrière, cliquables pour passer devant),
// la même page sur téléphone est posée devant ; à plat, sans perspective penchée, avec un léger décalage sous la souris.
// Captures faites avec une coachée fictive.
const ECRANS = [
  { pc: pcAccueil, tel: telAccueil, titre: 'Votre semaine', sous: 'La prochaine séance, prête à ouvrir', court: 'Accueil' },
  { pc: pcSeance, tel: telSeance, titre: 'La séance guidée', sous: 'Charges, répétitions et consignes en photo', court: 'Séance' },
  { pc: pcProgramme, tel: telProgramme, titre: 'Votre programme', sous: 'Semaine par semaine, préparé pour vous', court: 'Programme' },
  { pc: pcProgression, tel: telProgression, titre: 'Vos progrès', sous: 'Records, poids et régularité', court: 'Progrès' },
  { pc: pcMessages, tel: telMessages, titre: 'Les messages', sous: 'Une question ? Je vous réponds ici', court: 'Messages' },
]
const DUREE = 4200
const N = ECRANS.length

export default function EcransEspace() {
  const [idx, setIdx] = useState(0)
  const [decal, setDecal] = useState({ x: 0, y: 0 })
  const pauseJusque = useRef(0)
  const survol = useRef(false)
  const racine = useRef(null)

  const actuel = useRef(0)
  useEffect(() => { actuel.current = idx }, [idx])
  const aller = (i) => { if (i !== actuel.current) setIdx(i) }

  // défilement seul (sauf « moins d'animations », survol, onglet caché ou bloc hors écran)
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined
    let visible = true
    const obs = 'IntersectionObserver' in window ? new IntersectionObserver(([e]) => { visible = e.isIntersecting }) : null
    if (obs && racine.current) obs.observe(racine.current)
    const t = setInterval(() => {
      if (!visible || survol.current || document.hidden || Date.now() < pauseJusque.current) return
      setIdx((actuel.current + 1) % N)
    }, DUREE)
    return () => { clearInterval(t); obs?.disconnect() }
  }, [])

  const bouger = (e) => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const r = e.currentTarget.getBoundingClientRect()
    setDecal({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 })
  }
  const choisir = (i) => { aller(i); pauseJusque.current = Date.now() + 10000 }
  const e = ECRANS[idx]

  return (
    <div className="heros__outil ecrans" ref={racine} aria-label="Aperçu de votre espace client">
      <p className="ecrans__surtitre">Votre espace client · ordinateur et téléphone</p>
      <div className="ecrans__scene" onMouseMove={bouger}
        onMouseEnter={() => { survol.current = true }}
        onMouseLeave={() => { survol.current = false; setDecal({ x: 0, y: 0 }) }}
        style={{ '--dx': decal.x, '--dy': decal.y }}>
        {/* les pages de l'ordinateur, empilées : celle de devant, puis les suivantes derrière (un clic les fait passer devant) */}
        <div className="ecrans__fenetres">
          {ECRANS.map((ecran, i) => {
            const rang = (i - idx + N) % N
            const devant = rang === 0
            const contenu = (
              <>
                <span className="ecrans__barre" aria-hidden="true"><i /><i /><i /><span className="ecrans__adresse">rimaactive.fr/espace</span></span>
                <img src={ecran.pc} alt={devant ? `Espace client sur ordinateur : ${ecran.titre.toLowerCase()}` : ''} width="1200" height="650" loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />
              </>
            )
            return devant
              ? <figure key={ecran.court} className="ecrans__fenetre" data-rang="0">{contenu}</figure>
              : (
                <button key={ecran.court} type="button" className="ecrans__fenetre" data-rang={rang} tabIndex={rang > 3 ? -1 : 0}
                  aria-label={`Afficher : ${ecran.titre}`} onClick={() => choisir(i)}>{contenu}</button>
              )
          })}
        </div>
        {/* la même page sur téléphone, posée devant */}
        {ECRANS.map((ecran, i) => (
          <figure key={`tel-${ecran.court}`} className={`ecrans__tel${i === idx ? ' est-devant' : ''}`} aria-hidden={i !== idx}>
            <img src={ecran.tel} alt={i === idx ? 'La même page sur téléphone' : ''} width="540" height="1169" loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />
          </figure>
        ))}
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
