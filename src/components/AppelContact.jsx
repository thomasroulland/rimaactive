import { CONTACT } from './liens.js'
import Picto from './Picto.jsx'

// Colonne de gauche du bloc « Contactez-moi », reprise en haut de la page M'écrire (avec l'e-mail)
export default function PresentationContact({ titre: Titre = 'h2', avecEmail = false }) {
  return (
    <div className="presentation-contact">
      <p className="surtitre">Échangeons ensemble</p>
      <Titre id="contact-titre" className="titre titre--section">Contactez-moi</Titre>
      <p className="texte presentation-contact__lieu presentation-contact__lieu--court"><Picto nom="map-pin" taille={18} />Basée à Houdan, j’interviens dans le 78,<br className="saut-tel" /> le 28 et le 27.</p>
      {avecEmail && (
        <div className="presentation-contact__email">
          <p className="mention">E-mail</p>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        </div>
      )}
    </div>
  )
}
