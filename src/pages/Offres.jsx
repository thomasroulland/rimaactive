import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CarteOffre } from '../components/PageService.jsx'
import Picto from '../components/Picto.jsx'
import useTitre from '../components/useTitre.js'
import { PAGE as INDIVIDUEL } from './Particuliers.jsx'
import { PAGE as GROUPES } from './Groupes.jsx'
import { PAGE as ENTREPRISES } from './Entreprises.jsx'
import { PAGE as EN_LIGNE } from './EnLigne.jsx'

// Page unique « Mes offres » (Marie, 10 novembre 2026) : une rubrique par offre, l'une sous l'autre.
// Les bulles du haut restent visibles et amènent à chaque rubrique. Individuel garde les boutons
// deux cartes visibles à la fois (« À domicile » / « À la salle », remis le 14 novembre 2026) ; les autres offres ont leur photo à côté de leur carte.
// Le bouton d'une carte, « Choisir cette formule », mène au formulaire de contact (plus de fenêtre de détail depuis le 16 novembre 2026).
// Les formules et prix viennent des fichiers des pages.
// Ordre de Marie (16 novembre 2026) : Individuel, En ligne, Groupes, Entreprises ; seulement le nom de l'offre en titre (plus de sous-titre)
const RUBRIQUES = [
  { id: 'individuel', page: INDIVIDUEL },
  // photo à droite pour En ligne et Entreprises, à gauche pour Groupes (Thomas, 17 novembre 2026)
  { id: 'en-ligne', page: EN_LIGNE, inverse: true },
  { id: 'groupes', page: GROUPES },
  { id: 'entreprises', page: ENTREPRISES, inverse: true },
]

// Sous les cartes : pictogramme, intitulé en gras et une phrase (Thomas, 17 novembre 2026), à la place des cases cochées.
// Les textes de la liste restent dans les fichiers des pages ; on les reconnaît ici.
const AVANTAGES = {
  materiel: { picto: 'haltere', titre: 'Matériel inclus', texte: 'Je m’occupe de tout.' },
  deplacement: { picto: 'map-pin', titre: 'Déplacement inclus', texte: 'Dans un rayon de 20\u00a0km autour de Houdan.' },
}
function avantage(point) {
  if (point.startsWith('Matériel')) return AVANTAGES.materiel
  if (point.startsWith('Déplacement')) return AVANTAGES.deplacement
  return { picto: 'check-square', titre: point }
}

export default function Offres() {
  useTitre('Mes offres')
  const { hash } = useLocation()
  // rubrique affichée (soulignée dans les onglets) : celle qui est sous la barre des onglets
  const [courante, setCourante] = useState(RUBRIQUES[0].id)
  // rubrique choisie d'un clic : soulignée tout de suite, et gardée pendant le défilement qui y mène
  // (sinon la dernière rubrique, trop courte pour monter sous la barre, n'était jamais soulignée)
  const choisie = useRef(null)
  useEffect(() => {
    let fin = null
    const suivre = () => {
      if (choisie.current) {
        clearTimeout(fin)
        fin = setTimeout(() => { choisie.current = null }, 300)
        return
      }
      const barre = document.querySelector('.offres-page__bulles')?.getBoundingClientRect().bottom ?? 0
      let id = RUBRIQUES[0].id
      for (const r of RUBRIQUES) { const e = document.getElementById(r.id); if (e && e.getBoundingClientRect().top <= barre + 80) id = r.id }
      // tout en bas de la page : la dernière rubrique visible
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        for (const r of RUBRIQUES) { const e = document.getElementById(r.id); if (e && e.getBoundingClientRect().top < window.innerHeight * 0.6) id = r.id }
      }
      setCourante(id)
    }
    suivre()
    window.addEventListener('scroll', suivre, { passive: true })
    return () => { window.removeEventListener('scroll', suivre); clearTimeout(fin) }
  }, [])
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
          <h1 id="offres-titre" className="titre offres-page__titre">Mes offres</h1>
          <div className="offres-page__liens">
            {RUBRIQUES.map((r) => <a key={r.id} href={`#${r.id}`} aria-current={r.id === courante ? 'location' : undefined} onClick={() => { choisie.current = r.id; setCourante(r.id) }}>{r.page.titre}</a>)}
          </div>
        </div>
      </nav>
      {RUBRIQUES.map((r, i) => <Rubrique key={r.id} {...r} fonce={i % 2 === 1} />)}
      {/* Fin de page : seulement la mention sur les tarifs (choix de Marie, 11 novembre 2026 : la photo faisait doublon) */}
      <section className="fin-mention" aria-label="Mention sur les tarifs">
        <div className="conteneur">
          <p>TVA non applicable, art.&nbsp;293&nbsp;B du CGI.</p>
        </div>
      </section>
    </>
  )
}

function Rubrique({ id, page, sous, fonce, inverse }) {
  const [actif, setActif] = useState(0)
  const onglets = page.onglets
  const cartes = onglets ? page.cartes.filter((c) => onglets[actif].noms.includes(c.nom)) : page.cartes
  const liste = onglets?.[actif].liste ?? page.liste ?? []
  return (
    <section id={id} className={`offres-page__rubrique ${fonce ? 'offres-page__rubrique--fonce' : ''}`} aria-labelledby={`${id}-titre`}>
      <div className="conteneur">
        <div className="offres-page__entete">
          <div>
            <h2 id={`${id}-titre`} className="titre titre--section">{page.titre}</h2>
            {sous && <p className="offres-page__sous">{sous}</p>}
          </div>
          {onglets && (
            <div className="bascule" role="group" aria-label={`Choisir : ${onglets.map((o) => o.nom).join(' ou ')}`}>
              {onglets.map((o, i) => (
                <button key={o.nom} type="button" aria-pressed={i === actif} onClick={() => setActif(i)}>{o.nom}</button>
              ))}
            </div>
          )}
        </div>
        {/* la photo seulement à côté d'une carte seule ; Individuel (deux cartes) les garde en pleine largeur */}
        <div className={`offres-page__corps ${cartes.length > 1 ? '' : 'offres-page__corps--photo'} ${inverse ? 'offres-page__corps--inverse' : ''}`}>
          {cartes.length === 1 && <img className="offres-page__photo" src={page.image} alt="" style={{ objectPosition: page.cadrage }} />}
          <ul className={`offres offres--${cartes.length === 1 ? '1' : '2'}`}>
            {cartes.map((f) => <CarteOffre key={f.nom} f={f} contexte={page.titre} direct />)}
          </ul>
          {/* sous la carte elle-même (pas sous la photo), centré ; sous les deux cartes d'Individuel, centré sur toute la largeur */}
          {liste.length > 0 && (
            <ul className="offres-page__avantages">
              {liste.map((point) => {
                const a = avantage(point)
                return <li key={point}><Picto nom={a.picto} taille={24} /><span><strong>{a.titre}</strong>{a.texte && <span>{a.texte}</span>}</span></li>
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
