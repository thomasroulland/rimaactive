import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BoutonLien } from './Blocs.jsx'
import Picto from './Picto.jsx'

// Gabarit commun aux pages Entreprises, Groupes et Individuel, sur un seul écran :
// à gauche le titre « Formules », une phrase, la liste de ce qui est compris et le bouton « M'écrire » ;
// à droite une carte par formule (claire, ou encre pour celle marquée « sombre »).
// page.onglets : plusieurs jeux de cartes (Présentiel, En ligne) ; sinon page.cartes.
// Une carte peut avoir un ou deux tarifs (côte à côte : À domicile / En salle, 4 à 8 / 9 à 12 personnes).
export default function PageService({ page }) {
  const [actif, setActif] = useState(0)
  const onglets = page.onglets ?? [{ cartes: page.cartes }]
  const onglet = onglets[actif]
  const intro = onglet.intro ?? page.intro
  const liste = onglet.liste ?? page.liste ?? []
  const note = onglet.note ?? page.note
  const contexte = onglet.nom ?? page.titre
  return (
    <section className="section ecran-plein formules-page" aria-labelledby="page-titre">
      {/* Une page dont un onglet a trois formules (Individuel) garde la même mise en page sur tous ses onglets */}
      <div className={`conteneur formules-page__grille ${onglets.some((o) => o.cartes.length === 3) ? 'formules-page__grille--large' : ''}`}>
        <div className="formules-page__gauche">
          <nav aria-label="Fil d'Ariane">
            <ol className="fil mention">
              <li><Link to="/">Accueil</Link></li>
              <li aria-current="page">{page.titre}</li>
            </ol>
          </nav>
          <h1 id="page-titre" className="titre formules-page__titre">Formules</h1>
          {intro && <p className="texte">{intro}</p>}
          {page.onglets && (
            <div className="bascule" role="tablist" aria-label="Choisir la formule">
              {onglets.map((o, i) => (
                <button key={o.nom} type="button" role="tab" aria-selected={i === actif} onClick={() => setActif(i)}>
                  {o.nom}
                </button>
              ))}
            </div>
          )}
          {liste.length > 0 && (
            <ul className="formules-page__liste">
              {liste.map((point) => <li key={point}><Picto nom="check-square" taille={20} />{point}</li>)}
            </ul>
          )}
          <div className="formules-page__bas">
            <BoutonLien to="/contact">M’écrire</BoutonLien>
            <p className="formules-page__note">{note}</p>
          </div>
        </div>

        <ul className={`offres offres--${onglet.cartes.length}`}>
          {onglet.cartes.map((f) => (
            <li key={f.nom} className={`offre ${f.sombre ? 'offre--sombre' : ''}`}>
              {/* le pictogramme est sur la ligne du surtitre : le nom de la formule garde toute la largeur */}
              <div className="offre__tete">
                <p className="surtitre">{f.surtitre}</p>
                <Picto nom={f.picto} taille={24} />
              </div>
              <h2 className="titre titre--tuile">{f.nom}</h2>
              {f.infos && <p className="offre__infos">{f.infos}</p>}
              <div className={`offre__tarifs offre__tarifs--${f.tarifs.length}`}>
                {f.tarifs.map((t) => (
                  <div key={t.libelle ?? t.montant} className="offre__tarif">
                    {t.libelle && <p className="offre__libelle">{t.libelle}</p>}
                    <p className="offre__prix">
                      {t.avant && <span className="offre__avant">{t.avant}</span>}
                      {t.montant}
                      {t.apres && <span className="offre__apres">{t.apres}</span>}
                    </p>
                    {t.detail && <p className="offre__detail">{t.detail}</p>}
                  </div>
                ))}
              </div>
              {f.titrePoints && <p className="offre__titre-points">{f.titrePoints}</p>}
              {f.points && (
                <ul className="offre__points">
                  {f.points.map((point) => <li key={point}><Picto nom="check-square" taille={18} />{point}</li>)}
                </ul>
              )}
              <Link
                to={`/contact?formule=${encodeURIComponent(`${f.nom} · ${contexte}`)}`}
                className={`bouton ${f.sombre ? 'bouton--principal' : 'bouton--encre'} offre__bouton`}
                aria-label={`Choisir ${f.nom}`}
              >
                Choisir <FlecheDiagonale />
              </Link>
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
