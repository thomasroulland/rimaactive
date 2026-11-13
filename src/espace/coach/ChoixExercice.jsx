import { useEffect, useState } from 'react'
import { LETTRES } from '../donnees/programme.js'
import { CATEGORIES, MATERIELS } from '../donnees/banque.js'
import { enregistrerExercice } from '../depots.js'
import { messageErreur } from '../erreurs.js'
import PhotoStockee from './PhotoStockee.jsx'
import { basculerDetails } from '../../components/basculerDetails.js'

const simplifier = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const VIDE = { nom: '', categorie: CATEGORIES[0], materiel: MATERIELS[MATERIELS.length - 1], consignes: '' }

// « Ajouter un exercice » (maquette coach) : recherche et catégories dans la banque, choix du bloc,
// et création d'un nouvel exercice sans quitter la séance (fiche complétée plus tard dans la banque).
export default function ChoixExercice({ exercices, lettres, ajouter }) {
  const prochaine = LETTRES[lettres.length]
  const [bloc, setBloc] = useState(lettres[lettres.length - 1] ?? 'A')
  const [recherche, setRecherche] = useState('')
  const [categorie, setCategorie] = useState('Toutes')
  const [nouvel, setNouvel] = useState(VIDE)
  const [creationOuverte, setCreationOuverte] = useState(false)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const blocChoisi = lettres.includes(bloc) || bloc === prochaine ? bloc : (lettres[0] ?? 'A')

  const t = simplifier(recherche.trim())
  const resultats = (exercices ?? [])
    .filter((e) => e.retire !== true)
    .filter((e) => categorie === 'Toutes' || e.categorie === categorie)
    .filter((e) => !t || simplifier(`${e.nom} ${e.categorie ?? ''} ${e.materiel ?? ''} ${(e.muscles ?? []).join(' ')}`).includes(t))
  const aucun = Boolean(exercices) && resultats.length === 0
  useEffect(() => { if (aucun) setCreationOuverte(true) }, [aucun])

  async function creer() {
    const nom = nouvel.nom.trim()
    if (!nom) { setErreur('Donnez un nom à l’exercice.'); return }
    setEnvoi(true); setErreur('')
    try {
      const exo = { ...nouvel, nom, consignes: nouvel.consignes.trim(), muscles: [], photos: [] }
      const id = await enregistrerExercice(exo)
      ajouter(blocChoisi, { ...exo, id })
      setNouvel(VIDE); setCreationOuverte(false); setRecherche('')
    } catch (err) {
      setErreur(messageErreur(err.code))
    } finally { setEnvoi(false) }
  }

  const champ = (cle) => ({ value: nouvel[cle], onChange: (e) => { setNouvel({ ...nouvel, [cle]: e.target.value }); setErreur('') } })

  return (
    <section className="espace-carte espace-choix" aria-labelledby="choix-titre">
      <div className="espace-choix__tete">
        <h2 id="choix-titre" className="espace-sous-titre">Ajouter un exercice</h2>
        <div className="champ-groupe espace-choix__bloc">
          <label htmlFor="choix-bloc">Dans le bloc</label>
          <select id="choix-bloc" className="champ" value={blocChoisi} onChange={(e) => setBloc(e.target.value)}>
            {lettres.map((l) => <option key={l} value={l}>{l}</option>)}
            {prochaine && <option value={prochaine}>{prochaine} (nouveau bloc)</option>}
          </select>
        </div>
      </div>
      <div className="champ-groupe">
        <label htmlFor="choix-recherche">Rechercher dans ma banque</label>
        <input id="choix-recherche" className="champ" type="search" autoComplete="off" placeholder="Nom, muscle, matériel…"
          value={recherche} onChange={(e) => setRecherche(e.target.value)} />
      </div>
      <div className="filtres-coaches espace-choix__filtres" role="group" aria-label="Catégorie">
        {['Toutes', ...CATEGORIES].map((c) => (
          <button key={c} type="button" className="filtre-coaches" aria-pressed={categorie === c} onClick={() => setCategorie(c)}>{c}</button>
        ))}
      </div>
      {exercices === null && <p className="espace-texte" role="status">Chargement de la banque…</p>}
      {aucun && (
        <p className="espace-aide">
          {recherche.trim() || categorie !== 'Toutes' ? 'Aucun exercice ne correspond. Créez-le ci-dessous.' : 'Votre banque est vide. Créez un premier exercice ci-dessous.'}
        </p>
      )}
      {resultats.length > 0 && (
        <ul className="espace-choix__liste">
          {resultats.map((e) => (
            <li key={e.id} className="espace-choix__ligne">
              <PhotoStockee chemin={e.photos?.[0]} alt="" classe="espace-vignette espace-vignette--petite" />
              <span className="espace-choix__nom">
                <span className="espace-choix__exo">{e.nom}</span>
                <span className="espace-choix__muscles">{[e.categorie, e.materiel].filter(Boolean).join(' · ') || (e.muscles ?? []).join(', ')}</span>
              </span>
              <button type="button" className="bouton bouton--secondaire bouton--compact" onClick={() => ajouter(blocChoisi, e)}>
                Ajouter<span className="sr-only"> {e.nom} au bloc {blocChoisi}</span>
              </button>
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
          <div className="champ-groupe">
            <label htmlFor="nx-cat">Catégorie</label>
            <select id="nx-cat" className="champ" {...champ('categorie')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <div className="champ-groupe">
            <label htmlFor="nx-mat">Matériel</label>
            <select id="nx-mat" className="champ" {...champ('materiel')}>{MATERIELS.map((m) => <option key={m}>{m}</option>)}</select>
          </div>
          <div className="champ-groupe espace-choix__large">
            <label htmlFor="nx-cons">Consignes importantes</label>
            <input id="nx-cons" className="champ" autoComplete="off" {...champ('consignes')} />
          </div>
        </div>
        {erreur && <p id="nx-erreur" className="espace-message espace-message--erreur" role="alert">{erreur}</p>}
        <p className="espace-aide">Vous compléterez la fiche (photos, erreurs à éviter…) plus tard dans la banque.</p>
        <button type="button" className="bouton bouton--principal bouton--compact" onClick={creer} disabled={envoi}>
          {envoi ? 'Création…' : `Créer et ajouter au bloc ${blocChoisi}`}
        </button>
        </div>
      </details>
    </section>
  )
}
