import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import logo from '../assets/logo.png'
import { PAGES } from './liens.js'

const PAGES_MENU = PAGES.filter((page) => page.to !== '/contact')

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
  const { pathname } = useLocation()
  const [ouvert, setOuvert] = useState(false)
  // Dès qu'on descend un peu, le logo se réduit à son symbole
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const suivre = () => setCompact(window.scrollY > 40)
    suivre()
    window.addEventListener('scroll', suivre, { passive: true })
    return () => window.removeEventListener('scroll', suivre)
  }, [])

  // Le menu mobile se referme quand on change de page ou qu'on appuie sur Échap
  useEffect(() => setOuvert(false), [pathname])
  useEffect(() => {
    if (!ouvert) return
    const fermer = (e) => e.key === 'Escape' && setOuvert(false)
    window.addEventListener('keydown', fermer)
    return () => window.removeEventListener('keydown', fermer)
  }, [ouvert])

  return (
    <header className={`entete ${compact ? 'entete--compacte' : ''}`}>
      <div className="entete__barre">
        <Link to="/" className="entete__logo" aria-label="Rimaactive, accueil">
          <LogoCompactable compact={compact} />
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
          <Link to="/contact" className="bouton bouton--principal bouton--compact">Me contacter</Link>
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
        <Link to="/contact" className="bouton bouton--principal">Me contacter</Link>
      </nav>
    </header>
  )
}

// Le logo découpé en morceaux de la même image (positions en pixels de logo.png, 2060 × 420).
// Le symbole du milieu reste ; les lettres autour se tassent dedans quand l'en-tête est compact.
const HAUTEUR_LOGO = 32
const K = HAUTEUR_LOGO / 420
const SYMBOLE = [650, 1124]
const MORCEAUX = [
  // [début, fin, ordre d'arrivée dans le symbole : les plus proches d'abord]
  [0, 182, 2], // r
  [182, 270, 1], // i
  [270, 650, 0], // m
  SYMBOLE,
  [1124, 1340, 0], // c
  [1340, 1510, 1], // t
  [1510, 1593, 2], // i
  [1593, 1814, 3], // v
  [1814, 2060, 4], // e
]

const DUREE_LOGO = 650 // ms
const doux = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

// Place chaque morceau pour un avancement p (0 : logo entier, 1 : symbole seul).
// Les lettres s'écrasent en accordéon : chacune reste collée à la précédente, les plus proches
// du symbole s'écrasent en premier, et le symbole glisse jusqu'au bord gauche.
function placer(morceaux, p) {
  const xSymbole = SYMBOLE[0] * K * (1 - doux(Math.min(1, p / 0.8)))
  const largeurSymbole = (SYMBOLE[1] - SYMBOLE[0]) * K
  let bordGauche = xSymbole
  let bordDroit = xSymbole + largeurSymbole
  // Du plus proche au plus loin de chaque côté
  const gauche = MORCEAUX.filter(([, x1]) => x1 <= SYMBOLE[0]).reverse()
  const droite = MORCEAUX.filter(([x0]) => x0 >= SYMBOLE[1])
  const ecrase = (ordre) => 1 - doux(Math.min(1, Math.max(0, (p - ordre * 0.1) / 0.55)))
  const poser = ([x0, x1, ordre], cote) => {
    const el = morceaux.get(x0)
    const echelle = ecrase(ordre)
    const largeur = (x1 - x0) * K * echelle
    let x
    if (cote === 'gauche') {
      bordGauche -= largeur
      x = bordGauche
    } else {
      x = bordDroit
      bordDroit += largeur
    }
    el.style.transform = `translateX(${x - x0 * K}px) scaleX(${echelle})`
    el.style.opacity = Math.min(1, echelle * 3)
  }
  gauche.forEach((m) => poser(m, 'gauche'))
  droite.forEach((m) => poser(m, 'droite'))
  morceaux.get(SYMBOLE[0]).style.transform = `translateX(${xSymbole - SYMBOLE[0] * K}px)`
}

// Au repos, on montre le logo d'un seul tenant : les jointures entre morceaux peuvent laisser un fin trait
function basculer(conteneur, p) {
  conteneur.classList.toggle('logo--entier', p === 0)
}

function LogoCompactable({ compact }) {
  const ref = useRef(null)
  const avancement = useRef(0)

  useEffect(() => {
    const conteneur = ref.current
    const morceaux = new Map([...conteneur.querySelectorAll('[data-x0]')].map((el) => [Number(el.dataset.x0), el]))
    const cible = compact ? 1 : 0
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      avancement.current = cible
      placer(morceaux, cible)
      basculer(conteneur, cible)
      return
    }
    // Part de là où en est l'animation, pour qu'un aller-retour rapide reste fluide
    const depart = avancement.current
    const debut = performance.now()
    const duree = DUREE_LOGO * Math.abs(cible - depart)
    let image
    const pas = (t) => {
      const f = duree ? Math.min(1, (t - debut) / duree) : 1
      avancement.current = depart + (cible - depart) * f
      placer(morceaux, avancement.current)
      basculer(conteneur, avancement.current)
      if (f < 1) image = requestAnimationFrame(pas)
    }
    image = requestAnimationFrame(pas)
    return () => cancelAnimationFrame(image)
  }, [compact])

  return (
    <span className="logo logo--entier" ref={ref} style={{ width: 2060 * K, height: HAUTEUR_LOGO }}>
      <img className="logo__entier" src={logo} alt="" width={2060 * K} height={HAUTEUR_LOGO} />
      {MORCEAUX.map(([x0, x1]) => (
        <span
          key={x0}
          data-x0={x0}
          aria-hidden="true"
          className={`logo__morceau ${x0 === SYMBOLE[0] ? 'logo__morceau--symbole' : ''}`}
          style={{
            left: x0 * K,
            width: (x1 - x0) * K,
            backgroundImage: `url(${logo})`,
            backgroundPosition: `${-x0 * K}px 0`,
          }}
        />
      ))}
    </span>
  )
}

export function Fleche({ taille = 20 }) {
  return (
    <svg aria-hidden="true" width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  )
}
