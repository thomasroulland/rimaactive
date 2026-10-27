import { useState } from 'react'
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

      <RubriqueFormules tarifs={page.tarifs} />

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

// Rubrique « Formules » sur fond clair : une carte par formule, qui passe en jaune au survol.
// tarifs.onglets : plusieurs jeux de cartes (À domicile, En salle, En ligne…) ; sinon tarifs.cartes
function RubriqueFormules({ tarifs }) {
  const [actif, setActif] = useState(0)
  const onglets = tarifs.onglets ?? [{ cartes: tarifs.cartes, notes: [] }]
  const onglet = onglets[actif]
  return (
    <section className="section ecran-plein formules-page" aria-labelledby="formules-titre">
      <div className="conteneur">
        <div className="formules-page__entete">
          <h2 id="formules-titre" className="titre titre--section">Formules</h2>
          {tarifs.onglets && (
            <div className="bascule" role="tablist" aria-label="Choisir la formule">
              {onglets.map((o, i) => (
                <button key={o.nom} type="button" role="tab" aria-selected={i === actif} onClick={() => setActif(i)}>
                  {o.nom}
                </button>
              ))}
            </div>
          )}
        </div>
        <Cartes cartes={onglet.cartes} />
        <div className="formules-page__bas">
          <div>
            {[onglet.intro, ...(onglet.notes ?? []), ...(tarifs.notes ?? [])].filter(Boolean).map((note) => (
              <p key={note} className="texte formules-page__note">{note}</p>
            ))}
          </div>
          <BoutonLien to="/contact">M’écrire</BoutonLien>
        </div>
      </div>
    </section>
  )
}

function Prix({ f }) {
  return (
    <p className="formule__prix">
      {f.prix.avant && <span className="formule__prix-petit">{f.prix.avant}</span>}
      {f.prix.montant}
      {f.prix.apres && <span className="formule__prix-petit"> {f.prix.apres}</span>}
    </p>
  )
}

function AutresPrix({ f }) {
  if (!f.autresPrix) return null
  return (
    <ul className="formule__autres-prix">
      {f.autresPrix.map((p) => <li key={p}>{p}</li>)}
    </ul>
  )
}

function Details({ f }) {
  return (
    <dl className="formule__details">
      {f.details.map(([terme, valeur]) => (
        <div key={terme}>
          <dt>{terme}</dt>
          <dd>{valeur}</dd>
        </div>
      ))}
    </dl>
  )
}

function Inclus({ f }) {
  if (!f.inclus) return null
  return (
    <ul className="formule__points" aria-label="Inclus">
      {f.inclus.map((point) => <li key={point}><Picto nom="check-square" taille={20} />{point}</li>)}
    </ul>
  )
}

// Cartes blanches côte à côte, le prix en bas
function Cartes({ cartes }) {
  return (
    <ul className="formules formules--cartes">
      {cartes.map((f) => (
        <li key={f.nom} className="formule">
          <h3 className="titre titre--tuile">{f.nom}</h3>
          {f.pourQui && <p className="formule__pour-qui">{f.pourQui}</p>}
          <Details f={f} />
          <Inclus f={f} />
          <div className="formule__pied">
            <Prix f={f} />
            <AutresPrix f={f} />
          </div>
        </li>
      ))}
    </ul>
  )
}
