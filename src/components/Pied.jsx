import { Link } from 'react-router-dom'
import logoBlanc from '../assets/logo-blanc.png'
import { PAGES, CONTACT, RESEAUX } from './liens.js'

export default function Pied() {
  return (
    <footer className="pied sur-encre">
      <div className="conteneur">
        <div className="pied__haut">
          <div className="pied__colonne">
            <Link to="/" className="pied__logo" aria-label="Rimaactive, accueil">
              <img src={logoBlanc} alt="rimaactive" width="158" height="36" />
            </Link>
          </div>
          <nav className="pied__colonne" aria-label="Pied de page">
            <p className="mention">le site</p>
            {PAGES.map((page) => (
              <Link key={page.to} to={page.to}>{page.label}</Link>
            ))}
          </nav>
          <div className="pied__colonne">
            <p className="mention">contact</p>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <a href={CONTACT.telephoneLien}>{CONTACT.telephone}</a>
            <span style={{ padding: '6px 0', color: 'rgba(255,255,255,.7)' }}>Houdan et 20 km autour</span>
          </div>
          <div className="pied__colonne">
            <p className="mention">suivez-moi</p>
            {RESEAUX.map((reseau) => (
              <a key={reseau.label} href={reseau.href}>{reseau.label}</a>
            ))}
          </div>
        </div>
        <div className="pied__bas">
          <span>© {new Date().getFullYear()} Rimaactive</span>
          <nav aria-label="Informations légales">
            <a href="#">Mentions légales</a>
            <a href="#">Confidentialité</a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
