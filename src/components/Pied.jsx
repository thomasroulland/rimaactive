import { Link } from 'react-router-dom'
import logoCraie from '../assets/rimaactive-mot-craie.svg'
import { PAGES, CONTACT, RESEAUX } from './liens.js'

export default function Pied() {
  return (
    <footer className="pied sur-encre">
      <div className="conteneur">
        <div className="pied__haut">
          <div className="pied__colonne">
            <Link to="/" className="pied__logo" aria-label="Rimaactive, accueil">
              <img src={logoCraie} alt="rimaactive" width="168" height="34" />
            </Link>
          </div>
          <nav className="pied__colonne" aria-label="Pied de page">
            <p className="mention">Le site</p>
            {PAGES.map((page) => (
              <Link key={page.to} to={page.to}>{page.label}</Link>
            ))}
          </nav>
          <div className="pied__colonne">
            <p className="mention">Contact</p>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <span style={{ padding: '6px 0', color: 'rgba(244, 243, 239, 0.72)' }}>Houdan et 20 km autour</span>
          </div>
          <div className="pied__colonne">
            <p className="mention">Suivez-moi</p>
            {RESEAUX.map((reseau) => (
              <a key={reseau.label} href={reseau.href}>{reseau.label}</a>
            ))}
          </div>
        </div>
        <div className="pied__bas">
          <span>© {new Date().getFullYear()} Rimaactive</span>
          <nav aria-label="Informations légales">
            <Link to="/mentions-legales">Mentions légales</Link>
            <Link to="/confidentialite">Confidentialité</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
