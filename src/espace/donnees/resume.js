// Chiffres clés (calculs purs) : partagés par « Ma progression » du coaché et le suivi du coach.
import { meilleuresCharges } from './calculs.js'
import { exercicesDe } from './seances.js'

const nombre = (v) => parseFloat(String(v ?? '').replace(',', '.'))

// Plus forte progression de charge sur un exercice (meilleure série de la première à la dernière séance notée).
// Renvoie { nom, ecart, derniere } (ecart > 0 en kg) ou null s'il n'y a pas de progression à montrer.
export function meilleurProgres(programmes, seances) {
  const { exoIdParElement, noms } = exercicesDe(programmes ?? [])
  let meilleur = null
  for (const [exoId, nom] of noms) {
    const points = meilleuresCharges(seances ?? [], exoIdParElement, exoId)
    if (points.length < 2) continue
    const ecart = Math.round((nombre(points[points.length - 1].charge) - nombre(points[0].charge)) * 10) / 10
    if (!(ecart > 0)) continue
    if (!meilleur || ecart > meilleur.ecart) meilleur = { nom, ecart, derniere: nombre(points[points.length - 1].charge) }
  }
  return meilleur
}

// Évolution du poids entre la première et la dernière mesure (kg, arrondi au dixième), ou null.
export function ecartPoids(mesures) {
  const vals = [...(mesures ?? [])]
    .filter((m) => typeof m.poids === 'number')
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  if (vals.length < 2) return null
  return Math.round((vals[vals.length - 1].poids - vals[0].poids) * 10) / 10
}

// Effort moyen des n dernières séances terminées qui ont un effort (arrondi au dixième), ou null.
export function effortMoyen(seances, n = 3) {
  const avec = (seances ?? [])
    .filter((s) => s.statut === 'terminée' && Number.isInteger(s.effort))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, n)
  if (!avec.length) return null
  return Math.round((avec.reduce((t, s) => t + s.effort, 0) / avec.length) * 10) / 10
}

// Nombre à la française : 72,5 ; signe explicite avec `signe`
export function frNombre(v, signe = false) {
  const s = String(Math.abs(v)).replace('.', ',')
  if (!signe) return v < 0 ? `−${s}` : s
  return v > 0 ? `+${s}` : v < 0 ? `−${s}` : s
}
