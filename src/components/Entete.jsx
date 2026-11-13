import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import logoCraie from '../assets/rimaactive-mot-craie.svg'
import { PAGES_MENU } from './liens.js'
import Picto from './Picto.jsx'

// Barre de menu, la même sur tout le site et dans l'espace (13 novembre 2026) : logo à gauche, le menu, « M'écrire »
// et le rond du compte à droite.
// `liens` : les pages du menu (celles du site par défaut, celles de l'espace une fois connecté).
// `ecrire` : afficher « M'écrire ». `compte` : ce qui se met dans le rond de droite (par défaut, le lien « Mon espace »).
// `accueil` : où mène le logo. `rangee` : sur téléphone, les liens restent visibles sur une seconde ligne (espace),
// au lieu du bouton « Menu » (site).
export default function Entete({ liens = PAGES_MENU, ecrire = true, compte, accueil = '/', rangee = false }) {
  const { pathname } = useLocation()
  // pages qui commencent par une photo plein cadre : les trois pages de formules
  const surPhoto = useSurPhoto(false)
  const [ouvert, setOuvert] = useState(false)
  // Sur l'accueil, « M'écrire » est déjà dans le haut de page : celui de la barre n'apparaît qu'en arrivant sur « Mon approche »
  // Sur la page M'écrire elle-même, il est caché aussi (on y est déjà) ; sa place est gardée pour que rien ne bouge
  const ecrireVisible = useEcrireVisible(pathname === '/') && pathname !== '/contact'
  const avecMenu = !rangee && liens.length > 0
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
    <header className={`entete ${surPhoto && !ouvert ? 'entete--sur-photo' : ''} ${rangee ? 'entete--rangee' : ''}`}>
      <div className="entete__barre">
        {/* Barre encre (choix de Marie, 11 novembre 2026) : logo craie. Le logo ramène en haut de l'accueil (utile surtout sur téléphone, où le menu est replié) */}
        <Link to={accueil} className="entete__logo" aria-label="Rimaactive, retour à l’accueil"
          onClick={() => { setOuvert(false); if (pathname === accueil) window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          <img src={logoCraie} alt="Rimaactive, Marie Sillas coach sportive" width="128" height="26" />
        </Link>
        {/* Menu à droite, à côté de « M'écrire » (11 novembre 2026) ; mots simples ; la page en cours est dans une pilule encre ; au survol le jaune monte et le mot « roule » vers le haut (choix de Marie, novembre 2026) */}
        <nav className="nav" aria-label="Menu principal">
          {liens.map((page) => {
            const mot = <span className="roule" data-texte={page.label}>{page.label}</span>
            // `courant` fixé par l'espace (sur une séance, l'onglet d'où l'on vient reste allumé)
            return page.courant === undefined
              ? <NavLink key={page.to} to={page.to} end={page.end ?? (page.to === '/' || page.to === '/espace')} className="nav__lien" onClick={versLeHaut(page)}>{mot}</NavLink>
              : <Link key={page.to} to={page.to} className="nav__lien" aria-current={page.courant ? 'page' : undefined}>{mot}</Link>
          })}
        </nav>
        <div className="entete__droite">
          {/* « M'écrire » : collé au menu, séparé par un trait fin, texte craie, flèche dans une pastille jaune (choix de Marie, 11 novembre 2026) */}
          {ecrire && <Link to="/contact" className={`entete__ecrire ${ecrireVisible ? '' : 'entete__ecrire--cache'}`} tabIndex={ecrireVisible ? undefined : -1} aria-hidden={ecrireVisible ? undefined : true}>M’écrire <FlecheDiagonale /></Link>}
          {/* Espace de connexion : mène à /espace (connexion, puis espace client ou coach). Sur ordinateur, l'icône est dans la marge à droite de « M'écrire », qui garde ainsi sa place */}
          {compte === undefined
            ? (
              <Link to="/espace" className="entete__compte" aria-label="Mon espace" title="Mon espace">
                <Picto nom="user-circle" taille={24} />
              </Link>
            )
            : compte}
          {avecMenu && <button
            type="button"
            className="menu-bouton"
            aria-expanded={ouvert}
            aria-controls="menu-mobile"
            onClick={() => setOuvert((o) => !o)}
          >
            {ouvert ? 'Fermer' : 'Menu'}
          </button>}
        </div>
      </div>
      {avecMenu && <nav id="menu-mobile" className={`menu-mobile ${ouvert ? 'ouvert' : ''}`} aria-label="Menu mobile">
        {liens.map((page) => (
          <NavLink key={page.to} to={page.to} end={page.end ?? (page.to === '/' || page.to === '/espace')} onClick={versLeHaut(page)}>
            {page.label}
            <Fleche />
          </NavLink>
        ))}
      </nav>}
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

// Vrai partout, sauf sur l'accueil tant qu'on est encore sur le haut de page
function useEcrireVisible(accueil) {
  const [visible, setVisible] = useState(!accueil)
  useEffect(() => {
    if (!accueil) { setVisible(true); return }
    const suivre = () => {
      // visible dès qu'on a quitté le haut de page (qui a déjà son bouton « M'écrire »)
      const heros = document.querySelector('.heros')
      setVisible(!!heros && heros.getBoundingClientRect().bottom < window.innerHeight * 0.5)
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
