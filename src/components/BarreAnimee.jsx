import { useEffect, useLayoutEffect, useRef } from 'react'
import { Photo } from './Blocs.jsx'

// Un bout de la barre : manchon, butée et deux disques corail
function Bout() {
  return (
    <g className="barre__bout">
      <rect x="4" y="59" width="150" height="14" fill="#4b4641" />
      <rect x="140" y="48" width="14" height="36" fill="#161514" />
      <rect x="106" y="0" width="32" height="132" fill="#ff6447" />
      <rect x="110" y="4" width="24" height="124" fill="none" stroke="#d9452a" strokeWidth="3" />
      <rect x="76" y="14" width="28" height="104" fill="#ff6447" />
      <rect x="80" y="18" width="20" height="96" fill="none" stroke="#d9452a" strokeWidth="3" />
      <rect x="58" y="36" width="16" height="60" fill="#161514" />
      <rect x="40" y="50" width="16" height="32" fill="#4b4641" />
    </g>
  )
}

// La barre se soulève et dévoile la photo, au moment où la photo arrive à l'écran
// (sur téléphone, elle est sous le texte : lancée au chargement, l'animation passerait inaperçue)
export default function BarreAnimee() {
  const sceneRef = useRef(null)

  // Animation en attente (figée sur sa première image) jusqu'à ce que la moitié de la photo soit visible.
  // Posé avant le premier affichage pour qu'on ne voie jamais la photo déjà dévoilée.
  useLayoutEffect(() => {
    const scene = sceneRef.current
    if (!scene || !('IntersectionObserver' in window)) return
    scene.classList.add('barre-scene--attente')
    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (!entree.isIntersecting) return
        scene.classList.remove('barre-scene--attente')
        observateur.disconnect()
      },
      { threshold: 0.5 },
    )
    observateur.observe(scene)
    return () => observateur.disconnect()
  }, [])

  // En descendant, la barre continue de monter et penche légèrement
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let image = null
    const suivre = () => {
      image = null
      // Point de départ : le haut de la page, ou plus bas si la photo n'atteint le milieu de l'écran qu'en défilant
      const haut = scene.getBoundingClientRect().top + window.scrollY
      const depart = Math.max(0, haut - window.innerHeight * 0.5)
      const avance = Math.min(1, Math.max(0, (window.scrollY - depart) / 500))
      scene.style.setProperty('--levee', `${avance * 70}px`)
      scene.style.setProperty('--bascule', `${Math.sin(avance * Math.PI) * -3}deg`)
    }
    const auDefilement = () => { if (!image) image = requestAnimationFrame(suivre) }
    suivre()
    window.addEventListener('scroll', auDefilement, { passive: true })
    return () => {
      window.removeEventListener('scroll', auDefilement)
      if (image) cancelAnimationFrame(image)
    }
  }, [])

  return (
    <div className="barre-scene" ref={sceneRef}>
      <div className="barre-ombre" aria-hidden="true" />
      <Photo className="barre-photo" label="Photo de Marie en séance" sombre />
      <svg className="barre" aria-hidden="true" viewBox="0 0 640 132">
        <Bout />
        <rect x="154" y="61" width="332" height="10" fill="#161514" />
        <rect x="246" y="61" width="40" height="10" fill="#4b4641" />
        <rect x="354" y="61" width="40" height="10" fill="#4b4641" />
        <g transform="translate(640 0) scale(-1 1)">
          <Bout />
        </g>
      </svg>
    </div>
  )
}
