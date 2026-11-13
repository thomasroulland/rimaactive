import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CONTACT } from '../../components/liens.js'
import logoCraie from '../../assets/rimaactive-mot-craie.svg'
import { seDeconnecter } from '../firebase.js'
import useGlissiere from './useGlissiere.js'
import '../coache.css'

// Coque de l'espace : barre noire (logo, liens, rond de compte), contenu, pied.
// `compte` : afficher le rond de compte et son menu (faux avant la connexion). `avatar` : adresse d'une photo de profil.
// `site` : menu du site (Accueil, Mes offres, M'écrire) à la place des liens de l'espace (connexion, accord).
// `client` : écrans du coaché (sélection, curseur et focus aux couleurs de la charte) ; les écrans du coach n'en ont pas.
export default function Coque({ liens = [], compte = true, avatar = null, site = false, client = false, children }) {
  return (
    <div className={`ec-coque${client ? ' ec-coque--client' : ''}`}>
      <a className="lien-evitement" href="#contenu">Aller au contenu</a>
      <header className="ec-bandeau">
        <div className="ec-bandeau__ligne">
          <NavLink to="/espace" className="ec-logo" aria-label="Rimaactive, mon espace">
            <img src={logoCraie} alt="" width="128" height="30" />
          </NavLink>
          {site ? <NavSite /> : liens.length > 0 && <Nav liens={liens} />}
          {compte && <MenuCompte avatar={avatar} />}
        </div>
      </header>
      <main id="contenu" className="ec-main">{children}</main>
      <footer className="ec-pied">
        <div className="ec-pied__ligne">
          <span>Marie Sillas · Coach sportive diplômée</span>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        </div>
      </footer>
    </div>
  )
}

function Nav({ liens }) {
  const { pathname, state } = useLocation()
  const ref = useGlissiere(`${pathname}|${state?.depuis ?? ''}`)
  return (
    <nav className="ec-nav ec-glisse" aria-label="Espace client" ref={ref}>
      {liens.map((lien) => <Onglet key={lien.to} lien={lien} />)}
    </nav>
  )
}

// Menu du site sur la connexion et l'accord : mêmes mots que la barre du site, au style de la barre de l'espace
function NavSite() {
  return (
    <nav className="ec-nav ec-nav--site" aria-label="Menu du site">
      <Link to="/" className="ec-onglet">Accueil</Link>
      <Link to="/offres" className="ec-onglet">Mes offres</Link>
      <Link to="/contact" className="ec-onglet ec-ecrire">M’écrire
        <span className="ec-ecrire__rond" aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round"><path d="M72 184L184 72M88 72h96v96" /></svg>
        </span>
      </Link>
    </nav>
  )
}

function MenuCompte({ avatar }) {
  const [ouvert, setOuvert] = useState(false)
  const [encours, setEncours] = useState(false)
  const racine = useRef(null)
  const bouton = useRef(null)

  useEffect(() => {
    if (!ouvert) return undefined
    const dehors = (e) => { if (racine.current && !racine.current.contains(e.target)) setOuvert(false) }
    const touche = (e) => {
      if (e.key !== 'Escape') return
      setOuvert(false)
      bouton.current?.focus()
    }
    document.addEventListener('pointerdown', dehors)
    document.addEventListener('keydown', touche)
    return () => {
      document.removeEventListener('pointerdown', dehors)
      document.removeEventListener('keydown', touche)
    }
  }, [ouvert])

  const sortir = async () => {
    setEncours(true)
    try { await seDeconnecter() } finally { setEncours(false) }
  }

  return (
    <div className="ec-compte" ref={racine}>
      <button
        type="button"
        ref={bouton}
        className="ec-rond"
        aria-label="Mon compte"
        aria-expanded={ouvert}
        aria-haspopup="true"
        aria-controls="ec-menu-compte"
        onClick={() => setOuvert((o) => !o)}
      >
        {avatar
          ? <span className="ec-rond__img" style={{ backgroundImage: `url("${avatar}")` }} />
          : (
            <svg width="24" height="24" aria-hidden="true" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="128" cy="96" r="44" />
              <path d="M44 212c16-36 48-56 84-56s68 20 84 56" />
            </svg>
          )}
      </button>
      {ouvert && (
        <div className="ec-menu" id="ec-menu-compte">
          <button type="button" className="ec-menu__bouton" data-quitter onClick={sortir} disabled={encours}>Se déconnecter</button>
        </div>
      )}
    </div>
  )
}

// Onglet de la barre. Sur une séance, l'onglet d'où l'on vient reste souligné (maquette) :
// « Mon programme » si la séance a été ouverte depuis Mon programme, sinon « Tableau de bord ».
function Onglet({ lien }) {
  const { pathname, state } = useLocation()
  if (pathname.startsWith('/espace/seance/')) {
    const actif = lien.to === (state?.depuis === 'programme' ? '/espace/programme' : '/espace')
    return <Link to={lien.to} className="ec-onglet" aria-current={actif ? 'page' : undefined}>{lien.label}</Link>
  }
  return <NavLink to={lien.to} end={lien.to === '/espace'} className="ec-onglet">{lien.label}</NavLink>
}
