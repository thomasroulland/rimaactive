import { useState } from 'react'
import { HerosPage } from '../components/Blocs.jsx'
import { CONTACT } from '../components/liens.js'
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
    <>
      <HerosPage fil="Contact" ligne="On en parle ?" titre="écris-moi">
        <p className="texte texte--grand provisoire">
          [Phrase d'introduction à rédiger · message principal : dites-moi où vous en êtes, je vous réponds.]
        </p>
      </HerosPage>

      <section className="section section--serree">
        <div className="conteneur contact-grille">
          <aside className="coordonnees sur-encre" aria-label="Coordonnées">
            <p className="ligne-fine" style={{ margin: 0 }}>en direct</p>
            <div>
              <p className="mention">e-mail</p>
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </div>
            <div>
              <p className="mention">téléphone</p>
              <a href={CONTACT.telephoneLien}>{CONTACT.telephone}</a>
            </div>
            <div>
              <p className="mention">zone</p>
              <p className="texte">Houdan et les communes voisines, dans un rayon de 20 km.</p>
            </div>
          </aside>

          {envoye ? (
            <div role="status" className="confirmation">
              <p className="ligne-fine" style={{ margin: 0 }}>merci</p>
              <p className="titre titre--section">message envoyé</p>
              <p className="texte provisoire">[Message de confirmation à rédiger]</p>
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
              <fieldset className="champ-groupe pleine">
                <legend>Vous êtes</legend>
                <div className="choix">
                  {['entreprise', 'commune', 'particulier'].map((profil) => (
                    <label key={profil}>
                      <input type="radio" name="profil" value={profil} />
                      <span>{profil}</span>
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
              <div className="champ-groupe pleine">
                <label htmlFor="besoin">Ce que vous cherchez</label>
                <textarea id="besoin" name="besoin" className="champ" rows="4" />
              </div>
              <div className="champ-groupe pleine">
                <label htmlFor="dispos">Disponibilités</label>
                <input id="dispos" name="dispos" className="champ" type="text" placeholder="ex. le mardi midi, le samedi matin" />
              </div>
              <div className="pleine">
                <button type="submit" className="bouton bouton--principal">Envoyer</button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
