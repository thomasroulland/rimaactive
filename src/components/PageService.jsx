import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BoutonLien } from './Blocs.jsx'
import Picto from './Picto.jsx'

// Gabarit commun aux pages Entreprises, Groupes et Individuel, sur un seul écran :
// à gauche le titre « Formules », une phrase, la liste de ce qui est compris et le bouton « M'écrire » ;
// à droite une carte par formule (claire, ou encre pour celle marquée « sombre »).
// page.onglets : plusieurs jeux de cartes (À domicile, En salle, En ligne) ; sinon page.cartes
export default function PageService({ page }) {
  const [actif, setActif] = useState(0)
  const onglets = page.onglets ?? [{ cartes: page.cartes }]
  const onglet = onglets[actif]
  const liste = onglet.liste ?? page.liste
  const note = onglet.note ?? page.note
  const contexte = onglet.nom ?? page.titre
  return (
    <section className="section ecran-plein formules-page" aria-labelledby="page-titre">
      <div className="conteneur formules-page__grille">
        <div className="formules-page__gauche">
          <nav aria-label="Fil d'Ariane">
            <ol className="fil mention">
              <li><Link to="/">Accueil</Link></li>
              <li aria-current="page">{page.titre}</li>
            </ol>
          </nav>
          <p className="surtitre">{page.surtitre}</p>
          <h1 id="page-titre" className="titre formules-page__titre">Formules</h1>
          <p className="texte">{page.intro}</p>
          {page.onglets && (
            <div className="bascule" role="tablist" aria-label="Choisir la formule">
              {onglets.map((o, i) => (
                <button key={o.nom} type="button" role="tab" aria-selected={i === actif} onClick={() => setActif(i)}>
                  {o.nom}
                </button>
              ))}
            </div>
          )}
          <ul className="formules-page__liste">
            {liste.map((point) => <li key={point}><Picto nom="check-square" taille={20} />{point}</li>)}
          </ul>
          <div className="formules-page__bas">
            <BoutonLien to="/contact">M’écrire</BoutonLien>
            <p className="formules-page__note">{note}</p>
          </div>
        </div>

        <ul className={`offres offres--${onglet.cartes.length}`}>
          {onglet.cartes.map((f, i) => (
            <li key={f.nom} className={`offre ${f.sombre ? 'offre--sombre' : ''}`}>
              <p className="surtitre">{String(i + 1).padStart(2, '0')} — {f.surtitre}</p>
              <div className="offre__tete">
                <h2 className="titre titre--tuile">{f.nom}</h2>
                {f.pastille ? <span className="offre__pastille">{f.pastille}</span> : <Picto nom="kettlebell" taille={24} />}
              </div>
              <p className="offre__prix">
                {f.prix.avant && <span className="offre__avant">{f.prix.avant}</span>}
                {f.prix.montant}
              </p>
              <p className="offre__unite">{f.prix.unite}</p>
              <p className="offre__texte">{f.texte}</p>
              <Link
                to={`/contact?formule=${encodeURIComponent(`${f.nom} · ${contexte}`)}`}
                className={`bouton ${f.sombre ? 'bouton--principal' : 'bouton--encre'} offre__bouton`}
                aria-label={`Choisir ${f.nom}`}
              >
                Choisir <FlecheDiagonale />
              </Link>
              {f.petit && <p className="offre__petit">{f.petit}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function FlecheDiagonale() {
  return (
    <svg aria-hidden="true" viewBox="0 0 256 256" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round">
      <path d="M72 184 184 72M88 72h96v96" />
    </svg>
  )
}
