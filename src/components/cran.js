// Avance « à crans » pour les roues qui tournent au défilement : la roue marque une pause
// sur chaque élément, puis tourne jusqu'au suivant. `pause` est la part du cran où elle reste immobile.
export function cran(p, pause) {
  const i = Math.floor(p)
  const f = p - i
  const t = Math.min(1, Math.max(0, (f - pause / 2) / (1 - pause)))
  return i + t * t * (3 - 2 * t)
}
