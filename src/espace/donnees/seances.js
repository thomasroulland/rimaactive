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

// Notes par exercice : { [elementId]: texte } ; résultats par bloc : { [blocId]: { resultat, reps, rpe, fait, note } }
// (`reps` : « Reps en plus » d'un AMRAP)
function notesPropres(notes) {
  const out = {}
  for (const [id, t] of Object.entries(notes ?? {})) out[id] = texte(t)
  return out
}
function blocsPropres(blocs) {
  const out = {}
  for (const [id, b] of Object.entries(blocs ?? {})) {
    out[id] = { resultat: texte(b?.resultat), reps: texte(b?.reps), rpe: texte(b?.rpe), fait: b?.fait === true, note: texte(b?.note) }
  }
  return out
}

// Une carte `series`, `notes` ou `blocs` vide n'est jamais envoyée : avec { merge: true }, Firestore remplacerait tout le champ
// et effacerait les notes déjà enregistrées (par exemple celles d'exercices que Marie a retirés entre-temps).
// Course : temps passé par zone Z1 à Z5 (%), toujours 5 textes
function zonesPropres(zones) {
  return Array.from({ length: 5 }, (_, i) => texte(zones?.[i]).trim())
}

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
// Course : `distance`, `temps`, `fc` (FC moyenne) et `zones` (Z1 à Z5), gardés au fil de la saisie quand ils sont fournis.
export function contenuNotes(base, donnees = {}) {
  const out = { client: base.client, programme: base.programme, seance: base.seance, date: base.date, statut: 'en cours', majLe: base.majLe }
  if (donnees.distance != null) out.distance = texte(donnees.distance).trim()
  if (donnees.temps != null) out.temps = texte(donnees.temps).trim()
  if (donnees.fc != null) out.fc = texte(donnees.fc).trim()
  if (donnees.zones != null) out.zones = zonesPropres(donnees.zones)
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
  if (fin.fc != null) out.fc = texte(fin.fc).trim()
  if (fin.zones != null) out.zones = zonesPropres(fin.zones)
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

// ---------- Écran de la séance (maquette de Marie) ----------

const estZero = (v) => String(v ?? '').trim() !== '' && parseFloat(String(v).replace(',', '.')) === 0
const rempli = (v) => String(v ?? '').trim() !== ''

// Ce que Marie a prévu pour un exercice, comme la maquette :
// séries classiques → { prescription: '4 × 5 · 90 kg', details: 'Repos 2 min · Tempo 3-1-1' } ;
// autres formats → { prescription: '12 reps · 20 kg', details: '' }. Charge 0 : « poids du corps ».
export function lignesExercice(element, enSeries = true) {
  const e = element ?? {}
  const charge = estZero(e.charge) ? 'poids du corps'
    : rempli(e.charge) ? `${fr(String(e.charge).trim())} kg`
      : rempli(e.pct) ? `${fr(String(e.pct).trim())} % de 1RM` : ''
  if (!enSeries) {
    const reps = String(e.reps ?? '').trim()
    const r = /^\d+$/.test(reps) ? `${reps} reps` : reps
    return { prescription: [r, charge].filter(Boolean).join(' · '), details: '' }
  }
  const n = String(e.series ?? '').trim()
  const reps = String(e.reps ?? '').trim()
  const volume = n && reps ? `${n} × ${reps}` : n ? `${n} séries` : reps ? `${reps} reps` : ''
  const details = [
    rempli(e.repos) && `Repos ${String(e.repos).trim()}`,
    rempli(e.tempo) && `Tempo ${String(e.tempo).trim()}`,
    rempli(e.rpe) && `RPE ${fr(String(e.rpe).trim())}`,
  ].filter(Boolean).join(' · ')
  return { prescription: [volume, charge || (volume ? 'charge libre' : '')].filter(Boolean).join(' · '), details }
}

// Champs de « Mon résultat » d'un bloc (maquette) : [{ cle, label, aide }] ; `cle` = champ de `blocs[blocId]`.
// EMOM : minutes réussies « sur {durée} » ; AMRAP : tours complets et reps en plus ; TABATA, HIIT : tours faits « sur {tours} ».
export function champsResultat(bloc) {
  const f = bloc?.format
  if (f === 'emom') return [{ cle: 'resultat', label: 'Minutes réussies', aide: rempli(bloc.duree) ? `sur ${String(bloc.duree).trim()}` : '' }]
  if (f === 'amrap') return [{ cle: 'resultat', label: 'Tours complets', aide: '' }, { cle: 'reps', label: 'Reps en plus', aide: '' }]
  if (f === 'tabata' || f === 'hiit') {
    return [{ cle: 'resultat', label: 'Tours faits', aide: rempli(bloc.tours) ? `sur ${String(bloc.tours).trim()}` : '' }]
  }
  return []
}

// Un exercice d'un bloc EMOM ou AMRAP a un champ « Charge (kg) », sauf au poids du corps (maquette)
export function avecChargeSeule(bloc, element) {
  return (bloc?.format === 'emom' || bloc?.format === 'amrap') && !estZero(element?.charge)
}

// '0:30:00' → 1800 s ; '30:00' → 1800 s ; sinon null
export function secondes(temps) {
  const p = String(temps ?? '').trim().split(':')
  if (p.length < 2 || p.length > 3 || p.some((x) => !/^\d+$/.test(x))) return null
  const n = p.map(Number)
  return p.length === 3 ? n[0] * 3600 + n[1] * 60 + n[2] : n[0] * 60 + n[1]
}

// Allure et vitesse d'une sortie (maquette) : { allure: '6:40 /km', vitesse: '9,0 km/h' }, '–' si incalculable
export function allureVitesse(distance, temps) {
  const d = parseFloat(String(distance ?? '').replace(',', '.'))
  const s = secondes(temps)
  if (!(d > 0) || !s) return { allure: '–', vitesse: '–' }
  const spk = Math.round(s / d)
  const m = Math.floor(spk / 60)
  const r = spk % 60
  return { allure: `${m}:${r < 10 ? '0' : ''}${r} /km`, vitesse: `${fr((d / (s / 3600)).toFixed(1))} km/h` }
}

// Ligne de série après une saisie (maquette + règle « modifier une série la coche ») :
// la série est cochée et les cases vides reprennent ce que Marie a prévu.
export function saisirSerie(ligne, cle, valeur, element) {
  const prevu = { charge: rempli(element?.charge) ? String(element.charge) : '', reps: rempli(element?.reps) ? String(element.reps) : '' }
  if (cle === 'fait') {
    if (!valeur) return { ...ligne, fait: false }
    return { ...ligne, fait: true, charge: rempli(ligne.charge) ? ligne.charge : prevu.charge, reps: rempli(ligne.reps) ? ligne.reps : prevu.reps }
  }
  const out = { ...ligne, [cle]: valeur, fait: true }
  for (const k of ['charge', 'reps']) if (k !== cle && !rempli(out[k])) out[k] = prevu[k]
  return out
}
