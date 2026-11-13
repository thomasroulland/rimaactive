// Suivi des coachés côté coach (maquette PDF de Marie, 13 novembre 2026) : semaine en cours, avancement,
// état de chaque semaine, dernière visio et points à regarder. Calculs purs ; dates 'AAAA-MM-JJ'.
import { ecartJours, listeSeances, semaineCourante } from './calculs.js'

export const SEUIL_SANS_SEANCE = 10 // jours sans séance avant une alerte
export const SEUIL_VISIO = 14 // jours depuis la dernière visio avant une alerte
const nombre = (v) => parseFloat(String(v ?? '').replace(',', '.'))

// programme : le programme en cours (document complet) ou null ; seances : les séances terminées du coaché ;
// visio : { date, semaine } ou null.
// `actif` : coaché au compte activé et pas en pause (sans programme, c'est un point à regarder)
export function suiviCoache({ programme, seances, visio, aujourdhui, actif = false }) {
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
  if (!programme && actif) alertes.unshift('Pas de programme en cours')
  return { resume, alertes }
}

// Chiffres de la vue d'ensemble (maquette coach) : séances faites, régularité des semaines passées, RPE moyen des séries
export function chiffresCoache({ programme, seances, aujourdhui }) {
  const terminees = (seances ?? []).filter((s) => s.statut === 'terminée')
  const liste = programme ? listeSeances(programme) : []
  const faites = new Set(terminees.filter((s) => programme && s.programme === programme.id).map((s) => s.seance))
  const passees = liste.filter((x) => x.date < aujourdhui)
  const regularite = passees.length ? Math.round((passees.filter((x) => faites.has(x.seance.id)).length / passees.length) * 100) : null
  const rpes = terminees.flatMap((s) => Object.values(s.series ?? {}).flat())
    .filter((l) => l && l.fait !== false).map((l) => nombre(l.rpe)).filter((v) => !Number.isNaN(v))
  const rpeMoyen = rpes.length ? Math.round((rpes.reduce((t, v) => t + v, 0) / rpes.length) * 10) / 10 : null
  return { faites: liste.filter((x) => faites.has(x.seance.id)).length, prevues: liste.length, regularite, rpeMoyen }
}

// RPE visé (programme) et effort ressenti moyen (fin de séance), semaine par semaine
export function effortParSemaine(programme, seances) {
  const terminees = (seances ?? []).filter((s) => s.statut === 'terminée' && programme && s.programme === programme.id)
  return (programme?.semaines ?? []).map((sem, i) => {
    const ids = new Set((sem.seances ?? []).map((s) => s.id))
    const efforts = terminees.filter((s) => ids.has(s.seance) && Number.isInteger(s.effort)).map((s) => s.effort)
    const vise = nombre(sem.rpe)
    const ressenti = efforts.length ? Math.round((efforts.reduce((t, e) => t + e, 0) / efforts.length) * 10) / 10 : null
    const ecart = Number.isNaN(vise) || ressenti === null ? null : Math.round((ressenti - vise) * 10) / 10
    return { semaine: i + 1, vise: Number.isNaN(vise) ? null : vise, ressenti, ecart }
  })
}
