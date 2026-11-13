// Listes réglables par le coach (14 novembre 2026) : types de séance, catégories et matériels de la banque.
// Elles sont rangées dans le document Firestore `reglages/coach` ; sans ce document, on prend ces valeurs.
import { CATEGORIES, MATERIELS } from './banque.js'

// « force » et « course » existent depuis le début : leurs séances gardent leur fonctionnement
// (blocs d'exercices / distance et temps). Ils se renomment mais ne se suppriment pas.
export const TYPES_DE_BASE = [{ id: 'force', nom: 'Force' }, { id: 'course', nom: 'Course' }]

export const REGLAGES_PAR_DEFAUT = { types: TYPES_DE_BASE, categories: CATEGORIES, materiels: MATERIELS }

export function completerReglages(d) {
  const types = Array.isArray(d?.types) && d.types.length ? d.types : TYPES_DE_BASE
  // les types de base restent toujours présents
  const tous = [...types, ...TYPES_DE_BASE.filter((b) => !types.some((t) => t.id === b.id))]
  return {
    types: tous,
    categories: Array.isArray(d?.categories) ? d.categories : CATEGORIES,
    materiels: Array.isArray(d?.materiels) ? d.materiels : MATERIELS,
  }
}

// Nom affiché d'un type de séance (id → nom) ; un type supprimé garde un nom lisible
export function nomType(id, types) {
  const t = (types ?? TYPES_DE_BASE).find((x) => x.id === id)
  if (t) return t.nom
  if (id === 'course') return 'Course'
  if (id === 'force' || !id) return 'Force'
  return 'Séance'
}

export const estCourse = (seance) => seance?.type === 'course'
