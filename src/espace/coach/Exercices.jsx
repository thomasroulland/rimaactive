import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ecouterExercices } from '../depots.js'
import PhotoStockee from './PhotoStockee.jsx'
import useReglages from './useReglages.js'
import GestionListes from './GestionListes.jsx'
import MaterielPicto from './MaterielPicto.jsx'
import Picto from '../../components/Picto.jsx'
import OngletsParties from './OngletsParties.jsx'
import { partieDe } from '../donnees/reglages.js'

const CLE_FILTRES = 'rima-banque-filtres'
const simple = (t) => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const VISIBLES = 8 // éléments montrés dans chaque liste avant « + N autres »

// Banque d'exercices (refonte du 26 novembre 2026, maquette validée par Marie) :
// ordinateur : filtres à gauche avec le nombre d'exercices, « Gérer » à côté de chaque liste, 6 exercices par ligne ;
// téléphone : recherche + bouton « Filtres · N » (fenêtre qui monte du bas), puis une liste avec de petites photos.
// Les filtres actifs sont rappelés en pastilles, un clic pour les retirer, « Tout effacer ».
export default function Exercices() {
  const [exercices, setExercices] = useState(null)
  const [erreur, setErreur] = useState('')
  // filtres gardés pendant la session : on les retrouve en revenant d'un exercice (Marie, 26 novembre 2026)
  const garde = useMemo(() => { try { return JSON.parse(sessionStorage.getItem(CLE_FILTRES)) ?? {} } catch { return {} } }, [])
  const [recherche, setRecherche] = useState(garde.recherche ?? '')
  const [retires, setRetires] = useState(garde.retires ?? false)
  const [partie, setPartie] = useState(garde.partie ?? 'Tout')
  const [categorie, setCategorie] = useState(garde.categorie ?? 'Toutes')
  const [materiel, setMateriel] = useState(garde.materiel ?? 'Tous')
  const [tri, setTri] = useState(garde.tri ?? 'az')
  useEffect(() => {
    try { sessionStorage.setItem(CLE_FILTRES, JSON.stringify({ recherche, retires, partie, categorie, materiel, tri })) } catch { /* rien */ }
  }, [recherche, retires, partie, categorie, materiel, tri])
  const [gerer, setGerer] = useState(null) // null | 'categories' | 'materiels' | 'autres'
  const [panneau, setPanneau] = useState(false)
  const reglages = useReglages()
  const message = useLocation().state?.message ?? ''

  useEffect(() => ecouterExercices(setExercices, () => setErreur('Impossible de charger la banque. Vérifiez votre connexion.')), [])

  const dansPartie = (e, p = partie) => (retires || !e.retire) && (p === 'Tout' || partieDe(e.categorie, reglages) === p)
  const liste = useMemo(() => {
    if (!exercices) return []
    const q = simple(recherche.trim())
    const l = exercices.filter((e) => dansPartie(e) && (categorie === 'Toutes' || e.categorie === categorie) && (materiel === 'Tous' || e.materiel === materiel) && (
      !q || simple(e.nom).includes(q) || simple(e.materiel).includes(q) || simple(e.categorie).includes(q) || (e.muscles ?? []).some((m) => simple(m).includes(q))))
    return tri === 'za' ? [...l].reverse() : l
  }, [exercices, recherche, retires, categorie, materiel, partie, reglages, tri]) // eslint-disable-line react-hooks/exhaustive-deps

  // nombre d'exercices par catégorie et par matériel, dans la partie choisie
  const base = (exercices ?? []).filter((e) => dansPartie(e))
  const compter = (champ) => base.reduce((m, e) => m.set(e[champ], (m.get(e[champ]) ?? 0) + 1), new Map())
  const nbCat = compter('categorie')
  const nbMat = compter('materiel')
  const categoriesVisibles = reglages.categories.filter((c) => partie === 'Tout' || partieDe(c, reglages) === partie)

  const actifs = exercices?.filter((e) => !e.retire).length ?? 0
  const resume = exercices === null ? ' ' : actifs === 0 ? 'Aucun exercice pour l’instant.' : actifs === 1 ? '1 exercice' : `${actifs} exercices`

  const pastilles = [
    partie !== 'Tout' && { nom: partie, retirer: () => { setPartie('Tout'); setCategorie('Toutes') } },
    categorie !== 'Toutes' && { nom: categorie, retirer: () => setCategorie('Toutes') },
    materiel !== 'Tous' && { nom: materiel, retirer: () => setMateriel('Tous') },
    retires && { nom: 'Archivés', retirer: () => setRetires(false) },
  ].filter(Boolean)
  const toutEffacer = () => { setPartie('Tout'); setCategorie('Toutes'); setMateriel('Tous'); setRetires(false); setRecherche('') }
  const nbTrouves = `${liste.length} exercice${liste.length > 1 ? 's' : ''}`

  const filtres = (forme) => (
    <>
      <OngletsParties parties={reglages.parties} valeur={partie} changer={(p) => { setPartie(p); setCategorie('Toutes') }} compte={null} />
      <ListeFiltre forme={forme} titre="Catégorie" tous="Toutes" valeur={categorie} changer={setCategorie} elements={categoriesVisibles} nombres={nbCat} total={base.length} gerer={() => setGerer('categories')} />
      <ListeFiltre forme={forme} titre="Matériel" tous="Tous" valeur={materiel} changer={setMateriel} elements={reglages.materiels} nombres={nbMat} total={base.length} gerer={() => setGerer('materiels')} />
      <label className="espace-case banque__archives">
        <input type="checkbox" checked={retires} onChange={(e) => setRetires(e.target.checked)} />
        Exercices archivés
      </label>
      <button type="button" className="banque__gerer-autres" onClick={() => setGerer('autres')}>Gérer les parties et les muscles</button>
    </>
  )

  return (
    <section className="section">
      <div className="conteneur espace-coach banque">
        <header className="espace-coach__entete">
          <div>
            <p className="surtitre">Espace coach</p>
            <h1 className="titre titre--section">Banque d’exercices</h1>
            <p className="espace-texte">{resume}</p>
          </div>
          <Link to="/espace/coach/exercices/nouveau" className="bouton bouton--principal banque__nouveau">
            <Picto nom="barbell" taille={20} /> Nouvel exercice
          </Link>
        </header>

        <p className="espace-message" role="status">{message}</p>
        <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>

        <div className="banque__corps">
          <aside className="banque__filtres" aria-label="Filtres">{filtres('liste')}</aside>

          <div className="banque__principal">
            <div className="banque__outils">
              <div className="banque__recherche">
                <label htmlFor="exo-recherche" className="sr-only">Rechercher un exercice</label>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
                <input id="exo-recherche" className="champ" type="search" autoComplete="off" placeholder="Nom, muscle, matériel…" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
              </div>
              <label htmlFor="exo-tri" className="sr-only">Trier</label>
              <select id="exo-tri" className="champ banque__tri" value={tri} onChange={(e) => setTri(e.target.value)}>
                <option value="az">Trier : A → Z</option>
                <option value="za">Trier : Z → A</option>
              </select>
              <button type="button" className="banque__bouton-filtres" aria-haspopup="dialog" onClick={() => setPanneau(true)}>
                Filtres{pastilles.length > 0 && ` · ${pastilles.length}`}
              </button>
            </div>

            {exercices && (
              <div className="banque__actifs">
                <span className="banque__nb" aria-live="polite">{nbTrouves}</span>
                {pastilles.map((p) => (
                  <button key={p.nom} type="button" className="banque__pastille" aria-label={`Retirer le filtre ${p.nom}`} onClick={p.retirer}>
                    {p.nom}
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                  </button>
                ))}
                {(pastilles.length > 0 || recherche) && <button type="button" className="banque__effacer" onClick={toutEffacer}>Tout effacer</button>}
              </div>
            )}

            {exercices && liste.length > 0 && (
              <ul className="banque__grille">
                {liste.map((e) => (
                  <li key={e.id}>
                    <Link to={`/espace/coach/exercices/${e.id}`} className="espace-carte espace-exo">
                      <PhotoStockee chemin={e.photos?.[0]} alt="" classe="espace-exo__photo" vide="Pas encore de photo" />
                      <span className="banque__texte">
                        <span className="espace-exo__ligne">
                          <span className="espace-exo__nom">{e.nom}</span>
                          <MaterielPicto materiel={e.materiel} />
                        </span>
                        <span className="espace-exo__muscles">{[e.categorie, e.materiel].filter(Boolean).join(' · ') || (e.muscles ?? []).join(', ') || 'Catégorie à préciser'}</span>
                        {e.retire && <span className="espace-statut">Archivé</span>}
                      </span>
                      <svg className="banque__fleche" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {exercices && liste.length === 0 && (
              <p className="espace-texte">{exercices.length === 0 ? 'Ajoutez votre premier exercice avec « Nouvel exercice ».' : 'Aucun exercice ne correspond à votre recherche.'}</p>
            )}
          </div>
        </div>

        {panneau && (
          <PanneauFiltres fermer={() => setPanneau(false)} effacer={pastilles.length > 0 ? toutEffacer : null} nb={liste.length}>
            {filtres('pastilles')}
          </PanneauFiltres>
        )}
        {gerer && <GestionListes reglages={reglages} exercices={exercices ?? []} fermer={() => setGerer(null)}
          {...(gerer === 'categories' ? { titre: 'Catégories', listes: [{ cle: 'categories', titre: 'Catégories' }] }
            : gerer === 'materiels' ? { titre: 'Matériel', listes: [{ cle: 'materiels', titre: 'Matériel' }] }
              : { titre: 'Parties et muscles', listes: [{ cle: 'parties', titre: 'Parties' }, { cle: 'muscles', titre: 'Muscles' }] })} />}
      </div>
    </section>
  )
}

// Une liste de filtres : en lignes (colonne de gauche, ordinateur) ou en pastilles (fenêtre « Filtres », téléphone).
function ListeFiltre({ forme, titre, tous, valeur, changer, elements, nombres, total, gerer }) {
  const [ouvert, setOuvert] = useState(false)
  const id = `bf-${forme}-${titre}`
  // les premiers éléments, plus celui qui est choisi s'il est plus loin
  const montres = ouvert ? elements : elements.filter((x, i) => i < VISIBLES || x === valeur)
  const caches = elements.length - montres.length
  const item = (nom, nb) => (
    <li key={nom}>
      <button type="button" className="banque__choix" aria-pressed={valeur === nom} onClick={() => changer(forme === 'pastilles' && valeur === nom ? tous : nom)}>
        <span>{nom}</span><span className="banque__compte">{nb}</span>
      </button>
    </li>
  )
  return (
    <section className={`banque__liste banque__liste--${forme}`} aria-labelledby={id}>
      <div className="banque__liste-tete">
        <h2 id={id} className="banque__lib">{titre}</h2>
        {forme === 'liste' && <button type="button" className="banque__gerer" onClick={gerer} aria-label={`Gérer : ${titre}`}>Gérer</button>}
      </div>
      <ul className="banque__choix-liste">
        {forme === 'liste' && item(tous, total)}
        {montres.map((x) => item(x, nombres.get(x) ?? 0))}
        {caches > 0 && <li><button type="button" className="banque__plus" onClick={() => setOuvert(true)}>+ {caches} autre{caches > 1 ? 's' : ''}</button></li>}
      </ul>
    </section>
  )
}

// Fenêtre « Filtres » qui monte du bas (téléphone)
function PanneauFiltres({ fermer, effacer, nb, children }) {
  const ref = useRef(null)
  useEffect(() => { const d = ref.current; if (d && !d.open) d.showModal() }, [])
  return (
    <dialog ref={ref} className="banque__panneau" aria-labelledby="bp-titre" onClose={fermer}
      onClick={(e) => { if (e.target === ref.current) ref.current.close() }}>
      <div className="banque__panneau-tete">
        <h2 id="bp-titre">Filtres</h2>
        {effacer && <button type="button" className="banque__effacer" onClick={effacer}>Tout effacer</button>}
      </div>
      <div className="banque__panneau-corps">{children}</div>
      <button type="button" className="bouton bouton--principal banque__voir" onClick={() => ref.current.close()}>
        {nb === 0 ? 'Aucun exercice' : `Voir ${nb === 1 ? 'l’exercice' : `les ${nb} exercices`}`}
      </button>
    </dialog>
  )
}
