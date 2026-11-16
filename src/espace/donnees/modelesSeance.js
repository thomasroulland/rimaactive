import { copierSeance, nouvelId } from './programme.js'

// Modèles de SÉANCE (16 novembre 2026, à la place des modèles de programme) : une séance type (titre, type, lieu, durée,
// objectif, blocs et exercices) que le coach glisse dans n'importe quelle semaine d'un programme.
// Ils sont rangés dans la collection « modeles » avec `genre: 'seance'` ; les anciens modèles de programme (sans genre)
// ne sont plus affichés.

const CHAMPS = ['titre', 'type', 'lieu', 'duree', 'objectif', 'consigne', 'distance', 'temps']

export const estModeleSeance = (m) => m?.genre === 'seance'

// La séance d'un programme devient un modèle (copie : nouveaux identifiants, rien de ce qui a été fait)
export function versModeleSeance(seance) {
  const s = copierSeance(seance)
  const propre = { id: nouvelId(), blocs: s.blocs ?? [] }
  for (const c of CHAMPS) if (s[c] !== undefined) propre[c] = s[c]
  return { genre: 'seance', nom: String(seance.titre ?? '').trim() || 'Séance sans titre', seance: propre }
}

// Un modèle devient une séance neuve du programme (nouveaux identifiants : la séance est indépendante du modèle)
export function seanceDepuisModele(modele) {
  return copierSeance({ blocs: [], ...modele.seance, titre: modele.seance?.titre || modele.nom || '' })
}

// Insère une séance dans la semaine `vers`, à la place `index` (à la fin par défaut)
export function insererSeance(programme, vers, seance, index = Infinity) {
  const p = structuredClone(programme)
  const cible = p.semaines[vers].seances
  cible.splice(Math.max(0, Math.min(index, cible.length)), 0, seance)
  return p
}

export function resumeModele(modele) {
  const blocs = modele.seance?.blocs ?? []
  const exos = blocs.reduce((t, b) => t + (b.elements ?? []).length, 0)
  return { blocs: blocs.filter((b) => (b.elements ?? []).length > 0).length, exos, duree: modele.seance?.duree ?? '' }
}

// Nouveau modèle vide (page Modèles)
export function nouveauModeleSeance(type = 'force') {
  return { genre: 'seance', nom: '', seance: { id: nouvelId(), titre: '', type, lieu: '', duree: '', objectif: '', blocs: [] } }
}
