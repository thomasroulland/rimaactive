// Calculs purs de l'espace client. Les dates sont des jours locaux 'AAAA-MM-JJ' :
// on calcule sur les composantes de la chaîne (Date.UTC), jamais via le fuseau de la machine.

export const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

const MS_JOUR = 86400000

function versJour(iso) {
  const [a, m, j] = iso.split('-').map(Number)
  return Date.UTC(a, m - 1, j) / MS_JOUR
}

function depuisJour(n) {
  const d = new Date(n * MS_JOUR)
  const p = (x) => String(x).padStart(2, '0')
  return `${String(d.getUTCFullYear()).padStart(4, '0')}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`
}

export function ajoutJours(iso, n) {
  return depuisJour(versJour(iso) + n)
}

export function ecartJours(a, b) {
  return versJour(b) - versJour(a)
}

export function semaineCourante(debut, aujourdhui, nbSemaines) {
  const ecart = ecartJours(debut, aujourdhui)
  if (ecart < 0) return 0
  return Math.min(Math.floor(ecart / 7) + 1, nbSemaines)
}

export function listeSeances(programme) {
  const out = []
  ;(programme?.semaines ?? []).forEach((sem, i) => {
    for (const seance of sem.seances ?? []) {
      // plus de jour : la séance est datée du début de sa semaine (le lundi), `fin` = dernier jour de la semaine
      out.push({ semaine: i + 1, seance, date: ajoutJours(programme.debut, i * 7), fin: ajoutJours(programme.debut, i * 7 + 6) })
    }
  })
  return out
}

export function etatAccueil(programme, faites, aujourdhui) {
  if (!programme) return { type: 'aucun' }
  if (aujourdhui < programme.debut) return { type: 'bientot', debut: programme.debut }
  const liste = listeSeances(programme)
  if (liste.length === 0) return { type: 'aucun' }
  const suivante = liste.find((x) => !faites.has(x.seance.id))
  if (!suivante) return { type: 'termine' }
  return { type: 'prochaine', semaine: suivante.semaine, seance: suivante.seance, date: suivante.date }
}

export function preRemplir(element) {
  const n = parseInt(element.series, 10)
  const nb = n > 0 ? n : 1
  return Array.from({ length: nb }, () => ({
    charge: element.charge ? String(element.charge) : '',
    reps: element.reps ? String(element.reps) : '',
    rpe: '',
  }))
}

function elementsDe(seance) {
  return (seance.blocs ?? []).flatMap((b) => b.elements ?? [])
}

export function fusionnerNotes(seance, series) {
  const notes = series ?? {}
  const elements = elementsDe(seance)
  const connus = new Set(elements.map((e) => e.id))
  const out = elements.map((element) => ({
    element,
    lignes: notes[element.id] ?? preRemplir(element),
  }))
  for (const id of Object.keys(notes)) {
    if (!connus.has(id)) out.push({ element: null, lignes: notes[id] })
  }
  return out
}

function nombre(v) {
  if (v === '' || v == null) return NaN
  return parseFloat(String(v).replace(',', '.'))
}

export function meilleuresCharges(seancesFaites, exoIdParElement, exoId) {
  const out = []
  for (const sf of seancesFaites) {
    if (sf.statut !== 'terminée') continue
    let meilleure = null
    let max = -Infinity
    for (const [elementId, lignes] of Object.entries(sf.series ?? {})) {
      if (exoIdParElement.get(elementId) !== exoId) continue
      for (const l of lignes) {
        if (l.fait === false) continue // série non cochée « Fait » (sans le champ : comptée comme faite)
        const c = nombre(l.charge)
        if (Number.isNaN(c)) continue
        if (c > max) { max = c; meilleure = l }
      }
    }
    if (meilleure) out.push({ date: sf.date, charge: meilleure.charge, reps: meilleure.reps })
  }
  return out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}

export function regularite(programme, faites) {
  return (programme?.semaines ?? []).map((sem, i) => ({
    semaine: i + 1,
    prevues: (sem.seances ?? []).length,
    faites: (sem.seances ?? []).filter((s) => faites.has(s.id)).length,
  }))
}

// Date du jour en jour local 'AAAA-MM-JJ' (jamais via UTC)
export function aujourdhuiIso(date = new Date()) {
  const p = (x) => String(x).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
}

// Lundi de la semaine d'un jour 'AAAA-MM-JJ'
export function lundiDe(iso) {
  const n = versJour(iso)
  const jourSemaine = (new Date(n * MS_JOUR).getUTCDay() + 6) % 7 // 0 = lundi
  return depuisJour(n - jourSemaine)
}

// « lundi 16 novembre 2026 »
export function dateLongue(iso) {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(versJour(iso) * MS_JOUR))
}

// Tonnage (14 novembre 2026) : somme charge × répétitions des séries faites (une série sans charge ou sans
// répétitions chiffrées ne compte pas). `filtre(elementId)` : ne garder que certains éléments.
export function tonnage(sf, filtre = () => true) {
  let total = 0
  for (const [elementId, lignes] of Object.entries(sf?.series ?? {})) {
    if (!filtre(elementId)) continue
    for (const l of lignes ?? []) {
      if (!l || l.fait === false) continue
      const c = nombre(l.charge); const r = nombre(l.reps)
      if (Number.isNaN(c) || Number.isNaN(r) || c <= 0 || r <= 0) continue
      total += c * r
    }
  }
  return Math.round(total * 10) / 10
}

// Tonnage de chaque séance terminée (toutes, ou pour un exercice), par date croissante ; les séances à 0 sont omises
export function tonnages(seancesFaites, exoIdParElement = null, exoId = null) {
  const filtre = exoId ? (el) => exoIdParElement.get(el) === exoId : () => true
  return (seancesFaites ?? [])
    .filter((sf) => sf.statut === 'terminée')
    .map((sf) => ({ date: sf.date, charge: tonnage(sf, filtre) }))
    .filter((p) => p.charge > 0)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}

// Calendrier d'un mois (14 novembre 2026) : semaines du lundi au dimanche qui couvrent le mois.
// mois : 1 à 12. Renvoie [[{ date: 'AAAA-MM-JJ', dansLeMois }, … 7], …].
export function grilleMois(annee, mois) {
  const p = (x) => String(x).padStart(2, '0')
  const premier = `${annee}-${p(mois)}-01`
  const debut = lundiDe(premier)
  const dernierJour = new Date(Date.UTC(annee, mois, 0)).getUTCDate()
  const fin = `${annee}-${p(mois)}-${p(dernierJour)}`
  const semaines = []
  for (let d = debut; d <= fin; d = ajoutJours(d, 7)) {
    semaines.push(Array.from({ length: 7 }, (_, i) => {
      const date = ajoutJours(d, i)
      return { date, dansLeMois: date.slice(0, 7) === premier.slice(0, 7) }
    }))
  }
  return semaines
}
