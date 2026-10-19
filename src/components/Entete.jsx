import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import icone from '../assets/icone-aa.png'
import { PAGES } from './liens.js'

const PAGES_MENU = PAGES

// Trait sous le lien actif, qui glisse d'un lien à l'autre
function useTrait(navRef) {
  const { pathname } = useLocation()
  const [trait, setTrait] = useState(null)

  useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const placer = () => {
      const actif = nav.querySelector('a[aria-current="page"]')
      // Pas de glissement au tout premier affichage : le trait apparaît directement sous la page courante
      setTrait((avant) =>
        actif && actif.offsetWidth
          ? {
              left: actif.offsetLeft,
              top: actif.offsetTop + actif.offsetHeight - 7,
              width: actif.offsetWidth,
              anime: avant !== null,
            }
          : null,
      )
    }

    placer()
    const observateur = new ResizeObserver(placer)
    observateur.observe(nav)
    document.fonts?.ready.then(placer)
    return () => observateur.disconnect()
  }, [navRef, pathname])

  return trait
}

export default function Entete() {
  const navRef = useRef(null)
  const trait = useTrait(navRef)
  const { pathname } = useLocation()
  const [ouvert, setOuvert] = useState(false)
  // Le menu mobile se referme quand on change de page ou qu'on appuie sur Échap
  useEffect(() => setOuvert(false), [pathname])
  useEffect(() => {
    if (!ouvert) return
    const fermer = (e) => e.key === 'Escape' && setOuvert(false)
    window.addEventListener('keydown', fermer)
    return () => window.removeEventListener('keydown', fermer)
  }, [ouvert])

  return (
    <header className="entete">
      <div className="entete__barre">
        <Link to="/" className="entete__logo" aria-label="Marie Sillas, coach sportive · accueil">
          <img src={icone} alt="" width="44" height="40" />
          <span className="entete__signature" aria-hidden="true">Marie Sillas, coach sportive</span>
        </Link>
        <div className="entete__droite">
          <nav className="nav" aria-label="Menu principal" ref={navRef}>
            {PAGES_MENU.map((page) => (
              <NavLink key={page.to} to={page.to} end={page.to === '/'}>
                {page.label}
              </NavLink>
            ))}
            <span
              className="nav__trait"
              aria-hidden="true"
              style={
                trait
                  ? {
                      transform: `translate(${trait.left}px, ${trait.top}px)`,
                      width: trait.width,
                      transition: trait.anime ? undefined : 'none',
                    }
                  : { opacity: 0 }
              }
            />
          </nav>
          <button
            type="button"
            className="menu-bouton"
            aria-expanded={ouvert}
            aria-controls="menu-mobile"
            onClick={() => setOuvert((o) => !o)}
          >
            {ouvert ? 'Fermer' : 'Menu'}
            <span className="menu-bouton__icone" aria-hidden="true" />
          </button>
        </div>
      </div>
      <nav id="menu-mobile" className={`menu-mobile ${ouvert ? 'ouvert' : ''}`} aria-label="Menu mobile">
        {PAGES_MENU.map((page) => (
          <NavLink key={page.to} to={page.to} end={page.to === '/'}>
            {page.label}
            <Fleche />
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

export function Fleche({ taille = 20 }) {
  return (
    <svg aria-hidden="true" width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  )
}
