// Pictogramme du matériel d'un exercice (14 novembre 2026) : trait fin encre, sur un rond craie.
// Reconnaît le nom (même saisi par Marie) : barre, haltère, kettlebell / KB, poids du corps, machine / poulie, élastique ;
// sinon un pictogramme neutre.
import { genreMateriel } from '../donnees/banque.js'

const TRACES = {
  barre: <><path d="M2 12h20" /><path d="M5.5 7.5v9M8.5 8.5v7M15.5 8.5v7M18.5 7.5v9" /></>,
  haltere: <><path d="M8 12h8" /><rect x="4.5" y="8" width="3.5" height="8" rx="1" /><rect x="16" y="8" width="3.5" height="8" rx="1" /><path d="M2.5 10.5v3M21.5 10.5v3" /></>,
  kettlebell: <><path d="M8.6 11.5V8.3a3.4 3.4 0 0 1 6.8 0v3.2" /><path d="M6.3 11.5h11.4a6.8 6.8 0 1 1-11.4 0Z" /></>,
  corps: <><circle cx="12" cy="4.6" r="2" /><path d="M12 7.5v6.5M6.5 9.8 12 8.7l5.5 1.1M12 14l-3.2 6.5M12 14l3.2 6.5" /></>,
  machine: <><path d="M5 21V3.5h14V21M3.5 21h17" /><path d="M12 3.5v5" /><rect x="9.5" y="8.5" width="5" height="5" rx="1" /><path d="M9.5 16.5h5" /></>,
  elastique: <><path d="M3 14.5c2.2-5.5 4.4 5 6.6-.2s4.4-5.2 6.6 0 3.4 3.2 4.8.7" /><circle cx="3" cy="14.5" r="1.3" /><circle cx="21" cy="15" r="1.3" /></>,
  autre: <><circle cx="12" cy="12" r="7.5" /><circle cx="9" cy="12" r=".6" fill="currentColor" /><circle cx="12" cy="12" r=".6" fill="currentColor" /><circle cx="15" cy="12" r=".6" fill="currentColor" /></>,
}

export default function MaterielPicto({ materiel, classe = '' }) {
  const genre = genreMateriel(materiel)
  if (!genre) return null
  return (
    <span className={`materiel-picto ${classe}`} title={materiel} aria-label={`Matériel : ${materiel}`} role="img">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{TRACES[genre]}</svg>
    </span>
  )
}
