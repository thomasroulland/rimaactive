import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ecouterExercices, ecouterModele, enregistrerModele } from '../depots.js'
import {
  ajouterAuBloc, ajouterBlocVide, deplacerBloc, deplacerElement, rafraichirExercices, retirerElement, sansBlocsVides, supprimerBloc,
} from '../donnees/programme.js'
import { nomType } from '../donnees/reglages.js'
import { messageErreur } from '../erreurs.js'
import EditeurSeance from './EditeurSeance.jsx'
import Confirmation from './Confirmation.jsx'
import useGardeSortie from './useGardeSortie.js'
import useReglages from './useReglages.js'

// Modifier un modèle de SÉANCE (/espace/coach/modeles/:modeleId, 16 novembre 2026) : le même écran que la création de séance
// d'un programme (banque à gauche, blocs à droite). La séance est rangée dans un « programme d'une seule séance » pour réutiliser
// les mêmes fonctions (ajouter un exercice, un bloc, retirer…).
const POS = { s: 0, se: 0 }
const enveloppe = (seance) => ({ semaines: [{ id: 'm', seances: [seance] }] })

export default function EditeurModeleSeance() {
  const { modeleId } = useParams()
  const reglages = useReglages()
  const [modele, setModele] = useState(undefined) // undefined : chargement ; null : introuvable
  const [prog, setProg] = useState(null)
  const [exercices, setExercices] = useState(null)
  const [modifie, setModifie] = useState(false)
  const [envoi, setEnvoi] = useState(false)
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')
  const [confirmation, setConfirmation] = useState(null)
  const charge = useRef(false)

  useEffect(() => ecouterModele(modeleId, (l) => {
    const m = l[0] ?? null
    setModele(m)
    if (m && !charge.current) { charge.current = true; setProg(enveloppe({ blocs: [], ...m.seance })) }
  }, () => setModele(null)), [modeleId])
  useEffect(() => ecouterExercices(setExercices, () => setExercices([])), [])
  useGardeSortie(modifie, (continuer) => setConfirmation({ titre: 'Quitter sans enregistrer ?', texte: 'Vos modifications non enregistrées seront perdues.', libelle: 'Quitter sans enregistrer', action: continuer }))
  useEffect(() => {
    if (!modifie) return undefined
    const avertir = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', avertir)
    return () => window.removeEventListener('beforeunload', avertir)
  }, [modifie])

  if (modele === undefined || (modele && !prog)) return <section className="section"><div className="conteneur espace-coach"><p className="espace-texte" role="status">Chargement…</p></div></section>
  if (modele === null) {
    return (
      <section className="section"><div className="conteneur espace-coach">
        <Link to="/espace/coach/modeles" className="espace-retour">‹ Modèles</Link>
        <p className="espace-texte">Ce modèle n’existe plus.</p>
      </div></section>
    )
  }

  const seance = prog.semaines[0].seances[0]
  const changer = (fn) => { setProg((p) => fn(p)); setModifie(true); setMessage('') }
  const muter = (fn) => changer((p) => { const c = structuredClone(p); fn(c.semaines[0].seances[0]); return c })

  async function enregistrer() {
    if (!String(seance.titre ?? '').trim()) { setErreur('Donnez un titre au modèle avant d’enregistrer.'); return }
    setEnvoi(true); setErreur('')
    try {
      const propre = sansBlocsVides(rafraichirExercices(prog, exercices)).semaines[0].seances[0]
      await enregistrerModele({ id: modeleId, genre: 'seance', nom: propre.titre.trim(), seance: propre })
      setModifie(false)
      setMessage('Modèle enregistré.')
    } catch (e) { setErreur(messageErreur(e.code)) } finally { setEnvoi(false) }
  }

  return (
    <>
      <section className="section espace-section--barre">
        <div className="conteneur espace-coach">
          <div className="page-seance__nav">
            <nav className="page-seance__fil" aria-label="Où suis-je">
              <Link to="/espace/coach/modeles" className="page-seance__retour">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
                Modèles de séance
              </Link>
            </nav>
          </div>
          <div className="page-seance__titre-ligne">
            <h1 className="page-seance__titre">{seance.titre || 'Nouveau modèle de séance'}</h1>
            <span className="page-seance__jour">{nomType(seance.type, reglages.types)}</span>
          </div>
          <p className="espace-message" role="status">{message}</p>
          <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>
          <EditeurSeance seance={seance} numero={1} semaine={1} verrou={false} attente={false} exercices={exercices}
            majSeance={(cle, v) => muter((x) => { x[cle] = v })}
            majBloc={(bi, cle, v) => muter((x) => { x.blocs[bi][cle] = v })}
            majElement={(bi, ei, cle, v) => muter((x) => { x.blocs[bi].elements[ei][cle] = v })}
            retirer={(el) => { changer((p) => retirerElement(p, POS, el.id)); setMessage(`« ${el.nom} » retiré.`) }}
            supprimerBloc={(blocId, nom) => { changer((p) => supprimerBloc(p, POS, blocId)); setMessage(`${nom} supprimé.`) }}
            ajouterBloc={() => changer((p) => ajouterBlocVide(p, POS))}
                deplacerBloc={(de, vers) => changer((p) => deplacerBloc(p, POS, de, vers))}
                deplacerElement={(bi, de, vers) => changer((p) => deplacerElement(p, POS, bi, de, vers))}
            ajouter={(lettre, exo) => { changer((p) => ajouterAuBloc(p, POS, lettre, exo)); setMessage(`« ${exo.nom} » ajouté au bloc ${lettre}.`) }} />
          <div className="espace-barre" role="region" aria-label="Enregistrement">
            <div className="conteneur espace-barre__ligne">
              <p className="espace-barre__etat">
                <span className="espace-statut espace-statut--autre">Modèle de séance</span>
                {modifie ? <span className="espace-barre__modifie">Modifications non enregistrées</span> : <span>À glisser dans les programmes depuis la fiche d’un coaché.</span>}
              </p>
              <div className="espace-actions">
                <button type="button" className="bouton bouton--principal" disabled={envoi || !modifie} onClick={enregistrer}>{envoi ? 'Enregistrement…' : 'Enregistrer le modèle'}</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      {confirmation && <Confirmation {...confirmation} fermer={() => setConfirmation(null)} />}
    </>
  )
}
