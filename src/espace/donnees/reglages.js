// Listes réglables par le coach (14 novembre 2026) : types de séance, catégories et matériels de la banque.
// Elles sont rangées dans le document Firestore `reglages/coach` ; sans ce document, on prend ces valeurs.
import { CATEGORIES, MATERIELS, MUSCLES } from './banque.js'

// « force » et « course » existent depuis le début : leurs séances gardent leur fonctionnement
// (blocs d'exercices / distance et temps). Ils se renomment mais ne se suppriment pas.
export const TYPES_DE_BASE = [{ id: 'force', nom: 'Force' }, { id: 'course', nom: 'Course' }]

// Parties de la banque (15 novembre 2026) : chaque catégorie est rangée dans une partie (« Échauffement », « Séance »…).
// `rangement` : [{ categorie, partie }] ; une catégorie non rangée va dans sa partie par défaut (voir partieDe).
export const PARTIES = ['Échauffement', 'Séance']

export const REGLAGES_PAR_DEFAUT = { types: TYPES_DE_BASE, categories: CATEGORIES, materiels: MATERIELS, muscles: MUSCLES, parties: PARTIES, rangement: [] }

export function completerReglages(d) {
  const types = Array.isArray(d?.types) && d.types.length ? d.types : TYPES_DE_BASE
  // les types de base restent toujours présents
  const tous = [...types, ...TYPES_DE_BASE.filter((b) => !types.some((t) => t.id === b.id))]
  return {
    types: tous,
    categories: Array.isArray(d?.categories) ? d.categories : CATEGORIES,
    materiels: Array.isArray(d?.materiels) ? d.materiels : MATERIELS,
    muscles: Array.isArray(d?.muscles) ? d.muscles : MUSCLES,
    parties: Array.isArray(d?.parties) && d.parties.length ? d.parties : PARTIES,
    rangement: Array.isArray(d?.rangement) ? d.rangement.filter((r) => r && typeof r.categorie === 'string' && typeof r.partie === 'string') : [],
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

const simple = (t) => (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

// Partie d'une catégorie : celle choisie par la coach, sinon Mobilité / Activation / Plyométrie / Échauffement → « Échauffement »,
// le reste → « Séance » (ou la dernière partie si « Séance » a été renommée ou supprimée).
export function partieDe(categorie, reglages) {
  const parties = reglages?.parties?.length ? reglages.parties : PARTIES
  const choisie = (reglages?.rangement ?? []).find((r) => r.categorie === categorie)?.partie
  if (choisie && parties.includes(choisie)) return choisie
  if (/mobilit|activation|plyo|echauff/.test(simple(categorie)) && parties.includes('Échauffement')) return 'Échauffement'
  return parties.includes('Séance') ? 'Séance' : parties[parties.length - 1]
}

// Range une catégorie dans une partie (nouveau tableau `rangement`)
export function ranger(rangement, categorie, partie) {
  return [...(rangement ?? []).filter((r) => r.categorie !== categorie), { categorie, partie }]
}

// Une catégorie renommée garde sa partie ; une partie renommée garde ses catégories
export function renommerRangement(rangement, champ, ancien, nouveau) {
  return (rangement ?? []).map((r) => (r[champ] === ancien ? { ...r, [champ]: nouveau } : r))
}
