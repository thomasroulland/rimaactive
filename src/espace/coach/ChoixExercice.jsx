import { useState } from 'react'
import { LETTRES } from '../donnees/programme.js'
import PhotoStockee from './PhotoStockee.jsx'

const simplifier = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

// « Ajouter un exercice » : choix dans la banque (exercices non retirés), dans un bloc existant ou un nouveau bloc
export default function ChoixExercice({ exercices, lettres, ajouter }) {
  const prochaine = LETTRES[lettres.length]
  const [bloc, setBloc] = useState(lettres[lettres.length - 1] ?? 'A')
  const [recherche, setRecherche] = useState('')
  const blocChoisi = lettres.includes(bloc) || bloc === prochaine ? bloc : (lettres[0] ?? 'A')

  const t = simplifier(recherche.trim())
  const resultats = (exercices ?? [])
    .filter((e) => e.retire !== true)
    .filter((e) => !t || simplifier(`${e.nom} ${(e.muscles ?? []).join(' ')}`).includes(t))

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
        <input id="choix-recherche" className="champ" type="search" autoComplete="off" placeholder="Nom ou muscle"
          value={recherche} onChange={(e) => setRecherche(e.target.value)} />
      </div>
      {exercices === null && <p className="espace-texte" role="status">Chargement de la banque…</p>}
      {exercices && resultats.length === 0 && (
        <p className="espace-texte">
          {recherche.trim() ? 'Aucun exercice ne correspond.' : 'Votre banque est vide. Ajoutez des exercices dans l’onglet « Banque d’exercices ».'}
        </p>
      )}
      {resultats.length > 0 && (
        <ul className="espace-choix__liste">
          {resultats.map((e) => (
            <li key={e.id} className="espace-choix__ligne">
              <PhotoStockee chemin={e.photos?.[0]} alt="" classe="espace-vignette espace-vignette--petite" />
              <span className="espace-choix__nom">
                <span className="espace-choix__exo">{e.nom}</span>
                {e.muscles?.length > 0 && <span className="espace-choix__muscles">{e.muscles.join(', ')}</span>}
              </span>
              <button type="button" className="bouton bouton--secondaire bouton--compact" onClick={() => ajouter(blocChoisi, e)}>
                Ajouter<span className="sr-only"> {e.nom} au bloc {blocChoisi}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
