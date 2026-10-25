import { Link } from 'react-router-dom'
import { BoutonLien, Faits, Photo, Tuile } from './Blocs.jsx'
import Picto from './Picto.jsx'

// Gabarit commun aux pages Entreprises, Groupes et Individuel, en 4 rubriques d'un écran chacune :
// 1. le bandeau de la page et « Ce que vous vivez peut-être », 2. comment se passe une session,
// 3. les formules, 4. les questions fréquentes.
export default function PageService({ page }) {
  // Essai : ?formules=1, 2 ou 3 pour comparer les mises en page des formules
  const modele = Number(new URLSearchParams(window.location.search).get('formules')) || 1
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

      <section className="section ecran-plein formules-page" aria-labelledby="formules-titre">
        <div className="conteneur">
          <h2 id="formules-titre" className="titre titre--section">Formules</h2>
          <Formules formules={page.formules} modele={modele} />
          <p className="texte formules-page__note">Définies à l’issue d’un premier échange, selon le lieu et la formule.</p>
        </div>
      </section>

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

function Formules({ formules, modele }) {
  // 2 : cartes photo, avec une étiquette sur la photo
  if (modele === 2) {
    return (
      <ul className="formules formules--photo">
        {formules.map((f) => (
          <li key={f.nom} className="formule">
            <Photo label={`Photo : ${f.nom}`} sansEtiquette className="formule__photo" />
            {f.etiquette && <span className="formule__etiquette">{f.etiquette}</span>}
            <h3 className="titre titre--tuile">{f.nom}</h3>
            <p className="formule__prix">{f.prix}</p>
            <p className="texte">{f.texte}</p>
            <Link to="/contact" className="lien-fleche">En savoir plus</Link>
          </li>
        ))}
      </ul>
    )
  }
  // 3 : liste façon carnet, une ligne par formule
  if (modele === 3) {
    return (
      <ol className="formules formules--liste">
        {formules.map((f, i) => (
          <li key={f.nom} className="formule">
            <span className="formule__numero">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3 className="titre titre--tuile">{f.nom}</h3>
              <p className="texte">{f.texte}</p>
            </div>
            <ul className="formule__points">
              {f.points.map((point) => <li key={point}><Picto nom="check-square" taille={20} />{point}</li>)}
            </ul>
            <p className="formule__prix">{f.prix}</p>
            <BoutonLien to="/contact" variante="secondaire">M’écrire</BoutonLien>
          </li>
        ))}
      </ol>
    )
  }
  // 1 : cartes tarifaires côte à côte, la formule mise en avant passe en jaune
  return (
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
  )
}
