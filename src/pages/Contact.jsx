import { useState } from 'react'
import useTitre from '../components/useTitre.js'

export default function Contact() {
  useTitre('Contact')
  const [envoye, setEnvoye] = useState(false)

  // Envoi à brancher (Formspree, Resend, fonction Vercel…) : pour l'instant on affiche la confirmation
  function envoyer(event) {
    event.preventDefault()
    setEnvoye(true)
  }

  return (
    <section className="section section--lin">
      <div className="conteneur conteneur--formulaire pile pile--etire" style={{ gap: 32 }}>
        <div className="pile" style={{ gap: 16 }}>
          <h1 className="titre-page">contact</h1>
          <p className="texte">
            [Phrase d'introduction à rédiger · message principal : dites-moi où vous en êtes, je vous réponds.]
          </p>
        </div>

        {envoye ? (
          <div role="status" className="confirmation">
            <p className="surtitre" style={{ fontSize: 15 }}>après envoi</p>
            <p className="texte">[Message de confirmation à rédiger]</p>
          </div>
        ) : (
          <form className="formulaire" onSubmit={envoyer}>
            <div className="champ-groupe">
              <label htmlFor="nom">Prénom et nom</label>
              <input id="nom" name="nom" className="champ" type="text" autoComplete="name" required />
            </div>
            <div className="champ-groupe">
              <label htmlFor="joindre">E-mail ou téléphone</label>
              <input id="joindre" name="joindre" className="champ" type="text" autoComplete="email" required />
            </div>
            <fieldset className="champ-groupe">
              <legend>Vous êtes</legend>
              <div className="choix">
                {['entreprise', 'commune', 'particulier'].map((profil) => (
                  <label key={profil}>
                    <input type="radio" name="profil" value={profil} /> {profil}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="champ-groupe">
              <label htmlFor="structure">
                Structure <span className="optionnel">(le cas échéant)</span>
              </label>
              <input id="structure" name="structure" className="champ" type="text" autoComplete="organization" />
            </div>
            <div className="champ-groupe">
              <label htmlFor="commune">Commune</label>
              <input id="commune" name="commune" className="champ" type="text" autoComplete="address-level2" />
            </div>
            <div className="champ-groupe">
              <label htmlFor="besoin">Ce que vous cherchez</label>
              <textarea id="besoin" name="besoin" className="champ" rows="4" />
            </div>
            <div className="champ-groupe">
              <label htmlFor="dispos">Disponibilités</label>
              <input id="dispos" name="dispos" className="champ" type="text" />
            </div>
            <button type="submit" className="bouton" style={{ alignSelf: 'flex-start' }}>Envoyer</button>
          </form>
        )}
      </div>
    </section>
  )
}
