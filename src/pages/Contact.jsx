import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import photoMarie from '../assets/portrait-contact.jpg'
import PresentationContact from '../components/AppelContact.jsx'
import useTitre from '../components/useTitre.js'
import { PAGE as ENTREPRISES } from './Entreprises.jsx'
import { PAGE as GROUPES } from './Communes.jsx'
import { PAGE as INDIVIDUEL } from './Particuliers.jsx'

// Les trois offres et leurs formules, reprises des pages (« Active Progress · Présentiel », « Active 60 · Entreprises »…) :
// la même écriture que celle envoyée par le bouton « Choisir » d'une carte
const OFFRES = [ENTREPRISES, GROUPES, INDIVIDUEL].map((page) => ({
  nom: page.titre,
  formules: page.cartes.map((f) => `${f.nom} · ${f.mode ?? page.titre}`),
}))

export default function Contact() {
  useTitre('Contact')
  const [envoye, setEnvoye] = useState(false)
  // Formule choisie depuis une carte des pages Entreprises, Duo et groupes ou Individuel (ex. « Active Progress · Présentiel ») :
  // l'offre et la formule sont alors déjà cochées
  const [parametres] = useSearchParams()
  const formuleVenue = parametres.get('formule') ?? ''
  const offreVenue = OFFRES.find((o) => o.formules.includes(formuleVenue))
  // depuis une carte de l'accueil (« Me contacter ») : seulement l'offre (?offre=Entreprises)
  const offreSeule = OFFRES.find((o) => o.nom === parametres.get('offre'))?.nom
  const [offre, setOffre] = useState(offreVenue?.nom ?? offreSeule ?? '')
  const [formule, setFormule] = useState(offreVenue ? formuleVenue : '')
  const formulesOffre = OFFRES.find((o) => o.nom === offre)?.formules ?? []

  // Envoi à brancher (Formspree, Resend, fonction Vercel…) : pour l'instant on affiche la confirmation
  function envoyer(event) {
    event.preventDefault()
    setEnvoye(true)
  }

  return (
    // Page M'écrire (maquette 2) : la photo de Marie sur la moitié gauche ; à droite « Contactez-moi »,
    // la phrase, l'e-mail, puis le formulaire
    <section className="page-contact" aria-labelledby="contact-titre">
      <img className="page-contact__photo" src={photoMarie} alt="Marie Sillas, bras croisés" />
      <div className="page-contact__droite">
        <PresentationContact titre="h1" />

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
            <div className={`champ-groupe ${offre === 'Entreprises' ? '' : 'pleine'}`}>
              <label htmlFor="telephone">Téléphone</label>
              <input id="telephone" name="telephone" className="champ" type="tel" autoComplete="tel" placeholder="06 12 34 56 78" required />
            </div>
            {/* seulement pour une entreprise */}
            {offre === 'Entreprises' && (
              <div className="champ-groupe">
                <label htmlFor="entreprise">Nom de l’entreprise</label>
                <input id="entreprise" name="entreprise" className="champ" type="text" autoComplete="organization" placeholder="Nom de l’entreprise" required />
              </div>
            )}
            <fieldset className="champ-groupe">
              <legend>Vous êtes intéressé(e) par</legend>
              <div className="choix">
                {OFFRES.map((o) => (
                  <label key={o.nom}>
                    <input type="radio" name="offre" value={o.nom} checked={offre === o.nom} required
                      onChange={() => { setOffre(o.nom); setFormule('') }} />
                    <span>{o.nom}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="champ-groupe">
              <label htmlFor="formule">
                Formule <span className="optionnel">(facultatif)</span>
              </label>
              <select id="formule" name="formule" className="champ" value={formule} disabled={!offre}
                onChange={(e) => setFormule(e.target.value)}>
                <option value="">{offre ? 'Je ne sais pas encore' : 'Choisissez d’abord une offre'}</option>
                {formulesOffre.map((f) => <option key={f} value={f}>{f.replace(` · ${offre}`, '')}</option>)}
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
                (<Link to="/mentions-legales#confidentialite">politique de confidentialité</Link>).
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
