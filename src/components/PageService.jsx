import { useState } from 'react'
import { Link } from 'react-router-dom'
import Picto from './Picto.jsx'

// Gabarit commun aux pages Entreprises, Duo et groupes et Individuel :
// en haut un bandeau avec la photo de la carte de l'accueil, les lieux et le nom de la page ;
// dessous, sur toute la largeur, une ligne d'infos (onglets, liste cochée, mentions), puis une carte par formule
// (blanche, ou encre pour celle marquée « sombre »).
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
    <>
    <header className="bandeau-page">
      <img src={page.image} alt="" />
      <div className="conteneur bandeau-page__texte">
        <p className="surtitre">{page.lieux}</p>
        <h1 id="page-titre" className="titre bandeau-page__titre">{page.titre}</h1>
      </div>
    </header>
    <section className="section formules-page" aria-labelledby="page-titre">
      {/* Une page dont un onglet a trois formules (Individuel) garde la même mise en page sur tous ses onglets */}
      <div className={`conteneur formules-page__grille ${onglets.some((o) => o.cartes.length === 3) ? 'formules-page__grille--large' : ''}`}>
        {/* Ligne d'infos sur toute la largeur : onglets, liste cochée, puis les mentions */}
        <div className="formules-page__infos">
          {page.onglets && (
            <div className="bascule" role="tablist" aria-label="Choisir la formule">
              {onglets.map((o, i) => (
                <button key={o.nom} type="button" role="tab" aria-selected={i === actif} onClick={() => setActif(i)}>
                  {o.nom}
                </button>
              ))}
            </div>
          )}
          {intro && <p className="texte">{intro}</p>}
          {liste.length > 0 && (
            <ul className="formules-page__liste">
              {liste.map((point) => <li key={point}><Picto nom="check-square" taille={20} />{point}</li>)}
            </ul>
          )}
          <p className="formules-page__note">{note}</p>
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
    </>
  )
}

function FlecheDiagonale() {
  return (
    <svg aria-hidden="true" viewBox="0 0 256 256" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round">
      <path d="M72 184 184 72M88 72h96v96" />
    </svg>
  )
}
