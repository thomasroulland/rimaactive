// Les 3 chiffres en haut de « Ma progression », choisis par Marie pour chaque coaché (26 novembre 2026).
// Rangés sur la fiche du coaché : `chiffresProgression` = 3 clés, la première en grand.
// Clés : 'seances', 'progres' (meilleur progrès) ou 'progres:<exoId>' (un exercice choisi), 'poids', 'taille',
// 'semaines', 'distance', 'temps', 'effort'.
import { meilleuresCharges, regularite } from './calculs.js'
import { avancement } from './progression.js'
import { exercicesDe, secondes } from './seances.js'
import { effortMoyen, frNombre, meilleurProgres } from './resume.js'

export const CHIFFRES = [
  ['seances', 'Séances faites'],
  ['progres', 'Progrès de charge'],
  ['poids', 'Poids'],
  ['taille', 'Tour de taille'],
  ['semaines', 'Semaines complètes'],
  ['distance', 'Distance parcourue'],
  ['temps', 'Temps d’entraînement'],
  ['effort', 'Effort moyen'],
]
export const CHIFFRES_PAR_DEFAUT = ['seances', 'progres', 'poids']

const cleValide = (c) => typeof c === 'string' && (CHIFFRES.some(([k]) => k === c) || /^progres:[\w-]{1,80}$/.test(c))

// Les 3 clés du coaché (celles par défaut si rien n'est choisi ou si la valeur est abîmée)
export function chiffresChoisis(profil) {
  const l = profil?.chiffresProgression
  return Array.isArray(l) && l.length === 3 && l.every(cleValide) ? l : CHIFFRES_PAR_DEFAUT
}

const nombre = (v) => parseFloat(String(v ?? '').replace(',', '.'))
const arrondi = (v) => Math.round(v * 10) / 10

// écart entre la première et la dernière mesure d'un champ, ou null
function ecartMesure(mesures, champ) {
  const vals = [...(mesures ?? [])].filter((m) => typeof m[champ] === 'number').sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  return vals.length < 2 ? null : arrondi(vals[vals.length - 1][champ] - vals[0][champ])
}

const heures = (min) => (min < 60 ? `${min} min` : `${Math.floor(min / 60)} h${min % 60 ? ` ${String(min % 60).padStart(2, '0')}` : ''}`)

// Valeur d'un chiffre : { valeur, unite, libelle, barre? } ; valeur '—' et un libellé d'attente s'il manque des données.
// ctx : { programme, programmes, faites (Set), seances, mesures }
export function valeurChiffre(cle, { programme, programmes, faites, seances, mesures }) {
  const terminees = (seances ?? []).filter((s) => s.statut === 'terminée')
  const vide = (libelle) => ({ valeur: '—', unite: '', libelle })
  if (cle === 'seances') {
    const av = programme ? avancement(programme, faites ?? new Set()) : null
    if (!av) return { valeur: String(terminees.length), unite: '', libelle: terminees.length > 1 ? 'séances faites' : 'séance faite' }
    return { valeur: String(av.faites), unite: `/ ${av.prevues}`, libelle: av.faites > 1 ? 'séances faites' : 'séance faite', barre: av.prevues ? av.faites / av.prevues : 0 }
  }
  if (cle === 'progres') {
    const p = meilleurProgres(programmes, seances)
    return p ? { valeur: frNombre(p.ecart, true), unite: 'kg', libelle: `au ${p.nom.toLowerCase()}` } : vide('vos progrès de charge')
  }
  if (cle.startsWith('progres:')) {
    const exoId = cle.slice(8)
    const { exoIdParElement, noms } = exercicesDe(programmes ?? [])
    const nom = noms.get(exoId)
    if (!nom) return vide('progrès de charge')
    const points = meilleuresCharges(seances ?? [], exoIdParElement, exoId)
    if (points.length < 2) return vide(`au ${nom.toLowerCase()}`)
    return { valeur: frNombre(arrondi(nombre(points[points.length - 1].charge) - nombre(points[0].charge)), true), unite: 'kg', libelle: `au ${nom.toLowerCase()}` }
  }
  if (cle === 'poids' || cle === 'taille') {
    const e = ecartMesure(mesures, cle)
    if (e === null) return vide(cle === 'poids' ? 'ajoutez deux pesées' : 'tour de taille : deux mesures')
    return { valeur: frNombre(e, true), unite: cle === 'poids' ? 'kg' : 'cm', libelle: cle === 'poids' ? 'de poids' : 'de tour de taille' }
  }
  if (cle === 'semaines') {
    if (!programme) return vide('semaines complètes')
    const n = regularite(programme, faites ?? new Set()).filter((s) => s.prevues > 0 && s.faites >= s.prevues).length
    return { valeur: String(n), unite: `/ ${(programme.semaines ?? []).length}`, libelle: n > 1 ? 'semaines complètes' : 'semaine complète' }
  }
  if (cle === 'distance') {
    const km = arrondi(terminees.reduce((t, s) => t + (nombre(s.distance) > 0 ? nombre(s.distance) : 0), 0))
    return km > 0 ? { valeur: frNombre(km), unite: 'km', libelle: 'parcourus' } : vide('km parcourus')
  }
  if (cle === 'temps') {
    const min = terminees.reduce((t, s) => t + (Number.isInteger(s.duree) ? s.duree : Math.round((secondes(s.temps) ?? 0) / 60)), 0)
    return min > 0 ? { valeur: heures(min), unite: '', libelle: 'd’entraînement' } : vide('temps d’entraînement')
  }
  if (cle === 'effort') {
    const e = effortMoyen(seances, 5)
    return e !== null ? { valeur: frNombre(e), unite: '/ 10', libelle: 'effort moyen' } : vide('effort moyen')
  }
  return vide('')
}
