import { useEffect, useRef, useState } from 'react'

// « + Séance » : un seul bouton, qui ouvre la liste des types (et « Gérer les types »)
export default function AjoutSeance({ types, ajouter, gerer }) {
  const [ouvert, setOuvert] = useState(false)
  const zone = useRef(null)
  useEffect(() => {
    if (!ouvert) return undefined
    const fermer = (e) => { if (!zone.current?.contains(e.target)) setOuvert(false) }
    const echap = (e) => { if (e.key === 'Escape') setOuvert(false) }
    document.addEventListener('pointerdown', fermer)
    document.addEventListener('keydown', echap)
    return () => { document.removeEventListener('pointerdown', fermer); document.removeEventListener('keydown', echap) }
  }, [ouvert])
  return (
    <div className="ajout-seance" ref={zone}>
      <button type="button" className="bouton bouton--secondaire ajout-seance__bouton" aria-expanded={ouvert} aria-haspopup="true" onClick={() => setOuvert(!ouvert)}>
        <span aria-hidden="true" className="ajout-seance__plus" /> Séance
      </button>
      {ouvert && (
        <div className="ajout-seance__menu" role="group" aria-label="Type de la nouvelle séance">
          <p className="ajout-seance__titre">Type de séance</p>
          {types.map((t) => (
            <button key={t.id} type="button" className="ajout-seance__choix" onClick={() => { setOuvert(false); ajouter(t.id) }}>{t.nom}</button>
          ))}
          <button type="button" className="ajout-seance__gerer" onClick={() => { setOuvert(false); gerer() }}>Gérer les types…</button>
        </div>
      )}
    </div>
  )
}

// photo d'un élément : sa copie, sinon la photo actuelle de la fiche dans la banque
