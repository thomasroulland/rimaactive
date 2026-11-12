import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { CONTACT } from '../../components/liens.js'
import logoCraie from '../../assets/rimaactive-mot-craie.svg'
import { seDeconnecter } from '../firebase.js'
import '../coache.css'

// Coque de l'espace : barre noire (logo, liens, rond de compte), contenu, pied.
// `compte` : afficher le rond de compte et son menu (faux avant la connexion). `avatar` : adresse d'une photo de profil.
export default function Coque({ liens = [], compte = true, avatar = null, children }) {
  return (
    <div className="ec-coque">
      <a className="lien-evitement" href="#contenu">Aller au contenu</a>
      <header className="ec-bandeau">
        <div className="ec-bandeau__ligne">
          <NavLink to="/espace" className="ec-logo" aria-label="Rimaactive, mon espace">
            <img src={logoCraie} alt="" width="128" height="30" />
          </NavLink>
          {liens.length > 0 && (
            <nav className="ec-nav" aria-label="Espace client">
              {liens.map((lien) => (
                <NavLink key={lien.to} to={lien.to} end={lien.to === '/espace'} className="ec-onglet">{lien.label}</NavLink>
              ))}
            </nav>
          )}
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
