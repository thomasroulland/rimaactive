import { useEffect, useRef } from 'react'

// Fenêtre de confirmation (dialog natif) : `action` n'est lancée qu'après « {libelle} »
export default function Confirmation({ titre, texte, libelle, action, fermer }) {
  const ref = useRef(null)
  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
  }, [])
  return (
    <dialog ref={ref} className="espace-dialogue" aria-labelledby="confirmation-titre" aria-describedby="confirmation-texte"
      onClose={fermer} onClick={(e) => { if (e.target === ref.current) ref.current.close() }}>
      <div className="espace-formulaire">
        <h2 id="confirmation-titre" className="titre titre--tuile">{titre}</h2>
        <p id="confirmation-texte" className="espace-texte">{texte}</p>
        <div className="espace-actions">
          <button type="button" className="bouton bouton--principal" onClick={() => { action(); ref.current.close() }}>{libelle}</button>
          <button type="button" className="bouton bouton--secondaire" autoFocus onClick={() => ref.current.close()}>Annuler</button>
        </div>
      </div>
    </dialog>
  )
}
