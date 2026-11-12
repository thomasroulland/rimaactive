// Calculs purs des écrans du client : contenu des séances faites, textes de dates et de prescriptions.
// Les dates sont des jours locaux 'AAAA-MM-JJ' : on lit leurs composantes, jamais via le fuseau de la machine.

const JOURS_LONGS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const MOIS_LONGS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

function composantes(iso) {
  const [a, m, j] = String(iso || '').split('-').map(Number)
  if (!a || !m || !j) return null
  return { a, m, j, js: new Date(Date.UTC(a, m - 1, j)).getUTCDay() }
}

// 'lundi 16 novembre'
export function dateLongue(iso) {
  const d = composantes(iso)
  return d ? `${JOURS_LONGS[d.js]} ${d.j} ${MOIS_LONGS[d.m - 1]}` : ''
}

// '16 nov.'
export function dateCourte(iso) {
  const d = composantes(iso)
  return d ? `${d.j} ${MOIS_COURTS[d.m - 1]}` : ''
}

// Nombre écrit à la française : 62.5 → '62,5'
export function fr(v) {
  return String(v ?? '').replace('.', ',')
}

// 'Séries classiques', 'EMOM 12 min', 'TABATA 4 min, repos 10 s'
export function resumeFormat(bloc) {
  const f = bloc?.format
  if (f === 'emom' || f === 'amrap') return bloc.duree ? `${f.toUpperCase()} ${bloc.duree} min` : f.toUpperCase()
  if (f === 'tabata' || f === 'hiit') {
    const d = [bloc.duree && `${bloc.duree} min`, bloc.repos && `repos ${bloc.repos} s`].filter(Boolean).join(', ')
    return `${f.toUpperCase()}${d ? ` ${d}` : ''}`
  }
  return 'Séries classiques'
}

// Ce que Marie a prévu pour un élément : '3 × 8 · 40 kg · RPE 7 · repos 90 s'
export function prescription(element, enSeries = true) {
  const e = element ?? {}
  const parties = []
  if (enSeries && e.series && e.reps) parties.push(`${e.series} × ${e.reps}`)
  else if (enSeries && e.series) parties.push(`${e.series} séries`)
  else if (e.reps) parties.push(fr(e.reps))
  if (e.charge) parties.push(`${fr(e.charge)} kg`)
  if (e.pct) parties.push(`${fr(e.pct)} % de 1RM`)
  if (enSeries && e.rpe) parties.push(`RPE ${fr(e.rpe)}`)
  if (enSeries && e.repos) parties.push(`repos ${e.repos}`)
  if (enSeries && e.tempo) parties.push(`tempo ${e.tempo}`)
  return parties.join(' · ')
}

const texte = (v) => (v == null ? '' : String(v))

// Lignes de séries propres à enregistrer (jamais de valeur undefined pour Firestore)
function seriesPropres(series) {
  const out = {}
  for (const [id, lignes] of Object.entries(series ?? {})) {
    out[id] = (lignes ?? []).map((l) => ({ charge: texte(l.charge), reps: texte(l.reps), rpe: texte(l.rpe) }))
  }
  return out
}

// Contenu écrit (fusion) pendant la séance : statut « en cours ».
// `base` = { client, programme, seance, date, majLe } ; `donnees` = { series: { [elementId]: lignes } }
export function contenuNotes(base, donnees = {}) {
  const out = { client: base.client, programme: base.programme, seance: base.seance, date: base.date, statut: 'en cours', majLe: base.majLe }
  if (donnees.series) out.series = seriesPropres(donnees.series)
  return out
}

// Contenu écrit (fusion) à la « Fin de séance » : statut « terminée », bilan du client, séries éventuelles.
export function contenuFin(base, fin = {}) {
  const douleur = fin.douleur ?? {}
  const out = {
    client: base.client,
    programme: base.programme,
    seance: base.seance,
    date: base.date,
    statut: 'terminée',
    effort: Number.isInteger(fin.effort) ? fin.effort : null,
    ressenti: texte(fin.ressenti),
    douleur: douleur.oui
      ? { oui: true, endroit: texte(douleur.endroit).trim(), note: texte(douleur.note).trim() }
      : { oui: false, endroit: '', note: '' },
    distance: texte(fin.distance).trim(),
    temps: texte(fin.temps).trim(),
    majLe: base.majLe,
  }
  if (fin.series) out.series = seriesPropres(fin.series)
  return out
}

// Texte d'évolution d'une courbe de charges (maquette validée par Marie)
export function evolutionCharges(points) {
  if (points.length < 2) return 'Une seule séance notée sur la période'
  const n = (v) => parseFloat(String(v).replace(',', '.'))
  const ecart = Math.round((n(points[points.length - 1].charge) - n(points[0].charge)) * 10) / 10
  if (ecart > 0) return `+${fr(ecart)} kg sur la période`
  if (ecart < 0) return 'Plus léger qu’en début de période'
  return 'Charge stable sur la période'
}

// Statut affiché d'une séance du programme : 'Faite', 'En cours' (séries déjà notées) ou 'À faire'
export function statutSeance(seancesFaites, programmeId, seanceId) {
  const sf = (seancesFaites ?? []).find((s) => s.programme === programmeId && s.seance === seanceId)
  if (!sf) return 'À faire'
  return sf.statut === 'terminée' ? 'Faite' : 'En cours'
}
