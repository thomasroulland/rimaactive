import { Link } from 'react-router-dom'
import logoBlanc from '../assets/logo-blanc.png'
import { PAGES, CONTACT, RESEAUX } from './liens.js'

export default function Pied() {
  return (
    <footer className="pied">
      <div className="conteneur">
        <div className="pied__haut">
          <Link to="/" className="pied__logo" aria-label="Rimaactive, accueil">
            <img src={logoBlanc} alt="rimaactive" />
          </Link>
          <nav className="pied__colonne" aria-label="Pied de page">
            {PAGES.filter((page) => page.to !== '/contact').map((page) => (
              <Link key={page.to} to={page.to}>{page.label}</Link>
            ))}
          </nav>
          <div className="pied__colonne">
            <p className="pied__titre">contact</p>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <a href={CONTACT.telephoneLien}>{CONTACT.telephone}</a>
          </div>
          <div className="pied__colonne">
            <p className="pied__titre">suivez-moi</p>
            {RESEAUX.map((reseau) => (
              <a key={reseau.label} href={reseau.href}>{reseau.label}</a>
            ))}
          </div>
        </div>
        <div className="pied__bas">
          <a href="#">Mentions légales</a>
          <a href="#">Confidentialité</a>
        </div>
      </div>
    </footer>
  )
}
