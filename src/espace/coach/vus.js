// Dernière visite de Marie sur le suivi de chaque coaché, retenue sur cet appareil (13 novembre 2026).
// Sert aux repères « Nouveau » : séances faites depuis cette visite. Rien n'est envoyé au serveur.
const cle = (uid) => `rima-vu-${uid}`

export function derniereVisite(uid) {
  try { return window.localStorage.getItem(cle(uid)) } catch { return null }
}
export function noterVisite(uid, quand = new Date()) {
  try { window.localStorage.setItem(cle(uid), quand.toISOString()) } catch { /* stockage indisponible : pas de repères */ }
  window.dispatchEvent(new Event('rima-vu')) // la liste et la pastille se mettent à jour
}
// Instant d'une séance faite (horodatage du serveur), en millisecondes ; sinon sa date à midi
export function instantSeance(sf) {
  const t = sf?.majLe?.toMillis?.()
  if (typeof t === 'number') return t
  return sf?.date ? new Date(`${sf.date}T12:00:00`).getTime() : 0
}
// Séances terminées depuis la dernière visite (toutes, si Marie n'a jamais ouvert ce suivi sur cet appareil)
export function nouvellesSeances(seances, vu) {
  const depuis = vu ? new Date(vu).getTime() : 0
  return (seances ?? []).filter((s) => s.statut === 'terminée' && instantSeance(s) > depuis)
}
