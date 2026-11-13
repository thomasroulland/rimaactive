// Suivi des coachés côté coach (maquette PDF de Marie, 13 novembre 2026) : semaine en cours, avancement,
// état de chaque semaine, dernière visio et points à regarder. Calculs purs ; dates 'AAAA-MM-JJ'.
import { ecartJours, listeSeances, semaineCourante } from './calculs.js'

export const SEUIL_SANS_SEANCE = 10 // jours sans séance avant une alerte
export const SEUIL_VISIO = 14 // jours depuis la dernière visio avant une alerte
const nombre = (v) => parseFloat(String(v ?? '').replace(',', '.'))

// programme : le programme en cours (document complet) ou null ; seances : les séances terminées du coaché ;
// visio : { date, semaine } ou null.
export function suiviCoache({ programme, seances, visio, aujourdhui }) {
  const terminees = (seances ?? []).filter((s) => s.statut === 'terminée')
  const alertes = []
  let resume = null

  if (programme) {
    const nb = (programme.semaines ?? []).length
    const semaine = semaineCourante(programme.debut, aujourdhui, nb)
    const liste = listeSeances(programme)
    const faites = new Set(terminees.filter((s) => s.programme === programme.id).map((s) => s.seance))
    const prevuesPassees = liste.filter((x) => x.date < aujourdhui && !faites.has(x.seance.id))
    const semaines = (programme.semaines ?? []).map((sem, i) => {
      const ids = (sem.seances ?? []).map((s) => s.id)
      const complete = ids.length > 0 && ids.every((id) => faites.has(id))
      return complete ? 'faite' : i + 1 <= semaine ? 'passee' : 'avenir'
    })
    resume = { semaine, nbSemaines: nb, faites: liste.filter((x) => faites.has(x.seance.id)).length, prevues: liste.length, semaines }

    // effort ressenti au-dessus du RPE visé de la semaine (la plus récente concernée)
    for (let i = Math.min(semaine, nb) - 1; i >= 0; i--) {
      const vise = nombre(programme.semaines[i].rpe)
      if (Number.isNaN(vise)) continue
      const ids = new Set((programme.semaines[i].seances ?? []).map((s) => s.id))
      const efforts = terminees.filter((s) => s.programme === programme.id && ids.has(s.seance) && Number.isInteger(s.effort)).map((s) => s.effort)
      if (!efforts.length) continue
      const moyenne = efforts.reduce((t, e) => t + e, 0) / efforts.length
      if (moyenne > vise) { alertes.push(`Effort ressenti au-dessus du prévu en S${i + 1}`); break }
    }

    // aucune séance depuis longtemps (seulement si le programme a commencé)
    if (semaine > 0) {
      const derniere = terminees.map((s) => s.date).filter(Boolean).sort().pop()
      const depuis = ecartJours(derniere && derniere > programme.debut ? derniere : programme.debut, aujourdhui)
      if (depuis >= SEUIL_SANS_SEANCE) alertes.push(`Aucune séance depuis ${depuis} jours`)
    }
    if (prevuesPassees.length > 0) {
      alertes.push(`${prevuesPassees.length} séance${prevuesPassees.length > 1 ? 's' : ''} prévue${prevuesPassees.length > 1 ? 's' : ''} non faite${prevuesPassees.length > 1 ? 's' : ''}`)
    }
  }

  if (visio?.date) {
    const depuis = ecartJours(visio.date, aujourdhui)
    if (programme && depuis > SEUIL_VISIO) alertes.push(`Dernière visio il y a ${depuis} jours`)
  }
  return { resume, alertes }
}
