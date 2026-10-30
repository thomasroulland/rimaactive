import { Link } from 'react-router-dom'
import PresentationContact from './AppelContact.jsx'
import { PAGES, CONTACT, RESEAUX } from './liens.js'

// Bloc encre en bas de chaque page : « Contactez-moi » et la zone d'intervention à gauche,
// le menu, l'e-mail et Instagram à droite, puis les mentions. Sur la page M'écrire, qui reprend
// déjà « Contactez-moi », il ne reste que la ligne des mentions.
export default function Pied({ seulementMentions = false }) {
  return (
    <footer className={`pied ${seulementMentions ? 'pied--mentions' : 'sur-encre'}`} aria-labelledby={seulementMentions ? undefined : 'contact-titre'}>
      <div className="conteneur">
        {!seulementMentions && (
          <div className="pied__grille">
            <PresentationContact />
            <div className="pied__infos">
              <nav className="pied__menu" aria-label="Pied de page">
                {PAGES.map((page) => (
                  <Link key={page.to} to={page.to}>{page.label}</Link>
                ))}
              </nav>
              <div>
                <p className="mention">E-mail</p>
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </div>
              <div>
                <p className="mention">Suivez-moi</p>
                {RESEAUX.map((reseau) => (
                  <a key={reseau.label} href={reseau.href} target="_blank" rel="noopener noreferrer">{reseau.label}</a>
                ))}
              </div>
            </div>
          </div>
        )}
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
