// Banque d'exercices (maquette coach de Marie, 13 novembre 2026) : catégories et matériel proposés
// « Renforcement » retiré des valeurs de départ (14 novembre 2026)
export const CATEGORIES = ['Explosivité', 'Gainage', 'Mobilité', 'Cardio']
export const MATERIELS = ['Barre', 'Haltère', 'Kettlebell', 'Poids du corps', 'Machine', 'À préciser']
// du bas du corps vers le haut (Marie, 25 novembre 2026)
export const MUSCLES = ['Mollets', 'Quadriceps', 'Ischio-jambiers', 'Adducteurs', 'Abducteurs', 'Fessiers', 'Lombaires', 'Abdominaux', 'Dos', 'Pectoraux', 'Biceps', 'Triceps', 'Épaules']
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


// Haltères (18 novembre 2026) : la charge notée est celle d'un seul haltère, « par main »
export const chargeParMain = (materiel) => genreMateriel(materiel) === 'haltere'

// Nombre d'haltères (Marie, 26 novembre 2026) : 1 ou 2, choisi sur la fiche de l'exercice ; sinon la liste de Marie
// sert de valeur par défaut (d'après le nom). Les exercices qui ne sont pas aux haltères n'en ont pas (null).
const HALTERES_PAR_DEFAUT = {
  'front squat': 2, 'goblet squat': 1, 'goblet squat sumo': 1, 'split squat bulgare': 2, 'fentes arriere': 2, 'fentes avant': 2,
  'fentes laterales goblet': 1, 'fentes croisees goblet': 1, 'step-up': 2, 'souleve de terre roumain': 2,
  'souleve de terre roumain b-stance': 2, 'souleve de terre roumain unilateral': 2, 'developpe couche': 2, 'developpe incline': 2,
  'developpe couche au sol': 2, 'developpe couche prise neutre': 2, 'developpe epaules': 2, 'developpe epaules prise neutre': 2,
  'rowing buste penche': 2, 'rowing buste penche unilateral': 1, 'rowing incline': 2, 'curl biceps': 2, 'curl biceps marteau': 2,
  'extensions triceps allonge': 2, 'extensions triceps au-dessus de la tete': 1, 'elevations laterales': 2, 'oiseau': 2,
  'extensions mollets debout': 2, 'extensions mollets unilateral': 2, 'extensions mollets assis': 2,
}
const cleNom = (nom) => simplifie(nom).replace(/\s+/g, ' ').trim()
export function nbHalteres(exercice) {
  if (genreMateriel(exercice?.materiel) !== 'haltere') return null
  const choisi = Number(exercice?.halteres)
  if (choisi === 1 || choisi === 2) return choisi
  return HALTERES_PAR_DEFAUT[cleNom(exercice?.nom)] ?? null
}
// « 1 haltère », « 2 haltères », sinon le matériel tel quel
export function libelleMateriel(exercice) {
  const n = nbHalteres(exercice)
  return n ? `${n} haltère${n > 1 ? 's' : ''}` : (exercice?.materiel ?? '')
}
// la charge est « par main » avec deux haltères ; avec un seul, c'est le poids de cet haltère
export const chargeParMainEl = (exercice) => chargeParMain(exercice?.materiel) && nbHalteres(exercice) !== 1
