import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Picto from './Picto.jsx'

// Gabarit commun aux pages Individuel, Groupes, Entreprises et En ligne :
// en haut un bandeau avec la photo de la carte de l'accueil et le nom de la page ;
// dessous une carte par formule (blanche, ou encre pour celle marquée « sombre »), puis, centrées,
// la liste cochée et les mentions. Sur ordinateur, bandeau et formules remplissent exactement l'écran.
// page.onglets : boutons Présentiel / En ligne. Les cartes de page.cartes qui ont un « mode » restent toutes affichées ;
// celles de l'autre mode sont grisées (Individuel). Un onglet peut aussi avoir ses propres cartes.
// Une carte peut avoir un ou deux tarifs (côte à côte : À domicile / En salle, 4 à 8 / 9 à 12 personnes).
// Les prix sont gardés dans les pages (tarifs des cartes) mais ne s'affichent pas tant que c'est false
const AFFICHER_TARIFS = true

export default function PageService({ page }) {
  const [actif, setActif] = useState(0)
  // carte ouverte en grand (détail), au clic sur la carte ou sur « Voir le détail »
  const [ouverte, setOuverte] = useState(null)
  const refDetail = useRef(null)
  useEffect(() => { if (ouverte) refDetail.current?.showModal() }, [ouverte])
  const ouvrir = (f) => () => setOuverte(f)
  const onglets = page.onglets ?? [{ cartes: page.cartes }]
  const choisi = onglets[actif]
  // un onglet peut nommer les formules à montrer (noms), ou avoir ses propres cartes
  const onglet = { cartes: choisi.noms ? page.cartes.filter((c) => choisi.noms.includes(c.nom)) : page.cartes, ...choisi }
  const intro = onglet.intro ?? page.intro
  const liste = onglet.liste ?? page.liste ?? []
  const note = onglet.note ?? page.note
  // le formulaire reconnaît « Formule · Page » (ex. « À domicile · Individuel »)
  const contexte = page.titre
  return (
    <>
    <header className="bandeau-page">
      <img src={page.image} alt="" style={{ '--cadrage': page.cadrage }} />
      <div className="conteneur bandeau-page__texte">
        <h1 id="page-titre" className="titre bandeau-page__titre">{page.titre}</h1>
        {/* Individuel : le choix Présentiel / En ligne est posé sur la photo, à droite du titre */}
        {page.onglets && (
          <div className="bascule" role="tablist" aria-label="Choisir la formule">
            {onglets.map((o, i) => (
              <button key={o.nom} type="button" role="tab" aria-selected={i === actif} onClick={() => setActif(i)}>
                {o.nom}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
    <section className="section formules-page" aria-labelledby="page-titre">
      {/* Une page dont un onglet a trois formules (Individuel) garde la même mise en page sur tous ses onglets */}
      <div className={`conteneur formules-page__grille ${onglets.some((o) => (o.noms ?? o.cartes ?? page.cartes).length === 3) ? 'formules-page__grille--large' : ''}`}>
        {/* Individuel : une carte seule (En salle) garde la même structure que les deux cartes À domicile (prix à droite du nom) */}
        <ul className={`offres offres--${page.onglets && onglet.cartes.length === 1 ? '2 offres--seule' : onglet.cartes.length}`}>
          {onglet.cartes.map((f) => (
            <li key={f.nom} onClick={ouvrir(f)} className={`offre offre--cliquable ${f.sombre ? 'offre--sombre' : ''} ${f.mode && f.mode !== onglet.nom ? 'offre--grisee' : ''}`} aria-disabled={f.mode && f.mode !== onglet.nom ? true : undefined}>
              {/* le pictogramme est sur la ligne du surtitre : le nom de la formule garde toute la largeur */}
              <div className="offre__tete">
                <p className="surtitre">{f.surtitre}</p>
                <Picto nom={f.picto} taille={24} />
              </div>
              <h2 className="titre titre--tuile">{f.titre ?? f.nom}</h2>
              {f.infos && <p className="offre__infos">{f.infos}</p>}
              {/* Tarifs masqués pour le moment (Marie, 6 novembre 2026) : remettre AFFICHER_TARIFS à true pour les réafficher */}
              {AFFICHER_TARIFS && <div className={`offre__tarifs offre__tarifs--${f.tarifs.length}`}>
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
              </div>}
              {f.titrePoints && <p className="offre__titre-points">{f.titrePoints}</p>}
              {f.points && (
                <ul className="offre__points">
                  {f.points.map((point) => (
                    <li key={String(point)} className={Array.isArray(point) ? 'offre__point--long' : undefined}>
                      <Picto nom="check-square" taille={18} />
                      {Array.isArray(point) ? <span><b>{point[0]}&nbsp;:</b> {point[1]}</span> : point}
                    </li>
                  ))}
                </ul>
              )}
              {/* le bouton de la carte ouvre le détail ; « Choisir » est dans le détail (Marie, 10 novembre 2026) */}
              <button
                type="button"
                aria-haspopup="dialog"
                tabIndex={f.mode && f.mode !== onglet.nom ? -1 : undefined}
                className={`bouton ${f.sombre ? 'bouton--principal' : 'bouton--encre'} offre__bouton`}
                aria-label={`Voir le détail de ${f.titre ?? f.nom}`}
              >
                Voir le détail
              </button>
            </li>
          ))}
        </ul>
        {/* Sous les cartes, centrée : la liste cochée, puis les mentions */}
        <div className="formules-page__infos">
          {intro && <p className="texte">{intro}</p>}
          {liste.length > 0 && (
            <ul className="formules-page__liste">
              {liste.map((point) => <li key={point}><Picto nom="check-square" taille={20} />{point}</li>)}
            </ul>
          )}
          {note && <p className="formules-page__note">{note}</p>}
        </div>
      </div>
    </section>
    {/* Détail d'une formule, en grand au centre de l'écran (fond blanc) ; fermé par la croix, Échap ou un clic à côté */}
    <dialog ref={refDetail} className="detail" aria-labelledby="detail-titre" onClose={() => setOuverte(null)}
      onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close() }}>
      {ouverte && (
        <div className="detail__corps">
          <form method="dialog"><button className="detail__fermer" aria-label="Fermer">×</button></form>
          <div className="detail__gauche">
            <p className="surtitre">{ouverte.surtitre}</p>
            <h2 id="detail-titre" className="titre detail__titre">{ouverte.titre ?? ouverte.nom}</h2>
            {ouverte.infos && <p className="detail__infos">{ouverte.infos}</p>}
            {ouverte.tarifs.map((t) => (
              <p key={t.montant} className="detail__prix">
                {t.avant && <span className="detail__petit">{t.avant} </span>}{t.montant}
                {t.apres && <span className="detail__petit"> {t.apres}</span>}
                {t.detail && <span className="detail__petit detail__sous"> {t.detail}</span>}
              </p>
            ))}
            <Link to={`/contact?formule=${encodeURIComponent(`${ouverte.nom} · ${ouverte.mode ?? contexte}`)}`} className="bouton bouton--principal detail__bouton">
              {ouverte.bouton ?? 'Choisir cette formule'} <FlecheDiagonale />
            </Link>
          </div>
          <div className="detail__droite">
            {ouverte.titrePoints && <h3 className="detail__h3">{ouverte.titrePoints}</h3>}
            <ul className="detail__points">
              {ouverte.points.map((point) => (
                <li key={String(point)}>
                  <Picto nom="check-square" taille={20} />
                  {Array.isArray(point) ? <span><b>{point[0]}</b><br />{point[1]}</span> : point}
                </li>
              ))}
            </ul>
            {/* rubriques supplémentaires écrites par Marie (detail: [[titre, texte], …]) */}
            {ouverte.detail?.map(([titre, texte]) => (
              <div key={titre} className="detail__rubrique"><h3 className="detail__h3">{titre}</h3><p>{texte}</p></div>
            ))}
            {liste.length > 0 && (
              <ul className="detail__liste">{liste.map((point) => <li key={point}>{point}</li>)}</ul>
            )}
          </div>
        </div>
      )}
    </dialog>
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
