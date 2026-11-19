import { useEffect, useRef, useState } from 'react'

// Rangée de boutons sur une seule ligne, avec un ascenseur horizontal dessiné par nous : toujours visible
// (les barres du système se cachent sur Mac et sur téléphone), qu'on peut tirer ou toucher.
export default function RangeeDefilante({ children, ...props }) {
  const rangee = useRef(null)
  const piste = useRef(null)
  const [m, setM] = useState({ visible: false, largeur: 1, x: 0 })

  const mesurer = () => {
    const e = rangee.current
    if (!e) return
    const { scrollWidth: sw, clientWidth: cw, scrollLeft: sl } = e
    const n = sw > cw + 1 ? { visible: true, largeur: cw / sw, x: sw > cw ? sl / (sw - cw) : 0 } : { visible: false, largeur: 1, x: 0 }
    // même mesure : on garde l'ancien état (sinon chaque mesure relancerait un affichage, sans fin)
    setM((a) => (a.visible === n.visible && Math.abs(a.largeur - n.largeur) < 0.001 && Math.abs(a.x - n.x) < 0.001 ? a : n))
  }
  useEffect(() => { mesurer() })
  useEffect(() => {
    const o = new ResizeObserver(mesurer)
    if (rangee.current) o.observe(rangee.current)
    return () => o.disconnect()
  }, [])

  const tirer = (ev) => {
    const e = rangee.current, p = piste.current
    if (!e || !p) return
    ev.preventDefault()
    ev.currentTarget.setPointerCapture(ev.pointerId)
    const x0 = ev.clientX, l0 = e.scrollLeft
    const course = p.clientWidth * (1 - m.largeur)
    const bouger = (mv) => { if (course > 0) e.scrollLeft = l0 + ((mv.clientX - x0) / course) * (e.scrollWidth - e.clientWidth) }
    const fin = () => { window.removeEventListener('pointermove', bouger); window.removeEventListener('pointerup', fin) }
    window.addEventListener('pointermove', bouger)
    window.addEventListener('pointerup', fin)
  }
  const toucherPiste = (ev) => {
    if (ev.target !== ev.currentTarget) return
    const e = rangee.current, r = ev.currentTarget.getBoundingClientRect()
    if (e) e.scrollLeft = ((ev.clientX - r.left) / r.width) * (e.scrollWidth - e.clientWidth)
  }

  return (
    <div className="rangee-defilante">
      {/* fondu sur le bord où il reste des filtres à voir (19 novembre 2026) */}
      <div {...props} ref={rangee} onScroll={mesurer}
        data-fondu={m.visible ? [m.x > 0.01 ? 'gauche' : '', m.x < 0.99 ? 'droite' : ''].filter(Boolean).join(' ') || undefined : undefined}>{children}</div>
      {m.visible && (
        <div className="rangee-defilante__piste" ref={piste} aria-hidden="true" onPointerDown={toucherPiste}>
          <span className="rangee-defilante__poignee" style={{ width: `${m.largeur * 100}%`, left: `${m.x * (1 - m.largeur) * 100}%` }} onPointerDown={tirer} />
        </div>
      )}
    </div>
  )
}
