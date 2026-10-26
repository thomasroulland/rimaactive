import { Link } from 'react-router-dom'
import { BoutonLien, Faits, Photo, Tuile } from './Blocs.jsx'
import Picto from './Picto.jsx'

// Gabarit commun aux pages Entreprises, Groupes et Individuel, en 4 rubriques d'un écran chacune :
// 1. le bandeau de la page et « Ce que vous vivez peut-être », 2. comment se passe une session,
// 3. les formules, 4. les questions fréquentes.
export default function PageService({ page }) {
  return (
    <>
      <section className="section ecran-plein service-page__haut" aria-labelledby="page-titre">
        <div className="conteneur">
          <nav aria-label="Fil d'Ariane">
            <ol className="fil mention">
              <li><Link to="/">Accueil</Link></li>
              <li aria-current="page">{page.titre}</li>
            </ol>
          </nav>
          <p className="surtitre">{page.surtitre}</p>
          <h1 id="page-titre" className="titre titre--section">{page.titre}</h1>

          <h2 className="titre titre--tuile service-page__vecu-titre">Ce que vous vivez peut-être</h2>
          <div className="tuiles">
            {page.vecu.map(([titre, texte]) => (
              <Tuile key={titre} titre={titre} compacte>
                <p className="texte provisoire">{texte}</p>
              </Tuile>
            ))}
          </div>
        </div>
      </section>

      <section className="section ecran-plein" aria-labelledby="session-titre">
        <div className="conteneur deux-colonnes">
          <Photo label={page.photoSession} />
          <div>
            <h2 id="session-titre" className="titre titre--section">Comment se passe une session ?</h2>
            <div style={{ marginTop: 32 }}>
              <Faits items={page.session} />
            </div>
          </div>
        </div>
      </section>

      <RubriqueFormules formules={page.formules} />

      <section className="section ecran-plein" aria-labelledby="faq-titre">
        <div className="conteneur deux-colonnes" style={{ alignItems: 'start' }}>
          <h2 id="faq-titre" className="titre titre--section">Questions fréquentes</h2>
          <div className="faq">
            {page.faq.map(([question, reponse]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{reponse}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

// Rubrique « Formules » sur fond encre : les cartes restent claires, la formule mise en avant en jaune
function RubriqueFormules({ formules }) {
  return (
    <section className="section ecran-plein formules-page sur-encre" aria-labelledby="formules-titre">
      <div className="conteneur">
        <h2 id="formules-titre" className="titre titre--section">Formules</h2>
        <ul className="formules formules--cartes">
          {formules.map((f) => (
            <li key={f.nom} className={`formule ${f.etiquette ? 'formule--avant' : ''}`}>
              {f.etiquette && <span className="formule__etiquette">{f.etiquette}</span>}
              <p className="surtitre">{f.surtitre}</p>
              <h3 className="titre titre--tuile">{f.nom}</h3>
              <ul className="formule__points">
                {f.points.map((point) => <li key={point}><Picto nom="check-square" taille={20} />{point}</li>)}
              </ul>
              <div className="formule__pied">
                <p className="formule__prix">{f.prix}</p>
                <BoutonLien to="/contact" variante="secondaire">M’écrire</BoutonLien>
              </div>
            </li>
          ))}
        </ul>
        <p className="texte formules-page__note">Définies à l’issue d’un premier échange, selon le lieu et la formule.</p>
      </div>
    </section>
  )
}
