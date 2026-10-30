import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PresentationContact from '../components/AppelContact.jsx'
import useTitre from '../components/useTitre.js'

export default function Contact() {
  useTitre('Contact')
  const [envoye, setEnvoye] = useState(false)
  // Formule choisie depuis une carte des pages Entreprises, Duo et groupes ou Individuel (ex. « Active Flex · À domicile »)
  const [parametres] = useSearchParams()
  const formule = parametres.get('formule') ?? ''
  const contexte = formule.split(' · ')[1] ?? ''
  const profilChoisi = contexte === 'Entreprises' ? 'entreprise' : contexte === 'Duo et groupes' ? 'groupe' : formule ? 'particulier' : undefined

  // Envoi à brancher (Formspree, Resend, fonction Vercel…) : pour l'instant on affiche la confirmation
  function envoyer(event) {
    event.preventDefault()
    setEnvoye(true)
  }

  return (
    // Page M'écrire, sur fond craie : « Contactez-moi » et l'e-mail à gauche, le formulaire à droite
    <section className="section page-contact" aria-labelledby="contact-titre">
      <div className="conteneur page-contact__grille">
        <PresentationContact titre="h1" avecEmail />

        {envoye ? (
          <div role="status" className="confirmation">
            <p className="surtitre">Merci</p>
            <p className="titre titre--section">Message envoyé</p>
            <p className="texte provisoire">[Message de confirmation à rédiger]</p>
          </div>
        ) : (
          <form className="formulaire" onSubmit={envoyer}>
            <div className="champ-groupe">
              <label htmlFor="nom">Prénom et nom</label>
              <input id="nom" name="nom" className="champ" type="text" autoComplete="name" placeholder="Prénom et nom" required />
            </div>
            <div className="champ-groupe">
              <label htmlFor="email">E-mail</label>
              <input id="email" name="email" className="champ" type="email" autoComplete="email" placeholder="vous@exemple.fr" required />
            </div>
            {formule && (
              <div className="champ-groupe">
                <label htmlFor="formule">Formule choisie</label>
                <input id="formule" name="formule" className="champ" type="text" defaultValue={formule} />
              </div>
            )}
            {/* à côté de la formule choisie quand il y en a une, sur toute la largeur sinon */}
            <div className={`champ-groupe ${formule ? '' : 'pleine'}`}>
              <label htmlFor="profil">Vous êtes</label>
              <select id="profil" name="profil" className="champ" defaultValue={profilChoisi ?? 'particulier'}>
                <option value="particulier">Particulier</option>
                <option value="entreprise">Entreprise</option>
                <option value="groupe">Duo ou groupe</option>
              </select>
            </div>
            <div className="champ-groupe pleine">
              <label htmlFor="message">
                Votre message <span className="optionnel">(facultatif)</span>
              </label>
              <textarea id="message" name="message" className="champ" rows="3" placeholder="Vos objectifs, vos disponibilités…" />
            </div>
            <label className="case pleine">
              <input type="checkbox" name="accord" required />
              <span>
                J’accepte d’être recontacté(e) au sujet de ma demande. Mes informations restent privées
                (<Link to="/confidentialite">politique de confidentialité</Link>).
              </span>
            </label>
            <div className="pleine">
              <button type="submit" className="bouton bouton--principal">Envoyer</button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
