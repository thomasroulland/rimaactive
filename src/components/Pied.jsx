import { Link } from 'react-router-dom'
import logoCraie from '../assets/rimaactive-mot-craie.svg'
import { CONTACT, RESEAUX } from './liens.js'

// Bloc encre en bas de chaque page, en trois bandes séparées par un filet :
// 1) « Contactez-moi », où Marie se déplace, et le bouton « M'écrire » ;
// 2) l'e-mail et les réseaux en bulles ; 3) le logo, le © et les mentions.
// Sur la page M'écrire, qui reprend déjà « Contactez-moi », il ne reste que la ligne des mentions.
export default function Pied({ seulementMentions = false }) {
  return (
    <footer className={`pied ${seulementMentions ? 'pied--mentions' : 'sur-encre'}`} aria-labelledby={seulementMentions ? undefined : 'contact-titre'}>
      <div className="conteneur">
        {!seulementMentions && (
          <>
            <div className="pied__appel">
              <div>
                <p className="surtitre">Besoin d’en savoir plus ?</p>
                <h2 id="contact-titre" className="titre titre--section">Contactez-moi</h2>
                <p className="pied__lieu">Basée à Houdan (78), je me déplace dans les Yvelines, l’Eure-et-Loir et l’Eure.</p>
              </div>
              <Link to="/contact" className="bouton bouton--principal pied__bouton">M’écrire</Link>
            </div>
            <div className="pied__contacts">
              <div>
                <p className="mention">E-mail</p>
                <a className="pied__email" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </div>
              <div>
                <p className="mention">Suivez-moi</p>
                <ul className="pied__reseaux">
                  {RESEAUX.map((reseau) => (
                    <li key={reseau.label}>
                      <a href={reseau.href} target="_blank" rel="noopener noreferrer">{reseau.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
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
