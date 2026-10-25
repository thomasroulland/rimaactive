import { useState } from 'react'
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

      <RubriqueFormules formules={page.formules} modele={modele} />

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

// Ce qui vaut pour toutes les formules, repris du bandeau de l'accueil
const INCLUS = [
  ['map-pin', 'Jusqu’à 20\u00a0km autour de Houdan (78)'],
  ['timer', 'Sessions de 30 à 60\u00a0min'],
  ['kettlebell', 'Matériel mis à disposition'],
]

const ETAPES = [
  ['Un premier échange', '[Texte à rédiger]'],
  ['Une proposition adaptée', '[Texte à rédiger]'],
  ['La première session', '[Texte à rédiger]'],
]

const NOTE = 'Définies à l’issue d’un premier échange, selon le lieu et la formule.'

// Rubrique « Formules ». Essai de mises en page avec ?formules= :
// 1 cartes seules, 2 avec un choix « À la séance / Carnet », 3 avec les étapes pour démarrer,
// 4 avec ce qui est inclus partout, 5 sur fond encre
function RubriqueFormules({ formules, modele }) {
  const [carnet, setCarnet] = useState(false)
  const titre = <h2 id="formules-titre" className="titre titre--section">Formules</h2>
  const cartes = <CartesTarifs formules={formules} carnet={carnet} />
  const note = <p className="texte formules-page__note">{NOTE}</p>

  if (modele === 3) {
    return (
      <section className="section ecran-plein formules-page" aria-labelledby="formules-titre">
        <div className="conteneur formules-page__etapes">
          <div>
            {titre}
            <ol className="etapes">
              {ETAPES.map(([nom, texte], i) => (
                <li key={nom}>
                  <span className="etapes__numero">{i + 1}</span>
                  <div>
                    <h3>{nom}</h3>
                    <p className="texte provisoire">{texte}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          {cartes}
        </div>
      </section>
    )
  }

  return (
    <section className={`section ecran-plein formules-page ${modele === 5 ? 'sur-encre formules-page--encre' : ''}`} aria-labelledby="formules-titre">
      <div className="conteneur">
        {modele === 2 ? (
          <div className="formules-page__entete">
            {titre}
            <div className="bascule" role="group" aria-label="Affichage des prix">
              <button type="button" aria-pressed={!carnet} onClick={() => setCarnet(false)}>À la séance</button>
              <button type="button" aria-pressed={carnet} onClick={() => setCarnet(true)}>Carnet de séances</button>
            </div>
          </div>
        ) : titre}
        {cartes}
        {modele === 4 ? (
          <div className="inclus">
            <p className="surtitre">Dans chaque formule</p>
            <ul>
              {INCLUS.map(([picto, texte]) => <li key={texte}><Picto nom={picto} taille={24} />{texte}</li>)}
            </ul>
          </div>
        ) : note}
      </div>
    </section>
  )
}

// Cartes tarifaires côte à côte ; la formule mise en avant passe en jaune
function CartesTarifs({ formules, carnet }) {
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
            <p className="formule__prix">{carnet ? '[Prix du carnet]' : f.prix}</p>
            <BoutonLien to="/contact" variante="secondaire">M’écrire</BoutonLien>
          </div>
        </li>
      ))}
    </ul>
  )
}
