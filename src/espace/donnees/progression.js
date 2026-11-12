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

export function seancesDeLaSemaine(programme, n, faites) {
  return listeSeances(programme)
    .map((x, i) => ({ ...x, numero: i + 1 }))
    .filter((x) => x.semaine === n)
    .map((x) => ({ seance: x.seance, numero: x.numero, date: x.date, faite: faites.has(x.seance.id) }))
}

export function bonjour(prenom, date) {
  return `Bonjour ${prenom}, nous sommes ${JOURS_FR[date.getDay()]} ${date.getDate()} ${MOIS_FR[date.getMonth()]}.`
}

export const ERREUR_MESURE_VIDE = 'Indiquez au moins une mesure.'
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
