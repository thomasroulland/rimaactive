import { Link } from 'react-router-dom'
import logoCraie from '../assets/rimaactive-mot-craie.svg'
import { CONTACT, RESEAUX } from './liens.js'

// Bloc encre en bas de chaque page : sur une ligne « Contactez-moi » (et où Marie se déplace), l'e-mail
// et les réseaux en bulles ; puis, sous un filet, le logo, le © et les mentions. Pas de bouton « M'écrire » :
// il est déjà en haut à droite.
// Sur la page M'écrire, qui reprend déjà « Contactez-moi », il ne reste que la ligne des mentions.
export default function Pied({ seulementMentions = false }) {
  return (
    <footer className={`pied ${seulementMentions ? 'pied--mentions' : 'sur-encre'}`} aria-labelledby={seulementMentions ? undefined : 'contact-titre'}>
      <div className="conteneur">
        {!seulementMentions && (
          <div className="pied__ligne">
            <div className="pied__tete">
              <p className="surtitre">Besoin d’en savoir plus ?</p>
              <h2 id="contact-titre" className="titre titre--section">Contactez-moi</h2>
            </div>
            <p className="pied__lieu">
              Basée à Houdan, je me déplace dans les Yvelines (78),{' '}<br className="saut" />
              l’Eure-et-Loir (28) et l’Eure (27).
            </p>
            <p className="mention pied__m-email">E-mail</p>
            <a className="pied__email" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <p className="mention pied__m-reseaux">Suivez-moi</p>
            <ul className="pied__reseaux">
              {RESEAUX.map((reseau) => (
                <li key={reseau.label}>
                  <a href={reseau.href} target="_blank" rel="noopener noreferrer">{reseau.label}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="pied__bas">
          {!seulementMentions && <img className="pied__logo" src={logoCraie} alt="Rimaactive" width="104" height="21" />}
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
