// Listes réglables par le coach (14 novembre 2026) : types de séance, catégories et matériels de la banque.
// Elles sont rangées dans le document Firestore `reglages/coach` ; sans ce document, on prend ces valeurs.
import { CATEGORIES, MATERIELS, MUSCLES } from './banque.js'

// Types de séance : liste fixe choisie par Marie (18 novembre 2026), plus réglable.
// « force » (Renforcement) et « course » (Endurance fondamentale) gardent leurs identifiants d'origine :
// les séances déjà faites restent lisibles, et « course » garde son fonctionnement (distance, temps, consigne).
export const TYPES_DE_BASE = [
  { id: 'force', nom: 'Renforcement' },
  { id: 'contraste', nom: 'Contraste' },
  { id: 'course', nom: 'Endurance fondamentale' },
  { id: 'hiit', nom: 'HIIT' },
  { id: 'liit', nom: 'LIIT' },
  { id: 'serie', nom: 'Série' },
  { id: 'superset', nom: 'Superset' },
]

// Parties de la banque (15 novembre 2026) : chaque catégorie est rangée dans une partie (« Échauffement », « Séance »…).
// `rangement` : [{ categorie, partie }] ; une catégorie non rangée va dans sa partie par défaut (voir partieDe).
export const PARTIES = ['Échauffement', 'Séance']

export const REGLAGES_PAR_DEFAUT = { types: TYPES_DE_BASE, categories: CATEGORIES, materiels: MATERIELS, muscles: MUSCLES, parties: PARTIES, rangement: [] }

export function completerReglages(d) {
  return {
    // la liste des types est fixe (18 novembre 2026) : celle enregistrée autrefois dans les réglages n'est plus lue
    types: TYPES_DE_BASE,
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
  if (id === 'course') return 'Endurance fondamentale'
  if (id === 'force' || !id) return 'Renforcement'
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
