import { fusionnerNotes } from './calculs.js'
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
  // TABATA / HIIT (maquette de Marie) : « TABATA 8 × 20 s / 10 s » = tours × travail / repos
  if (f === 'tabata' || f === 'hiit') {
    const effort = bloc.travail ? `${bloc.travail} s` : ''
    const cycle = [bloc.tours && effort ? `${bloc.tours} × ${effort}` : effort, bloc.repos && `${bloc.repos} s`].filter(Boolean).join(' / ')
    return `${f.toUpperCase()}${cycle ? ` ${cycle}` : ''}`
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

// Ressentis proposés à la fin de séance (maquette de Marie)
export const RESSENTIS = ['Très bien', 'Bien', 'Moyen', 'Difficile']

const texte = (v) => (v == null ? '' : String(v))

// Lignes de séries propres à enregistrer (jamais de valeur undefined pour Firestore)
function seriesPropres(series) {
  const out = {}
  for (const [id, lignes] of Object.entries(series ?? {})) {
    out[id] = (lignes ?? []).map((l) => ({ charge: texte(l.charge), reps: texte(l.reps), rpe: texte(l.rpe), fait: l.fait !== false }))
  }
  return out
}

// Notes par exercice : { [elementId]: texte } ; résultats par bloc : { [blocId]: { resultat, rpe, fait, note } }
function notesPropres(notes) {
  const out = {}
  for (const [id, t] of Object.entries(notes ?? {})) out[id] = texte(t)
  return out
}
function blocsPropres(blocs) {
  const out = {}
  for (const [id, b] of Object.entries(blocs ?? {})) {
    out[id] = { resultat: texte(b?.resultat), rpe: texte(b?.rpe), fait: b?.fait === true, note: texte(b?.note) }
  }
  return out
}

// Une carte `series`, `notes` ou `blocs` vide n'est jamais envoyée : avec { merge: true }, Firestore remplacerait tout le champ
// et effacerait les notes déjà enregistrées (par exemple celles d'exercices que Marie a retirés entre-temps).
const aDesSeries = (series) => series != null && Object.keys(series).length > 0

// Ajoute les cartes non vides (séries, notes, blocs) au contenu à écrire.
function ajouterCartes(out, donnees) {
  if (aDesSeries(donnees.series)) out.series = seriesPropres(donnees.series)
  if (aDesSeries(donnees.notes)) out.notes = notesPropres(donnees.notes)
  if (aDesSeries(donnees.blocs)) out.blocs = blocsPropres(donnees.blocs)
  return out
}

// Contenu écrit (fusion) pendant la séance : statut « en cours ».
// `base` = { client, programme, seance, date, majLe } ; `donnees` = { series: { [elementId]: lignes } }
export function contenuNotes(base, donnees = {}) {
  const out = { client: base.client, programme: base.programme, seance: base.seance, date: base.date, statut: 'en cours', majLe: base.majLe }
  return ajouterCartes(out, donnees)
}

// Contenu écrit (fusion) à la « Fin de séance » : statut « terminée », bilan du client, séries éventuelles.
export function contenuFin(base, fin = {}) {
  const out = {
    client: base.client,
    programme: base.programme,
    seance: base.seance,
    date: base.date,
    statut: 'terminée',
    effort: Number.isInteger(fin.effort) && fin.effort >= 5 && fin.effort <= 10 ? fin.effort : null,
    ressenti: RESSENTIS.includes(fin.ressenti) ? fin.ressenti : '',
    commentaire: texte(fin.commentaire).trim(),
    distance: texte(fin.distance).trim(),
    temps: texte(fin.temps).trim(),
    majLe: base.majLe,
  }
  return ajouterCartes(out, fin)
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

// Exercices des programmes publiés : élément → exercice de la banque, et nom de chaque exercice (le plus récent)
export function exercicesDe(programmes) {
  const exoIdParElement = new Map()
  const noms = new Map()
  for (const p of programmes) {
    for (const sem of p.semaines ?? []) {
      for (const s of sem.seances ?? []) {
        for (const b of s.blocs ?? []) {
          for (const el of b.elements ?? []) {
            if (!el.exoId) continue
            exoIdParElement.set(el.id, el.exoId)
            if (!noms.has(el.exoId)) noms.set(el.exoId, el.nom)
          }
        }
      }
    }
  }
  return { exoIdParElement, noms }
}

// « 60 kg × 5 @8 » ; une série non cochée « Fait » par le client : « non faite »
export function texteSerie(l) {
  if (l.fait === false) return 'non faite'
  const charge = String(l.charge ?? '').trim()
  const reps = String(l.reps ?? '').trim()
  const rpe = String(l.rpe ?? '').trim()
  let t = charge && reps ? `${fr(charge)} kg × ${reps}` : charge ? `${fr(charge)} kg` : reps ? `${reps} rép.` : 'à compléter'
  if (rpe) t += ` @${fr(rpe)}`
  return t
}

// Exercices notés pendant une séance, avec leur nom ; un exercice qui n'est plus dans le programme est signalé.
export function detailSeance(seanceDuProgramme, series) {
  const notes = series ?? {}
  return fusionnerNotes(seanceDuProgramme ?? { blocs: [] }, notes)
    .filter((x) => x.element === null || notes[x.element.id]) // fusionnerNotes pré-remplit : on ne garde que ce qui a été noté
    .map((x, i) => ({
      cle: x.element?.id ?? `retire-${i}`,
      nom: x.element ? x.element.nom : 'Exercice retiré du programme',
      retire: !x.element,
      lignes: x.lignes,
    }))
}
