import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ecouterExercices } from '../depots.js'
import PhotoStockee from './PhotoStockee.jsx'
import useReglages from './useReglages.js'
import GestionListes from './GestionListes.jsx'
import Picto from '../../components/Picto.jsx'

const simple = (t) => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Banque d'exercices : recherche par nom ou par muscle, une carte par exercice
export default function Exercices() {
  const [exercices, setExercices] = useState(null)
  const [erreur, setErreur] = useState('')
  const [recherche, setRecherche] = useState('')
  const [retires, setRetires] = useState(false)
  const [categorie, setCategorie] = useState('Toutes')
  const [materiel, setMateriel] = useState('Tous')
  const [gerer, setGerer] = useState(false)
  const reglages = useReglages()
  const message = useLocation().state?.message ?? ''

  useEffect(() => ecouterExercices(setExercices, () => setErreur('Impossible de charger la banque. Vérifiez votre connexion.')), [])

  const liste = useMemo(() => {
    if (!exercices) return []
    const q = simple(recherche.trim())
    return exercices.filter((e) => (retires || !e.retire) && (categorie === 'Toutes' || e.categorie === categorie) && (materiel === 'Tous' || e.materiel === materiel) && (
      !q || simple(e.nom).includes(q) || simple(e.materiel).includes(q) || simple(e.categorie).includes(q) || (e.muscles ?? []).some((m) => simple(m).includes(q))))
  }, [exercices, recherche, retires, categorie, materiel])

  const actifs = exercices?.filter((e) => !e.retire).length ?? 0
  const resume = exercices === null ? ' ' : actifs === 0 ? 'Aucun exercice pour l’instant.' : actifs === 1 ? '1 exercice dans la banque.' : `${actifs} exercices dans la banque.`

  return (
    <section className="section">
      <div className="conteneur espace-coach">
        <header className="espace-coach__entete">
          <div>
            <p className="surtitre">Espace coach</p>
            <h1 className="titre titre--section">Banque d’exercices</h1>
            <p className="espace-texte">{resume}</p>
          </div>
          <Link to="/espace/coach/exercices/nouveau" className="bouton bouton--principal">
            <Picto nom="barbell" taille={20} /> Nouvel exercice
          </Link>
        </header>

        <p className="espace-message" role="status">{message}</p>
        <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>

        <div className="espace-carte espace-recherche">
          <div className="champ-groupe">
            <label htmlFor="exo-recherche">Rechercher</label>
            <input id="exo-recherche" className="champ" type="search" autoComplete="off" placeholder="Nom, muscle, matériel…" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
          </div>
          <div className="banque-filtres">
            <span className="banque-filtres__lib" id="f-cat">Catégorie</span>
            <div className="filtres-coaches" role="group" aria-labelledby="f-cat">
              {['Toutes', ...reglages.categories].map((c) => (
                <button key={c} type="button" className="filtre-coaches" aria-pressed={categorie === c} onClick={() => setCategorie(c)}>{c}</button>
              ))}
            </div>
            <span className="banque-filtres__lib" id="f-mat">Matériel</span>
            <div className="filtres-coaches" role="group" aria-labelledby="f-mat">
              {['Tous', ...reglages.materiels].map((m) => (
                <button key={m} type="button" className="filtre-coaches" aria-pressed={materiel === m} onClick={() => setMateriel(m)}>{m}</button>
              ))}
            </div>
          </div>
          <div className="banque-filtres__bas">
            <label className="espace-case">
              <input type="checkbox" checked={retires} onChange={(e) => setRetires(e.target.checked)} />
              Afficher les exercices archivés
            </label>
            <button type="button" className="lien-souligne" onClick={() => setGerer(true)}>Gérer les catégories et le matériel</button>
          </div>
        </div>
        {gerer && <GestionListes titre="Catégories et matériel" reglages={reglages} fermer={() => setGerer(false)}
          listes={[{ cle: 'categories', titre: 'Catégories' }, { cle: 'materiels', titre: 'Matériel' }]} />}

        {exercices && liste.length > 0 && (
          <ul className="espace-grille espace-grille--exos">
            {liste.map((e) => (
              <li key={e.id}>
                <Link to={`/espace/coach/exercices/${e.id}`} className="espace-carte espace-exo">
                  <PhotoStockee chemin={e.photos?.[0]} alt="" classe="espace-exo__photo" vide="Pas encore de photo" />
                  <span className="espace-exo__nom">{e.nom}</span>
                  <span className="espace-exo__muscles">{[e.categorie, e.materiel].filter(Boolean).join(' · ') || (e.muscles ?? []).join(', ') || 'Catégorie à préciser'}</span>
                  {e.retire && <span className="espace-statut">Archivé</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {exercices && liste.length === 0 && (
          <p className="espace-texte">{exercices.length === 0 ? 'Ajoutez votre premier exercice avec « Nouvel exercice ».' : 'Aucun exercice ne correspond à votre recherche.'}</p>
        )}
      </div>
    </section>
  )
}
