// Banque d'exercices (maquette coach de Marie, 13 novembre 2026) : catégories et matériel proposés
export const CATEGORIES = ['Renforcement', 'Explosivité', 'Gainage', 'Mobilité', 'Cardio']
export const MATERIELS = ['Barre', 'Haltère', 'Kettlebell', 'Poids du corps', 'Machine', 'À préciser']

// 1RM suivis sur la fiche du coaché
export const RM_SUIVIS = ['Squat', 'Soulevé de terre', 'Développé couché', 'Développé militaire']

const simple = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
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
