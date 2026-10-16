import { useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'
import { PAGES } from './liens.js'

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
        actif
          ? {
              left: actif.offsetLeft,
              top: actif.offsetTop + actif.offsetHeight - 2,
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

  return (
    <header className="entete">
      <Link to="/" className="entete__logo" aria-label="Rimaactive, accueil">
        <img src={logo} alt="rimaactive" />
      </Link>
      <nav className="nav" aria-label="Menu principal" ref={navRef}>
        {PAGES.map((page) => (
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
      <Link to="/contact" className="bouton bouton--petit">Me contacter</Link>
    </header>
  )
}
