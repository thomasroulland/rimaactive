// Listes réglables par le coach (14 novembre 2026) : types de séance, catégories et matériels de la banque.
// Elles sont rangées dans le document Firestore `reglages/coach` ; sans ce document, on prend ces valeurs.
import { CATEGORIES, MATERIELS, MUSCLES } from './banque.js'

// Types de séance : liste fixe choisie par Marie (23 novembre 2026, son document « Page outil coaching »).
// « force » (Renforcement) garde son identifiant d'origine. Les anciens types (Contraste, Endurance fondamentale, Série,
// Superset) ne sont plus proposés mais les séances déjà créées avec eux restent lisibles (voir ANCIENS_TYPES).
export const TYPES_DE_BASE = [
  // l'échauffement du coaché (22 novembre 2026) : à part, toujours visible, hors des séances comptées
  { id: 'echauffement', nom: 'Échauffement' },
  { id: 'force', nom: 'Renforcement' },
  { id: 'circuit', nom: 'Circuit' },
  { id: 'liit', nom: 'LIIT (Zone 1-2)' },
  { id: 'liss', nom: 'LISS (Zone 2)' },
  { id: 'tempo', nom: 'Tempo (Zone 3)' },
  { id: 'seuil', nom: 'Seuil (Zone 4)' },
  { id: 'hiit', nom: 'HIIT (Zone 5)' },
  { id: 'sit', nom: 'SIT (Effort maximal)' },
]
const ANCIENS_TYPES = { contraste: 'Contraste', course: 'Endurance fondamentale', serie: 'Série', superset: 'Superset' }

// Formats de bloc proposés selon le type de séance (Marie, 23 novembre 2026). Un ancien type garde tous les formats.
export const FORMATS_PAR_TYPE = {
  force: ['series', 'superset', 'emom'],
  circuit: ['amrap', 'emom', 'tabata'],
  liss: ['continu'],
  tempo: ['continu'],
  echauffement: ['series', 'superset'],
  hiit: ['tabata', 'intervalles', 'emom'],
  sit: ['tabata', 'intervalles', 'emom'],
  seuil: ['intervalles'],
  liit: ['intervalles'],
}
export const TOUS_LES_FORMATS = ['series', 'superset', 'emom', 'amrap', 'tabata', 'hiit', 'continu', 'intervalles']
export const formatsDuType = (type) => FORMATS_PAR_TYPE[type] ?? TOUS_LES_FORMATS

// Parties de la banque (15 novembre 2026) : chaque catégorie est rangée dans une partie (« Échauffement », « Séance »…).
// `rangement` : [{ categorie, partie }] ; une catégorie non rangée va dans sa partie par défaut (voir partieDe).
export const PARTIES = ['Échauffement', 'Séance']

export const REGLAGES_PAR_DEFAUT = { types: TYPES_DE_BASE, categories: CATEGORIES, materiels: MATERIELS, muscles: MUSCLES, parties: PARTIES, rangement: [] }

const rangerMuscles = (liste) => {
  const rang = (m) => { const i = MUSCLES.indexOf(m); return i < 0 ? MUSCLES.length : i }
  return liste.map((m, k) => [m, k]).sort((a, b) => rang(a[0]) - rang(b[0]) || a[1] - b[1]).map(([m]) => m)
}

export function completerReglages(d) {
  return {
    // la liste des types est fixe (18 novembre 2026) : celle enregistrée autrefois dans les réglages n'est plus lue
    types: TYPES_DE_BASE,
    categories: Array.isArray(d?.categories) ? d.categories : CATEGORIES,
    materiels: Array.isArray(d?.materiels) ? d.materiels : MATERIELS,
    // Adducteurs et Abducteurs ajoutés le 25 novembre 2026, aussi dans une liste déjà enregistrée par Marie ;
    // rangés du bas du corps vers le haut, les muscles ajoutés par Marie à la fin
    muscles: Array.isArray(d?.muscles) ? rangerMuscles([...d.muscles, ...['Adducteurs', 'Abducteurs'].filter((m) => !d.muscles.includes(m))]) : MUSCLES,
    parties: Array.isArray(d?.parties) && d.parties.length ? d.parties : PARTIES,
    rangement: Array.isArray(d?.rangement) ? d.rangement.filter((r) => r && typeof r.categorie === 'string' && typeof r.partie === 'string') : [],
  }
}

// Nom affiché d'un type de séance (id → nom) ; un type supprimé garde un nom lisible
export function nomType(id, types) {
  const t = (types ?? TYPES_DE_BASE).find((x) => x.id === id)
  if (t) return t.nom
  if (ANCIENS_TYPES[id]) return ANCIENS_TYPES[id]
  if (id === 'force' || !id) return 'Renforcement'
  return 'Séance'
}

export const estCourse = (seance) => seance?.type === 'course'
export const estEchauffement = (seance) => seance?.type === 'echauffement'

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
