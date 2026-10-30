import { Link } from 'react-router-dom'
import { CONTACT } from './liens.js'
import Picto from './Picto.jsx'
import { Fleche } from './Entete.jsx'

// Colonne de gauche du bloc « Contactez-moi », reprise telle quelle en haut de la page M'écrire :
// surtitre, titre, une phrase, puis la zone d'intervention et le lien vers la carte de l'accueil
export default function PresentationContact({ titre: Titre = 'h2', avecEmail = false }) {
  return (
    <div className="presentation-contact">
      <p className="surtitre">Besoin d’un accompagnement ?</p>
      <Titre id="contact-titre" className="titre titre--section">Contactez-moi</Titre>
      <p className="texte">Dites-moi où vous en êtes et ce que vous cherchez.</p>
      <div className="presentation-contact__zone">
        <span className="presentation-contact__picto"><Picto nom="map-pin" taille={20} /></span>
        <div>
          <p className="mention">Ma zone d’intervention</p>
          <p className="presentation-contact__lieu">Houdan (78) et 20&nbsp;km autour</p>
          <Link to="/#zone" className="mention presentation-contact__lien">Voir la carte <Fleche taille={14} /></Link>
        </div>
      </div>
      {avecEmail && (
        <div className="presentation-contact__email">
          <p className="mention">E-mail</p>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        </div>
      )}
    </div>
  )
}
