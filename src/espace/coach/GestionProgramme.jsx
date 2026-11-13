import { useEffect, useRef, useState } from 'react'
import { decalerProgramme, depublierProgramme, enregistrerProgramme, nouvelIdProgramme, supprimerProgramme } from '../depots.js'
import { ajoutJours, aujourdhuiIso, dateLongue, lundiDe } from '../donnees/calculs.js'
import { dupliquerProgramme } from '../donnees/programme.js'
import { messageErreur } from '../erreurs.js'
import { lundisProposes, libelleLundi } from './CreationProgramme.jsx'

// Lundis proposés : ceux de la création (26 semaines avant et après aujourd'hui) + 8 semaines autour de la date actuelle
export function lundisAutour(iso) {
  const base = lundiDe(iso || aujourdhuiIso())
  const autour = Array.from({ length: 25 }, (_, i) => ajoutJours(base, (i - 8) * 7))
  return [...new Set([...lundisProposes(iso), ...autour])].sort()
}
const ecartJours = (a, b) => Math.round((new Date(`${b}T12:00:00`) - new Date(`${a}T12:00:00`)) / (24 * 3600 * 1000))
// « 2 semaines plus tard », « 5 jours plus tôt »
function texteEcart(j) {
  const n = Math.abs(j)
  const quoi = n % 7 === 0 ? `${n / 7} semaine${n / 7 > 1 ? 's' : ''}` : `${n} jour${n > 1 ? 's' : ''}`
  return `${quoi} ${j > 0 ? 'plus tard' : 'plus tôt'}`
}

// « Gérer le programme » (13 novembre 2026) : décaler les dates, dupliquer, retirer de l'espace du coaché, supprimer.
// `fait(action, donnees)` : prévient l'éditeur (pour rouvrir le bon programme).
export default function GestionProgramme({ prog, prenom, aDesModifs, fermer, fait }) {
  const ref = useRef(null)
  const [debut, setDebut] = useState(prog.debut)
  const finActuelle = ajoutJours(prog.debut, (prog.semaines?.length ?? 0) * 7)
  const [copie, setCopie] = useState({ nom: `${prog.nom || 'Programme'} (suite)`, debut: lundiDe(finActuelle) })
  const [supprimer, setSupprimer] = useState(false)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const publie = prog.statut === 'publié'

  useEffect(() => { const d = ref.current; if (d && !d.open) d.showModal() }, [])
  const lancer = async (fn) => {
    setEnvoi(true); setErreur('')
    try { await fn(); ref.current?.close() } catch (e) { setErreur(messageErreur(e.code)); setEnvoi(false) }
  }
  const ecart = ecartJours(prog.debut, debut)

  return (
    <dialog ref={ref} className="espace-dialogue gestion" aria-labelledby="gestion-titre" onClose={fermer}
      onClick={(e) => { if (e.target === ref.current && !envoi) ref.current.close() }}>
      <div className="gestion__tete">
        <div>
          <p className="surtitre">Programme de {prenom}</p>
          <h2 id="gestion-titre" className="titre titre--tuile">Gérer « {prog.nom || 'Programme sans nom'} »</h2>
        </div>
        <button type="button" className="panneau-seance__fermer" aria-label="Fermer" onClick={() => ref.current.close()}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      {aDesModifs && <p className="espace-message espace-message--erreur">Enregistrez d’abord vos modifications en cours.</p>}
      <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>

      <section className="gestion__partie" aria-labelledby="g-decaler">
        <h3 id="g-decaler" className="gestion__titre">Décaler les dates</h3>
        <p className="espace-aide">Toutes les séances suivent le nouveau début. Les séances déjà faites gardent leur date.</p>
        <div className="gestion__ligne">
          <div className="champ-groupe">
            <label htmlFor="g-debut">Nouveau début (un lundi)</label>
            <select id="g-debut" className="champ" value={debut} onChange={(e) => setDebut(e.target.value)}>
              {lundisAutour(prog.debut).map((l) => <option key={l} value={l}>{libelleLundi(l)}{l === prog.debut ? ' (actuel)' : ''}</option>)}
            </select>
          </div>
          <button type="button" className="bouton bouton--principal" disabled={envoi || aDesModifs || debut === prog.debut}
            onClick={() => lancer(async () => { await decalerProgramme(prog.id, debut); fait('decale', { debut }) })}>
            {ecart === 0 ? 'Décaler' : `Décaler de ${texteEcart(ecart)}`}
          </button>
        </div>
      </section>

      <section className="gestion__partie" aria-labelledby="g-dupliquer">
        <h3 id="g-dupliquer" className="gestion__titre">Dupliquer pour la suite</h3>
        <p className="espace-aide">Une copie complète, en brouillon : {prenom} ne la voit qu’une fois publiée.</p>
        <div className="gestion__ligne">
          <div className="champ-groupe">
            <label htmlFor="g-nom">Nom de la copie</label>
            <input id="g-nom" className="champ" value={copie.nom} onChange={(e) => setCopie({ ...copie, nom: e.target.value })} />
          </div>
          <div className="champ-groupe">
            <label htmlFor="g-debut-copie">Début</label>
            <select id="g-debut-copie" className="champ" value={copie.debut} onChange={(e) => setCopie({ ...copie, debut: e.target.value })}>
              {lundisAutour(copie.debut).map((l) => <option key={l} value={l}>{libelleLundi(l)}</option>)}
            </select>
          </div>
          <button type="button" className="bouton bouton--secondaire" disabled={envoi || aDesModifs || !copie.nom.trim()}
            onClick={() => lancer(async () => {
              const id = nouvelIdProgramme()
              await enregistrerProgramme({ id, ...dupliquerProgramme(prog, { nom: copie.nom.trim(), debut: copie.debut }) }, { creation: true })
              fait('duplique', { id })
            })}>Créer la copie</button>
        </div>
      </section>

      {publie && (
        <section className="gestion__partie" aria-labelledby="g-retirer">
          <h3 id="g-retirer" className="gestion__titre">Retirer de l’espace de {prenom}</h3>
          <p className="espace-aide">Le programme repasse en brouillon : {prenom} ne le voit plus, rien n’est effacé. Vous pourrez le publier à nouveau.</p>
          <button type="button" className="bouton bouton--secondaire" disabled={envoi || aDesModifs}
            onClick={() => lancer(async () => { await depublierProgramme(prog.id); fait('depublie') })}>Repasser en brouillon</button>
        </section>
      )}

      <section className="gestion__partie gestion__partie--danger" aria-labelledby="g-supprimer">
        <h3 id="g-supprimer" className="gestion__titre">Supprimer le programme</h3>
        {!supprimer ? (
          <>
            <p className="espace-aide">Le programme disparaît de l’espace de {prenom}. Les séances déjà faites restent dans le suivi.</p>
            <button type="button" className="bouton bouton--secondaire" disabled={envoi} onClick={() => setSupprimer(true)}>Supprimer…</button>
          </>
        ) : (
          <>
            <p className="espace-texte"><b>Supprimer définitivement « {prog.nom || 'Programme sans nom'} » ?</b> Cette action ne peut pas être annulée.</p>
            <div className="espace-actions">
              <button type="button" className="bouton bouton--principal" disabled={envoi}
                onClick={() => lancer(async () => { await supprimerProgramme(prog.id); fait('supprime') })}>{envoi ? 'Suppression…' : 'Supprimer définitivement'}</button>
              <button type="button" className="bouton bouton--secondaire" disabled={envoi} onClick={() => setSupprimer(false)}>Annuler</button>
            </div>
          </>
        )}
      </section>
    </dialog>
  )
}
