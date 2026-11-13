import { useEffect, useRef, useState } from 'react'
import { enregistrerReglages, renommerDansBanque } from '../depots.js'
import { nouvelId } from '../donnees/programme.js'
import { TYPES_DE_BASE } from '../donnees/reglages.js'
import { messageErreur } from '../erreurs.js'

// Fenêtre « Gérer… » (14 novembre 2026) : ajouter, renommer, supprimer les éléments d'une ou plusieurs listes du coach.
// `listes` : [{ cle: 'types' | 'categories' | 'materiels', titre }] ; `reglages` : les listes actuelles.
export default function GestionListes({ titre, listes, reglages, fermer }) {
  const ref = useRef(null)
  useEffect(() => { const d = ref.current; if (d && !d.open) d.showModal() }, [])
  return (
    <dialog ref={ref} className={`espace-dialogue gestion-listes${listes.length > 1 ? ' gestion-listes--colonnes' : ''}`} aria-labelledby="gl-titre" onClose={fermer}
      onClick={(e) => { if (e.target === ref.current) ref.current.close() }}>
      <div className="gestion__tete">
        <h2 id="gl-titre" className="titre titre--tuile">{titre}</h2>
        <button type="button" className="panneau-seance__fermer" aria-label="Fermer" onClick={() => ref.current.close()}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <div className="gestion-listes__colonnes">
        {listes.map((l) => <Liste key={l.cle} cle={l.cle} titre={l.titre} seule={listes.length === 1} reglages={reglages} />)}
      </div>
    </dialog>
  )
}

const BASE = new Set(TYPES_DE_BASE.map((t) => t.id))

function Liste({ cle, titre, seule, reglages }) {
  const types = cle === 'types'
  // éléments communs : { id, nom } (les catégories et matériels sont de simples noms)
  const elements = types ? reglages.types : reglages[cle].map((n) => ({ id: n, nom: n }))
  const [nouveau, setNouveau] = useState('')
  const [edition, setEdition] = useState(null) // { id, nom }
  const [aSupprimer, setASupprimer] = useState(null)
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)

  const ecrire = async (liste) => enregistrerReglages({ [cle]: types ? liste : liste.map((x) => x.nom) })
  const lancer = async (fn) => {
    setEnvoi(true); setErreur('')
    try { await fn() } catch (e) { setErreur(messageErreur(e.code)) } finally { setEnvoi(false) }
  }
  const existe = (nom, sauf) => elements.some((x) => x.id !== sauf && x.nom.trim().toLowerCase() === nom.trim().toLowerCase())

  function ajouter(e) {
    e.preventDefault()
    const nom = nouveau.trim()
    if (!nom) return
    if (existe(nom)) { setErreur(`« ${nom} » existe déjà.`); return }
    lancer(async () => { await ecrire([...elements, { id: types ? nouvelId() : nom, nom }]); setNouveau('') })
  }
  function renommer(e) {
    e.preventDefault()
    const nom = edition.nom.trim()
    const ancien = elements.find((x) => x.id === edition.id)
    if (!nom || nom === ancien.nom) { setEdition(null); return }
    if (existe(nom, edition.id)) { setErreur(`« ${nom} » existe déjà.`); return }
    lancer(async () => {
      await ecrire(elements.map((x) => (x.id === edition.id ? { id: types ? x.id : nom, nom } : x)))
      // les fiches de la banque suivent le nouveau nom
      if (!types) await renommerDansBanque(cle === 'categories' ? 'categorie' : 'materiel', ancien.nom, nom)
      setEdition(null)
    })
  }
  const supprimer = (x) => lancer(async () => { await ecrire(elements.filter((y) => y.id !== x.id)); setASupprimer(null) })

  return (
    <section className="gestion-listes__partie" aria-labelledby={`gl-${cle}`}>
      <h3 id={`gl-${cle}`} className={seule ? 'sr-only' : 'gestion__titre'}>{titre}</h3>
      <ul className="gestion-listes__liste">
        {elements.map((x) => (
          <li key={x.id} className="gestion-listes__ligne">
            {edition?.id === x.id ? (
              <form className="gestion-listes__edition" onSubmit={renommer}>
                <label htmlFor={`gl-e-${cle}`} className="sr-only">Nouveau nom de « {x.nom} »</label>
                <input id={`gl-e-${cle}`} className="champ" autoFocus value={edition.nom} onChange={(e) => setEdition({ ...edition, nom: e.target.value })} />
                <button type="submit" className="bouton bouton--principal bouton--compact" disabled={envoi}>Enregistrer</button>
                <button type="button" className="espace-lien" onClick={() => setEdition(null)}>Annuler</button>
              </form>
            ) : (
              <>
                <span className="gestion-listes__nom">{x.nom}</span>
                {aSupprimer === x.id ? (
                  <span className="gestion-listes__actions">
                    <button type="button" className="gestion-listes__confirmer" disabled={envoi} onClick={() => supprimer(x)}>Supprimer « {x.nom} »</button>
                    <button type="button" className="espace-lien" onClick={() => setASupprimer(null)}>Annuler</button>
                  </span>
                ) : (
                  <span className="gestion-listes__actions">
                    <button type="button" className="gestion-listes__icone" aria-label={`Renommer ${x.nom}`} title="Renommer" onClick={() => { setEdition({ id: x.id, nom: x.nom }); setErreur('') }}>
                      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" /></svg>
                    </button>
                    {!(types && BASE.has(x.id)) && (
                      <button type="button" className="gestion-listes__icone gestion-listes__icone--danger" aria-label={`Supprimer ${x.nom}`} title="Supprimer" onClick={() => setASupprimer(x.id)}>
                        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>
                      </button>
                    )}
                  </span>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
      <form className="gestion-listes__ajout" onSubmit={ajouter}>
        <label htmlFor={`gl-n-${cle}`} className="sr-only">Ajouter dans « {titre} »</label>
        <input id={`gl-n-${cle}`} className="champ" autoComplete="off" placeholder="Nouveau nom" value={nouveau} onChange={(e) => { setNouveau(e.target.value); setErreur('') }} />
        <button type="submit" className="bouton bouton--secondaire bouton--compact" disabled={envoi || !nouveau.trim()}>Ajouter</button>
      </form>
      {erreur && <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>}
      <p className="espace-aide">
        {types
          ? 'Force et Course existent toujours (on peut les renommer). Supprimer un type ne change pas les séances déjà créées.'
          : 'Renommer met à jour les fiches de la banque. Supprimer retire seulement le choix de la liste.'}
      </p>
    </section>
  )
}
