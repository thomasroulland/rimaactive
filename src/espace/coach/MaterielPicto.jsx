// Pictogramme du matériel d'un exercice (14 novembre 2026) : trait fin encre, sur un rond craie.
// Reconnaît le nom (même saisi par Marie) : barre, haltère, kettlebell / KB, poids du corps, machine, poulie / câble, landmine, élastique ;
// sinon un pictogramme neutre.
import { genreMateriel } from '../donnees/banque.js'

const TRACES = {
  // barre : les gros disques près du centre, les petits vers l'extérieur (15 novembre 2026)
  barre: <><path d="M1.5 12h21" /><path d="M9 6v12M15 6v12" /><path d="M7 8.5v7M17 8.5v7" /><path d="M5 10.5v3M19 10.5v3" /></>,
  haltere: <><path d="M8 12h8" /><rect x="4.5" y="8" width="3.5" height="8" rx="1" /><rect x="16" y="8" width="3.5" height="8" rx="1" /><path d="M2.5 10.5v3M21.5 10.5v3" /></>,
  kettlebell: <><path d="M8.6 11.5V8.3a3.4 3.4 0 0 1 6.8 0v3.2" /><path d="M6.3 11.5h11.4a6.8 6.8 0 1 1-11.4 0Z" /></>,
  corps: <><circle cx="12" cy="4.6" r="2" /><path d="M12 7.5v6.5M6.5 9.8 12 8.7l5.5 1.1M12 14l-3.2 6.5M12 14l3.2 6.5" /></>,
  // machine guidée : cadre, tige et pile de plaques avec la goupille
  machine: <><path d="M3.5 21h17M6 21V3h12v18" /><path d="M12 3v6.5" /><rect x="9" y="9.5" width="6" height="2.4" rx=".4" /><rect x="9" y="12.7" width="6" height="2.4" rx=".4" /><rect x="9" y="15.9" width="6" height="2.4" rx=".4" /><path d="M15 14h2" /></>,
  // poulie : potence, roue en haut, câble et poignée
  poulie: <><path d="M3 21h8M6 21V3.5h9.5" /><circle cx="15.5" cy="5.5" r="2" /><path d="M17.5 5.5v7" /><path d="M17.5 12.5 14.8 17h5.4Z" /></>,
  // landmine : barre posée en biais dans son point d'ancrage au sol, disque à l'autre bout
  landmine: <><path d="M2.5 21h7" /><path d="M4 21v-2.2a2 2 0 0 1 4 0V21" /><path d="M6 18.8 20.5 4.5" /><rect x="14.3" y="3.2" width="3.4" height="10" rx="1" transform="rotate(45 16 8.2)" /></>,
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
