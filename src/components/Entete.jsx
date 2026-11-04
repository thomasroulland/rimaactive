import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import logoCraie from '../assets/rimaactive-mot-craie.svg'
import logoEncre from '../assets/rimaactive-mot-encre.svg'
import { PAGES_MENU } from './liens.js'
import Picto from './Picto.jsx'

// Barre de menu : logo « rimaactive » à gauche, les pages en bulles au centre, « M'écrire » à droite.
// Sur l'accueil et les pages de formules, tant qu'on n'a pas défilé, elle se fond dans la photo (logo et textes
// clairs) ; dès qu'on défile, et sur les autres pages, elle passe en craie. Seules les couleurs changent.
export default function Entete() {
  const { pathname } = useLocation()
  // pages qui commencent par une photo plein cadre : les trois pages de formules
  const surPhoto = useSurPhoto(['/entreprises', '/communes', '/particuliers'].includes(pathname))
  const [ouvert, setOuvert] = useState(false)
  // Sur l'accueil, « M'écrire » est déjà dans le haut de page : celui de la barre n'apparaît qu'en arrivant sur « Mon approche »
  const ecrireVisible = useEcrireVisible(pathname === '/')
  // « Accueil » ramène toujours tout en haut de l'accueil, même quand on y est déjà
  const versLeHaut = (page) => () => { if (page.to === pathname) window.scrollTo({ top: 0, behavior: 'smooth' }) }
  // Le menu mobile se referme quand on change de page ou qu'on appuie sur Échap
  useEffect(() => setOuvert(false), [pathname])
  useEffect(() => {
    if (!ouvert) return
    const fermer = (e) => e.key === 'Escape' && setOuvert(false)
    window.addEventListener('keydown', fermer)
    return () => window.removeEventListener('keydown', fermer)
  }, [ouvert])

  return (
    <header className={`entete ${surPhoto && !ouvert ? 'entete--sur-photo' : ''}`}>
      <div className="entete__barre">
        {/* Simple logo, pas un lien : « Accueil » est dans le menu */}
        <div className="entete__logo">
          <img src={surPhoto && !ouvert ? logoCraie : logoEncre} alt="Rimaactive, Marie Sillas coach sportive" width="104" height="21" />
        </div>
        <nav className="nav" aria-label="Menu principal">
          {PAGES_MENU.map((page) => (
            <NavLink key={page.to} to={page.to} end={page.to === '/'} className="nav__bulle" onClick={versLeHaut(page)}>
              {page.label}
            </NavLink>
          ))}
        </nav>
        <div className="entete__droite">
          <Link to="/contact" className={`entete__ecrire ${ecrireVisible ? '' : 'entete__ecrire--cache'}`} tabIndex={ecrireVisible ? undefined : -1} aria-hidden={ecrireVisible ? undefined : true}>M’écrire <FlecheDiagonale /></Link>
          {/* Espace de connexion (futurs coachings : tableau de bord, programme) ; sur ordinateur il se place dans
              la marge à droite de « M'écrire », qui garde ainsi sa place */}
          <Link to="/espace" className="entete__compte" aria-label="Mon espace" title="Mon espace">
            <Picto nom="user-circle" taille={22} />
          </Link>
          <button
            type="button"
            className="menu-bouton"
            aria-expanded={ouvert}
            aria-controls="menu-mobile"
            onClick={() => setOuvert((o) => !o)}
          >
            {ouvert ? 'Fermer' : 'Menu'}
          </button>
        </div>
      </div>
      <nav id="menu-mobile" className={`menu-mobile ${ouvert ? 'ouvert' : ''}`} aria-label="Menu mobile">
        {PAGES_MENU.map((page) => (
          <NavLink key={page.to} to={page.to} end={page.to === '/'} onClick={versLeHaut(page)}>
            {page.label}
            <Fleche />
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

// Vrai tant que l'accueil n'a pas défilé : la barre est alors posée sur la photo
function useSurPhoto(actif) {
  const [enHaut, setEnHaut] = useState(() => window.scrollY < 1)
  useEffect(() => {
    if (!actif) return
    const suivre = () => setEnHaut(window.scrollY < 1)
    suivre()
    window.addEventListener('scroll', suivre, { passive: true })
    return () => window.removeEventListener('scroll', suivre)
  }, [actif])
  return actif && enHaut
}

// Vrai partout, sauf sur l'accueil tant que la rubrique « Mon approche » n'atteint pas le haut de l'écran
function useEcrireVisible(accueil) {
  const [visible, setVisible] = useState(!accueil)
  useEffect(() => {
    if (!accueil) { setVisible(true); return }
    const suivre = () => {
      const approche = document.getElementById('approche')
      setVisible(!!approche && approche.getBoundingClientRect().top < window.innerHeight * 0.5)
    }
    suivre()
    window.addEventListener('scroll', suivre, { passive: true })
    window.addEventListener('resize', suivre)
    return () => { window.removeEventListener('scroll', suivre); window.removeEventListener('resize', suivre) }
  }, [accueil])
  return visible
}

function FlecheDiagonale() {
  return (
    <svg aria-hidden="true" viewBox="0 0 256 256" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round">
      <path d="M72 184 184 72M88 72h96v96" />
    </svg>
  )
}

export function Fleche({ taille = 20 }) {
  return (
    <svg aria-hidden="true" width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  )
}
