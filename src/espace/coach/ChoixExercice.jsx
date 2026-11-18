import { useEffect, useState } from 'react'
import useReglages from './useReglages.js'
import ChoixAvecAjout from './ChoixAvecAjout.jsx'
import MaterielPicto from './MaterielPicto.jsx'
import { enregistrerExercice } from '../depots.js'
import { messageErreur } from '../erreurs.js'
import PhotoStockee from './PhotoStockee.jsx'
import { basculerDetails } from '../../components/basculerDetails.js'
import { partieDe } from '../donnees/reglages.js'

const simplifier = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const VIDE = { nom: '', categorie: '', materiel: '', consignes: '' }

// Banque à côté de la séance : recherche et catégories, on glisse un exercice dans un bloc (18 novembre 2026 : plus de choix
// du bloc ni de bouton « Ajouter »), et création d'un nouvel exercice sans quitter la séance (il va dans le dernier bloc).
// Glisser un exercice depuis la banque vers un bloc (EditeurSeance lit ce type de donnée au dépôt)
export const TYPE_GLISSE = 'application/x-rimaactive-exercice'

export default function ChoixExercice({ exercices, ajouter, laterale = false }) {
  const [recherche, setRecherche] = useState('')
  const [partie, setPartie] = useState('Tout')
  const [categorie, setCategorie] = useState('Toutes')
  const [materiel, setMateriel] = useState('Tous')
  const [nouvel, setNouvel] = useState(VIDE)
  const [creationOuverte, setCreationOuverte] = useState(false)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const reglages = useReglages()

  const t = simplifier(recherche.trim())
  const resultats = (exercices ?? [])
    .filter((e) => e.retire !== true)
    .filter((e) => partie === 'Tout' || partieDe(e.categorie, reglages) === partie)
    .filter((e) => categorie === 'Toutes' || e.categorie === categorie)
    .filter((e) => materiel === 'Tous' || e.materiel === materiel)
    .filter((e) => !t || simplifier(`${e.nom} ${e.categorie ?? ''} ${e.materiel ?? ''} ${(e.muscles ?? []).join(' ')}`).includes(t))
  const aucun = Boolean(exercices) && resultats.length === 0
  useEffect(() => { if (aucun) setCreationOuverte(true) }, [aucun])

  async function creer() {
    const nom = nouvel.nom.trim()
    if (!nom) { setErreur('Donnez un nom à l’exercice.'); return }
    setEnvoi(true); setErreur('')
    try {
      const exo = { ...nouvel, nom, categorie: nouvel.categorie || reglages.categories[0] || '', materiel: nouvel.materiel || reglages.materiels[reglages.materiels.length - 1] || '', consignes: nouvel.consignes.trim(), muscles: [], photos: [] }
      const id = await enregistrerExercice(exo)
      ajouter({ ...exo, id })
      setNouvel(VIDE); setCreationOuverte(false); setRecherche('')
    } catch (err) {
      setErreur(messageErreur(err.code))
    } finally { setEnvoi(false) }
  }

  const champ = (cle) => ({ value: nouvel[cle], onChange: (e) => { setNouvel({ ...nouvel, [cle]: e.target.value }); setErreur('') } })

  return (
    <section className={`espace-carte espace-choix${laterale ? ' espace-choix--lateral' : ''}`} aria-labelledby="choix-titre">
      <div className="espace-choix__tete">
        <h2 id="choix-titre" className="espace-sous-titre"><span className="choix-titre--souris">Glisser un exercice</span><span className="choix-titre--doigt">Ajouter un exercice</span></h2>
      </div>
      <div className="champ-groupe">
        <label htmlFor="choix-recherche">Rechercher dans ma banque</label>
        <input id="choix-recherche" className="champ" type="search" autoComplete="off" placeholder="Nom, muscle, matériel…"
          value={recherche} onChange={(e) => setRecherche(e.target.value)} />
      </div>
      {/* filtres en trois menus compacts sur une ligne (choix de Thomas, 18 novembre 2026) : tout se voit d'un coup,
          le filtre choisi reste écrit dans son bouton, la croix l'enlève */}
      <div className="choix-filtres" role="group" aria-label="Filtrer la banque">
        <MenuFiltre id="choix-f-partie" nom="Partie" valeur={partie} tous="Tout" options={reglages.parties}
          changer={(v) => { setPartie(v); setCategorie('Toutes') }} />
        <MenuFiltre id="choix-f-cat" nom="Catégorie" valeur={categorie} tous="Toutes"
          options={reglages.categories.filter((c) => partie === 'Tout' || partieDe(c, reglages) === partie)} changer={setCategorie} />
        <MenuFiltre id="choix-f-mat" nom="Matériel" valeur={materiel} tous="Tous" options={reglages.materiels} changer={setMateriel} />
      </div>
      {exercices === null && <p className="espace-texte" role="status">Chargement de la banque…</p>}
      {aucun && (
        <p className="espace-aide">
          {recherche.trim() || categorie !== 'Toutes' || materiel !== 'Tous' || partie !== 'Tout' ? 'Aucun exercice ne correspond. Créez-le ci-dessous.' : 'Votre banque est vide. Créez un premier exercice ci-dessous.'}
        </p>
      )}
      {resultats.length > 0 && (
        <ul className="espace-choix__liste">
          {resultats.map((e) => (
            <li key={e.id} className="espace-choix__ligne" draggable onDragStart={(ev) => { ev.dataTransfer.setData(TYPE_GLISSE, e.id); ev.dataTransfer.effectAllowed = 'copy' }}>
              <PhotoStockee chemin={e.photos?.[0]} alt="" classe="espace-vignette espace-vignette--petite" />
              <span className="espace-choix__nom">
                <span className="espace-choix__exo">{e.nom}</span>
                <span className="espace-choix__muscles">{[e.categorie, e.materiel].filter(Boolean).join(' · ') || (e.muscles ?? []).join(', ')}</span>
              </span>
              <MaterielPicto materiel={e.materiel} />
              {/* sur téléphone, on ne peut pas glisser : le « + » ajoute l'exercice au dernier bloc (accord de Thomas, 18 novembre 2026) */}
              <button type="button" className="bouton bouton--secondaire bouton--compact espace-choix__ajout" onClick={() => ajouter(e)}>
                Ajouter<span className="sr-only"> {e.nom} à la séance</span>
              </button>
              <span className="espace-choix__poignee" aria-hidden="true"><svg viewBox="0 0 10 16" width="10" height="16" fill="currentColor"><circle cx="2" cy="2" r="1.5" /><circle cx="8" cy="2" r="1.5" /><circle cx="2" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" /><circle cx="2" cy="14" r="1.5" /><circle cx="8" cy="14" r="1.5" /></svg></span>
            </li>
          ))}
        </ul>
      )}
      <details className="espace-choix__creer" open={creationOuverte}
        onToggle={(e) => setCreationOuverte(e.currentTarget.open)}>
        <summary onClick={(e) => basculerDetails(e, e.currentTarget.nextElementSibling)}>Créer un nouvel exercice sans quitter la séance</summary>
        <div className="espace-choix__corps">
        <div className="espace-choix__form">
          <div className="champ-groupe">
            <label htmlFor="nx-nom">Nom</label>
            <input id="nx-nom" className="champ" autoComplete="off" {...champ('nom')} aria-invalid={erreur ? true : undefined} aria-describedby={erreur ? 'nx-erreur' : undefined} />
          </div>
          <ChoixAvecAjout id="nx-cat" label="Catégorie" cle="categories" liste={reglages.categories} libelleNouveau="Nouvelle catégorie"
            valeur={nouvel.categorie || reglages.categories[0] || ''} changer={(v) => setNouvel((n) => ({ ...n, categorie: v }))} />
          <ChoixAvecAjout id="nx-mat" label="Matériel" cle="materiels" liste={reglages.materiels} libelleNouveau="Nouveau matériel"
            valeur={nouvel.materiel || reglages.materiels[reglages.materiels.length - 1] || ''} changer={(v) => setNouvel((n) => ({ ...n, materiel: v }))} />
          <div className="champ-groupe espace-choix__large">
            <label htmlFor="nx-cons">Consigne d’exécution</label>
            <input id="nx-cons" className="champ" autoComplete="off" {...champ('consignes')} />
          </div>
        </div>
        {erreur && <p id="nx-erreur" className="espace-message espace-message--erreur" role="alert">{erreur}</p>}
        <p className="espace-aide">Vous compléterez la fiche (photos, erreurs à éviter…) plus tard dans la banque.</p>
        <button type="button" className="bouton bouton--principal bouton--compact" onClick={creer} disabled={envoi}>
          {envoi ? 'Création…' : 'Créer et ajouter à la séance'}
        </button>
        </div>
      </details>
    </section>
  )
}

// Un filtre : un vrai menu déroulant (liste complète, pratique au doigt), habillé en pastille ;
// quand un choix est fait, la pastille devient noire avec le choix écrit et une croix pour revenir à « tous »
function MenuFiltre({ id, nom, valeur, tous, options, changer }) {
  const actif = valeur !== tous
  return (
    <span className={`choix-filtre${actif ? ' est-actif' : ''}`}>
      <label className="sr-only" htmlFor={id}>{nom}</label>
      <select id={id} value={valeur} onChange={(e) => changer(e.target.value)}>
        <option value={tous}>{nom}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {actif
        ? <button type="button" className="choix-filtre__x" aria-label={`Enlever le filtre ${nom} : ${valeur}`} onClick={() => changer(tous)}>
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        : <svg className="choix-filtre__fleche" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>}
    </span>
  )
}
