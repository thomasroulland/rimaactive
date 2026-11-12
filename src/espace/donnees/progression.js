// Calculs purs du coaché (avancement, blocs, semaines, mesures). Dates : jours locaux 'AAAA-MM-JJ'.
import { ajoutJours, listeSeances, semaineCourante } from './calculs.js'

const JOURS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const MOIS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

export const CHAMPS_MESURES = ['poids', 'taille', 'hanches', 'poitrine', 'bras', 'cuisse']

export function avancement(programme, faites) {
  const liste = listeSeances(programme)
  const prevues = liste.length
  const nb = liste.filter((x) => faites.has(x.seance.id)).length
  const rang = liste.findIndex((x) => !faites.has(x.seance.id))
  return { faites: nb, prevues, numero: rang === -1 ? prevues : rang + 1 }
}

export function semaineDe(programme, aujourdhui) {
  const n = (programme?.semaines ?? []).length
  return Math.max(1, semaineCourante(programme.debut, aujourdhui, n))
}

function finDe(programme) {
  return ajoutJours(programme.debut, (programme.semaines ?? []).length * 7 - 1)
}

export function blocsDuClient(programmes, aujourdhui) {
  const tries = [...(programmes ?? [])].sort((a, b) => (a.debut < b.debut ? -1 : a.debut > b.debut ? 1 : 0))
  let recent = -1
  tries.forEach((p, i) => { if (p.debut <= aujourdhui) recent = i })
  return tries.map((programme, i) => {
    const fin = finDe(programme)
    let etat = 'passé'
    if (i > recent) etat = 'à venir'
    else if (i === recent && aujourdhui <= fin) etat = 'en cours'
    return { programme, etat, debut: programme.debut, fin, semaine: semaineDe(programme, aujourdhui) }
  })
}

// Programme montré sur le tableau de bord : celui en cours ; sinon le prochain à venir ; sinon le dernier terminé.
export function programmeAffiche(programmes, aujourdhui) {
  const blocs = blocsDuClient(programmes, aujourdhui)
  const choisi = blocs.find((b) => b.etat === 'en cours')
    ?? blocs.find((b) => b.etat === 'à venir')
    ?? blocs[blocs.length - 1]
  return choisi?.programme ?? null
}

export function seancesDeLaSemaine(programme, n, faites) {
  return listeSeances(programme)
    .map((x, i) => ({ ...x, numero: i + 1 }))
    .filter((x) => x.semaine === n)
    .map((x) => ({ seance: x.seance, numero: x.numero, date: x.date, faite: faites.has(x.seance.id) }))
}

export function bonjour(prenom, date) {
  return `Bonjour ${prenom}, nous sommes ${JOURS_FR[date.getDay()]} ${date.getDate()} ${MOIS_FR[date.getMonth()]}.`
}

export const ERREUR_MESURE_VIDE = 'Remplissez au moins une mesure.'
export const ERREUR_MESURE_TEXTE = 'Indiquez des nombres, par exemple 72,5.'

export function nettoyerMesures(saisie) {
  const s = saisie ?? {}
  const mesure = {}
  if (s.date) mesure.date = s.date
  let nb = 0
  for (const champ of CHAMPS_MESURES) {
    const v = s[champ]
    const texte = v == null ? '' : String(v).trim()
    if (texte === '') { mesure[champ] = null; continue }
    if (!/^\d+([.,]\d+)?$/.test(texte)) return { ok: false, erreur: ERREUR_MESURE_TEXTE }
    mesure[champ] = Number(texte.replace(',', '.'))
    nb += 1
  }
  if (nb === 0) return { ok: false, erreur: ERREUR_MESURE_VIDE }
  return { ok: true, mesure }
}

export function initiales(prenom, nom) {
  const l = (t) => (t ?? '').trim().charAt(0).toUpperCase()
  return l(prenom) + l(nom)
}

// « 12 novembre 2026 » (jour local 'AAAA-MM-JJ', jamais via UTC)
export function dateComplete(iso) {
  const [a, m, j] = String(iso || '').split('-').map(Number)
  if (!a || !m || !j) return String(iso || '')
  return `${j} ${MOIS_FR[m - 1]} ${a}`
}

const UNITES = { poids: ' kg', taille: ' cm', hanches: ' cm', poitrine: ' cm', bras: ' cm', cuisse: ' cm' }
const FR = (n) => String(n).replace('.', ',')

// « Depuis le début : poids −2,5 kg · taille −1 cm » ; il faut au moins deux valeurs d'une même mesure.
export function evolutionMesures(mesures) {
  const tri = [...(mesures ?? [])].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  const parties = []
  for (const champ of CHAMPS_MESURES) {
    const vals = tri.map((m) => m[champ]).filter((v) => typeof v === 'number')
    if (vals.length < 2) continue
    const d = Math.round((vals[vals.length - 1] - vals[0]) * 10) / 10
    parties.push(`${champ} ${d > 0 ? '+' : d < 0 ? '\u2212' : ''}${FR(Math.abs(d))}${UNITES[champ]}`)
  }
  return parties.length ? `Depuis le début : ${parties.join(' · ')}` : 'Ajoutez une deuxième mesure pour voir votre évolution.'
}

const JOURS_ABR = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.']
const MOIS_ABR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

// « Jeu. 12 nov. » : date des cartes de « Mes séances » (comme la maquette)
export function dateSeance(iso) {
  const [a, m, j] = String(iso || '').split('-').map(Number)
  if (!a || !m || !j) return ''
  const jour = JOURS_ABR[new Date(Date.UTC(a, m - 1, j)).getUTCDay()]
  return `${jour.charAt(0).toUpperCase()}${jour.slice(1)} ${j} ${MOIS_ABR[m - 1]}`
}

function secondes(temps) {
  if (!temps) return null
  const p = String(temps).split(':').map((x) => parseInt(x, 10))
  if (p.some(Number.isNaN)) return null
  if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2]
  if (p.length === 2) return p[0] * 60 + p[1]
  return null
}

// « 6:00 /km » ; null si la distance ou le temps manque
export function allure(distance, temps) {
  const d = parseFloat(String(distance ?? '').replace(',', '.'))
  const s = secondes(temps)
  if (!d || !s) return null
  const spk = Math.round(s / d)
  const r = spk % 60
  return `${Math.floor(spk / 60)}:${r < 10 ? '0' : ''}${r} /km`
}

// Ligne de bilan d'une séance terminée (maquette) : course « 5 km en 30:00 · 6:00 /km », force « Effort séance 7 · Bien »
export function bilanSeance(type, sf) {
  if (type === 'course') {
    const al = allure(sf.distance, sf.temps)
    const base = (sf.distance ? `${String(sf.distance).replace('.', ',')} km` : '') + (sf.temps ? ` en ${sf.temps}` : '')
    return [base.trim(), al].filter(Boolean).join(' · ')
  }
  return (sf.effort ? `Effort séance ${sf.effort}` : 'Effort séance non noté') + (sf.ressenti ? ` · ${sf.ressenti}` : '')
}
