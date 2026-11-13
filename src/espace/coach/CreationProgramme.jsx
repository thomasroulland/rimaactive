import { useState } from 'react'
import { nouvelIdProgramme } from '../depots.js'
import { aujourdhuiIso, lundiDe, ajoutJours, dateLongue } from '../donnees/calculs.js'

export const NB_SEMAINES = Array.from({ length: 11 }, (_, i) => i + 2) // 2 à 12
const PAR_SEMAINE = [1, 2, 3, 4, 5, 6]

// Lundis proposés pour le début : celui de la semaine en cours puis les 16 suivants (+ la valeur actuelle si plus ancienne)
export function lundisProposes(actuel) {
  const premier = lundiDe(aujourdhuiIso())
  const liste = Array.from({ length: 17 }, (_, i) => ajoutJours(premier, i * 7))
  if (actuel && !liste.includes(actuel)) liste.unshift(actuel)
  return liste
}

export function ChoixDebut({ id, valeur, changer, desactive, aide, lundis, actuel }) {
  return (
    <div className="champ-groupe">
      <label htmlFor={id}>Début (un lundi)</label>
      <select id={id} className="champ" value={valeur} onChange={(e) => changer(e.target.value)} disabled={desactive}
        aria-describedby={aide ? `${id}-aide` : undefined}>
        {(lundis ?? lundisProposes(valeur)).map((l) => <option key={l} value={l}>{dateLongue(l)}{actuel && l === actuel && l !== valeur ? ' (enregistré)' : ''}</option>)}
      </select>
      {aide && <p id={`${id}-aide`} className="espace-aide">{aide}</p>}
    </div>
  )
}

// Formulaire « Créer un programme » : nom, semaines (2–12), séances par semaine (1–6), début.
// L'identifiant du document est choisi une fois : un nouvel essai après une erreur écrit le même programme.
export default function CreationProgramme({ prenom, creer, annuler, envoi }) {
  const [id] = useState(() => nouvelIdProgramme())
  const [champs, setChamps] = useState({ nom: '', semaines: 4, parSemaine: 3, debut: ajoutJours(lundiDe(aujourdhuiIso()), 7) })
  const [erreur, setErreur] = useState('')

  function envoyer(event) {
    event.preventDefault()
    if (!champs.nom.trim()) { setErreur('Donnez un nom au programme.'); return }
    setErreur('')
    creer({ id, ...champs, nom: champs.nom.trim() }).catch((e) => setErreur(e.message))
  }

  return (
    <form className="espace-carte espace-creation" onSubmit={envoyer} noValidate aria-labelledby="creation-titre">
      <h2 id="creation-titre" className="espace-sous-titre">Créer un programme</h2>
      <p className="espace-texte">Programme sur mesure pour {prenom || 'votre coaché'}. Il reste en brouillon tant que vous ne le publiez pas.</p>
      <div className="espace-creation__champs">
        <div className="champ-groupe espace-creation__nom">
          <label htmlFor="np-nom">Nom</label>
          <input id="np-nom" className="champ" autoComplete="off" value={champs.nom} placeholder="Ex. Remise en forme · 6 semaines"
            aria-describedby="np-erreur" aria-invalid={erreur ? true : undefined}
            onChange={(e) => { setChamps({ ...champs, nom: e.target.value }); setErreur('') }} />
        </div>
        <div className="champ-groupe">
          <label htmlFor="np-sem">Semaines</label>
          <select id="np-sem" className="champ" value={champs.semaines} onChange={(e) => setChamps({ ...champs, semaines: Number(e.target.value) })}>
            {NB_SEMAINES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="champ-groupe">
          <label htmlFor="np-sps">Séances par semaine</label>
          <select id="np-sps" className="champ" value={champs.parSemaine} onChange={(e) => setChamps({ ...champs, parSemaine: Number(e.target.value) })}>
            {PAR_SEMAINE.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <ChoixDebut id="np-debut" valeur={champs.debut} changer={(debut) => setChamps({ ...champs, debut })} />
      </div>
      <p id="np-erreur" className="espace-message espace-message--erreur" role="alert">{erreur}</p>
      <div className="espace-actions">
        <button type="submit" className="bouton bouton--principal" disabled={envoi}>{envoi ? 'Création…' : 'Créer le programme'}</button>
        {annuler && <button type="button" className="bouton bouton--secondaire" onClick={annuler}>Annuler</button>}
      </div>
    </form>
  )
}
