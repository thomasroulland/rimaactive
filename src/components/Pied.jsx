import { Link } from 'react-router-dom'
import logoCraie from '../assets/rimaactive-mot-craie.svg'
import { CONTACT, RESEAUX } from './liens.js'

// Bas de page discret, en encre : sur une ligne le logo et où Marie se déplace, l'e-mail, les réseaux ;
// puis une fine ligne avec le © et le lien vers les informations légales.
// Sur la page M'écrire, qui reprend déjà le contact, il ne reste que la ligne du bas.
export default function Pied({ seulementMentions = false }) {
  return (
    <footer className={`pied ${seulementMentions ? 'pied--mentions' : 'sur-encre'}`}>
      <div className="conteneur">
        {!seulementMentions && (
          <div className="pied__ligne">
            <div className="pied__marque">
              <img className="pied__logo" src={logoCraie} alt="Rimaactive" width="104" height="21" />
              <p className="pied__lieu">
                Basée à Houdan, je me déplace dans les Yvelines (78),{' '}<br className="saut" />
                l’Eure-et-Loir (28) et l’Eure (27).
              </p>
            </div>
            <a className="pied__email" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <ul className="pied__reseaux" aria-label="Réseaux sociaux">
              {RESEAUX.map((reseau) => (
                <li key={reseau.label}>
                  <a href={reseau.href} target="_blank" rel="noopener noreferrer">{reseau.label}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="pied__bas">
          <span>© {new Date().getFullYear()} Rimaactive</span>
          <Link to="/mentions-legales">Mentions légales et politique de confidentialité</Link>
        </div>
      </div>
    </footer>
  )
}
