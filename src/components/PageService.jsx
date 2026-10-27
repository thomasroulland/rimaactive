import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BoutonLien } from './Blocs.jsx'
import Picto from './Picto.jsx'

// Gabarit commun aux pages Entreprises, Groupes et Individuel : un seul écran, avec le fil d'Ariane,
// le titre de la page et, juste en dessous, les formules (une carte par formule, en jaune au survol).
// tarifs.onglets : plusieurs jeux de cartes (À domicile, En salle, En ligne…) ; sinon tarifs.cartes
export default function PageService({ page }) {
  const { tarifs } = page
  const [actif, setActif] = useState(0)
  const onglets = tarifs.onglets ?? [{ cartes: tarifs.cartes, notes: [] }]
  const onglet = onglets[actif]
  return (
    <section className="section ecran-plein formules-page" aria-labelledby="page-titre">
      <div className="conteneur">
        <nav aria-label="Fil d'Ariane">
          <ol className="fil mention">
            <li><Link to="/">Accueil</Link></li>
            <li aria-current="page">{page.titre}</li>
          </ol>
        </nav>
        <p className="surtitre">{page.surtitre}</p>
        <div className="formules-page__entete">
          <h1 id="page-titre" className="titre titre--section">{page.titre}</h1>
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
          {/* les notes se suivent dans un même paragraphe, pour tenir sur deux lignes */}
          <p className="texte formules-page__note">
            {[onglet.intro, ...(onglet.notes ?? []), ...(tarifs.notes ?? [])].filter(Boolean).join(' ')}
          </p>
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
