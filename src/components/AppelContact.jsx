import { CONTACT } from './liens.js'

// Colonne de gauche du bloc « Contactez-moi », reprise en haut de la page M'écrire (avec l'e-mail)
export default function PresentationContact({ titre: Titre = 'h2', avecEmail = false }) {
  return (
    <div className="presentation-contact">
      <p className="surtitre">Besoin d’en savoir plus ?</p>
      <Titre id="contact-titre" className="titre titre--section">Contactez-moi</Titre>
      {avecEmail && (
        <div className="presentation-contact__email">
          <p className="mention">E-mail</p>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        </div>
      )}
    </div>
  )
}
