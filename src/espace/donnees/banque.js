// Banque d'exercices (maquette coach de Marie, 13 novembre 2026) : catégories et matériel proposés
// « Renforcement » retiré des valeurs de départ (14 novembre 2026)
export const CATEGORIES = ['Explosivité', 'Gainage', 'Mobilité', 'Cardio']
export const MATERIELS = ['Barre', 'Haltère', 'Kettlebell', 'Poids du corps', 'Machine', 'À préciser']
export const MUSCLES = ['Quadriceps', 'Ischio-jambiers', 'Fessiers', 'Mollets', 'Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps', 'Abdominaux', 'Lombaires']
// Façons de faire un même exercice (14 novembre 2026) : cochées sur la fiche, choisies dans la séance
export const LATERALITES = [['bilateral', 'Bilatéral'], ['unilateral', 'Unilatéral'], ['bstance', 'B-stance']]
export const nomLateralite = (id) => LATERALITES.find(([k]) => k === id)?.[1] ?? ''

// 1RM suivis sur la fiche du coaché
export const RM_SUIVIS = ['Squat', 'Soulevé de terre', 'Développé couché', 'Développé militaire']

const simple = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
const nombre = (v) => { const n = parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : null }

// Charge indicative d'après le % du 1RM : seulement si le nom de l'exercice commence par un 1RM suivi
// (« Squat », « Développé couché barre »…). Arrondie à 2,5 kg. Renvoie null sinon.
export function chargeIndicative(nom, pct, rm) {
  const p = nombre(pct)
  if (!p || p <= 0 || !rm) return null
  const n = simple(nom)
  const cle = RM_SUIVIS.find((k) => n === simple(k) || n.startsWith(`${simple(k)} `))
  const max = cle ? nombre(rm[cle]) : null
  if (!max) return null
  return Math.round((max * p) / 100 / 2.5) * 2.5
}

// Genre du matériel pour son pictogramme (14 novembre 2026) : barre, haltère, kettlebell / KB, poids du corps,
// machine / poulie, élastique ; « autre » sinon ; null pour « À préciser » ou vide.
const simplifie = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export function genreMateriel(materiel) {
  const m = simplifie(materiel)
  if (!m || m.includes('preciser')) return null
  if (m.includes('landmine')) return 'landmine'
  if (m.includes('kettle') || /\bkb\b/.test(m)) return 'kettlebell'
  if (m.includes('halt')) return 'haltere'
  if (m.includes('barre') || m.includes('barbell')) return 'barre'
  if (m.includes('corps') || m.includes('pdc')) return 'corps'
  if (m.includes('poulie') || m.includes('cable')) return 'poulie'
  if (m.includes('machine')) return 'machine'
  if (m.includes('elast') || m.includes('bande')) return 'elastique'
  return 'autre'
}

