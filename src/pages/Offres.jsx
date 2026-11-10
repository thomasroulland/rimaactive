import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CarteOffre, DetailOffre } from '../components/PageService.jsx'
import Picto from '../components/Picto.jsx'
import useTitre from '../components/useTitre.js'
import { PAGE as INDIVIDUEL } from './Particuliers.jsx'
import { PAGE as GROUPES } from './Groupes.jsx'
import { PAGE as ENTREPRISES } from './Entreprises.jsx'
import { PAGE as EN_LIGNE } from './EnLigne.jsx'

// Page unique « Mes offres » (Marie, 10 novembre 2026) : une rubrique par offre, l'une sous l'autre.
// Les bulles du haut restent visibles et amènent à chaque rubrique. Individuel garde les boutons
// À domicile / En salle (deux cartes visibles à la fois) ; les autres offres ont leur photo à côté de leur carte.
// Un clic sur une carte (ou « Voir le détail ») l'ouvre en grand. Les formules et prix viennent des fichiers des pages.
const RUBRIQUES = [
  { id: 'individuel', page: INDIVIDUEL, sous: 'À domicile ou en salle' },
  { id: 'groupes', page: GROUPES, sous: '2 à 8 personnes, à domicile ou en extérieur' },
  { id: 'entreprises', page: ENTREPRISES, sous: 'Jusqu’à 16 personnes, dans vos locaux ou en extérieur' },
  { id: 'en-ligne', page: EN_LIGNE, sous: 'Un suivi à distance' },
]

export default function Offres() {
  useTitre('Mes offres et tarifs')
  const { hash } = useLocation()
  // un lien vers une rubrique (/offres#groupes) y amène directement
  useEffect(() => {
    if (!hash) return
    const aller = () => document.getElementById(hash.slice(1))?.scrollIntoView()
    aller()
    // les photos changent la hauteur de la page en se chargeant : on se recale une fois qu'elles sont là
    const t = setTimeout(aller, 400)
    return () => clearTimeout(t)
  }, [hash])
  return (
    <>
      {/* en haut, toujours visibles : le titre et les bulles des rubriques, sur une seule ligne */}
      <nav className="offres-page__bulles" aria-labelledby="offres-titre">
        <div className="conteneur">
          <h1 id="offres-titre" className="titre offres-page__titre">Mes offres et tarifs</h1>
          <div className="offres-page__liens">
            {RUBRIQUES.map((r) => <a key={r.id} href={`#${r.id}`}>{r.page.titre}</a>)}
          </div>
        </div>
      </nav>
      {RUBRIQUES.map((r, i) => <Rubrique key={r.id} {...r} fonce={i % 2 === 1} />)}
      <p className="offres-page__note conteneur">TVA non applicable, art.&nbsp;293&nbsp;B du CGI.</p>
    </>
  )
}

function Rubrique({ id, page, sous, fonce }) {
  const [actif, setActif] = useState(0)
  const [ouverte, setOuverte] = useState(null)
  const refDetail = useRef(null)
  const onglets = page.onglets
  const cartes = onglets ? page.cartes.filter((c) => onglets[actif].noms.includes(c.nom)) : page.cartes
  const liste = page.liste ?? []
  return (
    <section id={id} className={`offres-page__rubrique ${fonce ? 'offres-page__rubrique--fonce' : ''}`} aria-labelledby={`${id}-titre`}>
      <div className="conteneur">
        <div className="offres-page__entete">
          <div>
            <h2 id={`${id}-titre`} className="titre titre--section">{page.titre}</h2>
            <p className="offres-page__sous">{sous}</p>
          </div>
          {onglets && (
            <div className="bascule" role="tablist" aria-label={`Choisir : ${onglets.map((o) => o.nom).join(' ou ')}`}>
              {onglets.map((o, i) => (
                <button key={o.nom} type="button" role="tab" aria-selected={i === actif} onClick={() => setActif(i)}>{o.nom}</button>
              ))}
            </div>
          )}
        </div>
        <div className={`offres-page__corps ${onglets ? '' : 'offres-page__corps--photo'}`}>
          {!onglets && <img className="offres-page__photo" src={page.image} alt="" style={{ objectPosition: page.cadrage }} />}
          <ul className={`offres offres--${cartes.length === 1 ? '1' : '2'}`}>
            {cartes.map((f) => <CarteOffre key={f.nom} f={f} onOuvrir={() => setOuverte(f)} />)}
          </ul>
        </div>
        {liste.length > 0 && (
          <ul className="offres-page__liste">
            {liste.map((point) => <li key={point}><Picto nom="check-square" taille={18} />{point}</li>)}
          </ul>
        )}
      </div>
      <DetailOffre refDetail={refDetail} ouverte={ouverte} onClose={() => setOuverte(null)} contexte={page.titre} liste={liste} />
    </section>
  )
}
