// Records personnels (14 novembre 2026) : pour chaque exercice (identifiant de la banque), la plus lourde charge
// d'une série faite (avec au moins 1 répétition). À charge égale, le plus de répétitions l'emporte.
// Exercices sans charge (poids du corps) : pas de record, pour ne pas fêter un simple « 0 kg ».
function nombre(v) {
  if (v === '' || v == null) return NaN
  return parseFloat(String(v).replace(',', '.'))
}

const meilleur = (a, b) => !a || b.charge > a.charge || (b.charge === a.charge && b.reps > a.reps)

// Meilleure série de chaque exercice dans une séance faite : Map(exoId → { charge, reps })
function meilleuresSeries(sf, exoIdParElement) {
  const m = new Map()
  for (const [elementId, lignes] of Object.entries(sf?.series ?? {})) {
    const exoId = exoIdParElement.get(elementId)
    if (!exoId) continue
    for (const l of lignes ?? []) {
      if (!l || l.fait === false) continue
      const charge = nombre(l.charge); const reps = nombre(l.reps)
      if (!(charge > 0) || !(reps > 0)) continue
      const s = { charge, reps }
      if (meilleur(m.get(exoId), s)) m.set(exoId, s)
    }
  }
  return m
}

const avant = (a, b) => (a.date ?? '') < (b.date ?? '') || ((a.date ?? '') === (b.date ?? '') && (a.id ?? '') < (b.id ?? ''))

// Tous les records : [{ exoId, nom, charge, reps, date }] triés par nom.
export function records(seancesFaites, exoIdParElement, noms) {
  const best = new Map()
  const terminees = (seancesFaites ?? []).filter((sf) => sf.statut === 'terminée').sort((a, b) => (avant(a, b) ? -1 : 1))
  for (const sf of terminees) {
    for (const [exoId, s] of meilleuresSeries(sf, exoIdParElement)) {
      if (meilleur(best.get(exoId), s)) best.set(exoId, { ...s, date: sf.date })
    }
  }
  return [...best.entries()]
    .map(([exoId, r]) => ({ exoId, nom: noms.get(exoId) ?? 'Exercice', ...r }))
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
}

// Records battus pendant cette séance, par rapport aux séances terminées avant elle (la première fois ne compte pas) :
// [{ exoId, nom, charge, reps, ancien: { charge, reps } }]
export function nouveauxRecords(sf, seancesFaites, exoIdParElement, noms) {
  if (!sf) return []
  const precedentes = (seancesFaites ?? []).filter((x) => x.statut === 'terminée' && x.id !== sf.id && avant(x, sf))
  const anciens = new Map(records(precedentes, exoIdParElement, noms).map((r) => [r.exoId, r]))
  const liste = []
  for (const [exoId, s] of meilleuresSeries(sf, exoIdParElement)) {
    const ancien = anciens.get(exoId)
    if (ancien && s.charge > ancien.charge) liste.push({ exoId, nom: noms.get(exoId) ?? 'Exercice', ...s, ancien: { charge: ancien.charge, reps: ancien.reps } })
  }
  return liste.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
}
