import { useState } from 'react'
import { enregistrerReglages } from '../depots.js'
import { messageErreur } from '../erreurs.js'

const NOUVEAU = '__nouveau__'

// Liste (catégorie ou matériel) avec, en dernier, « + Nouvelle… » : un petit champ apparaît pour l'ajouter
// aux listes du coach (réglages) sans quitter la fiche ; la valeur créée est choisie aussitôt (14 novembre 2026).
export default function ChoixAvecAjout({ id, label, cle, liste, valeur, changer, libelleNouveau }) {
  const [ajout, setAjout] = useState(false)
  const [nom, setNom] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const options = [...new Set([...liste, valeur].filter(Boolean))]

  async function ajouter() {
    const n = nom.trim()
    if (!n) return
    const existant = liste.find((x) => x.toLowerCase() === n.toLowerCase())
    if (existant) { changer(existant); setAjout(false); setNom(''); return }
    setEnvoi(true); setErreur('')
    try {
      await enregistrerReglages({ [cle]: [...liste, n] })
      changer(n); setAjout(false); setNom('')
    } catch (e) { setErreur(messageErreur(e.code)) } finally { setEnvoi(false) }
  }

  return (
    <div className="champ-groupe choix-ajout">
      <label htmlFor={id}>{label}</label>
      {ajout ? (
        <div className="choix-ajout__ligne">
          <span className="choix-ajout__champ">
            <input id={id} className="champ" autoComplete="off" autoFocus value={nom} placeholder={libelleNouveau}
              onChange={(e) => { setNom(e.target.value); setErreur('') }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ajouter() } if (e.key === 'Escape') { e.preventDefault(); setAjout(false) } }} />
            <button type="button" className="choix-ajout__annuler" aria-label="Annuler" title="Annuler" onClick={() => { setAjout(false); setNom('') }}>×</button>
          </span>
          <button type="button" className="bouton bouton--principal bouton--compact" disabled={envoi || !nom.trim()} onClick={ajouter}>Ajouter</button>
        </div>
      ) : (
        <select id={id} className="champ" value={valeur || options[0] || ''}
          onChange={(e) => (e.target.value === NOUVEAU ? setAjout(true) : changer(e.target.value))}>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
          <option value={NOUVEAU}>+ {libelleNouveau}…</option>
        </select>
      )}
      {erreur && <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>}
    </div>
  )
}
