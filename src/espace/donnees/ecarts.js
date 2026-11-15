import { enDuree, fr, lignesExercice, resumeFormat, texteDuree } from './seances.js'
// Prévu / fait d'une séance, pour le coach (15 novembre 2026) : exercice par exercice, ce que Marie avait prévu,
// ce que le coaché a noté, et l'écart en une phrase. Calculs purs.

const rempli = (v) => String(v ?? '').trim() !== ''
const nombre = (v) => (rempli(v) ? parseFloat(String(v).trim().replace(',', '.')) : NaN)
const pluriel = (n, mot) => `${fr(n)} ${mot}${n > 1 ? 's' : ''}`
const arrondi = (n) => Math.round(n * 10) / 10

// « 8 » ou « 8-10 » → 8 ; « 45 s », « max » → null (pas comparable)
function repsPrevues(reps) {
  const m = /^(\d+)(\s*(-|–|à)\s*\d+)?$/.exec(String(reps ?? '').trim())
  return m ? Number(m[1]) : null
}

// « 70 × 6 », « 70 kg », « 12 rép. »
function texteFait(l) {
  const c = String(l.charge ?? '').trim()
  const d = texteDuree(l.duree)
  if (d) return c ? `${d} à ${fr(c)} kg` : d
  const r = String(l.reps ?? '').trim()
  return c && r ? `${fr(c)} × ${r}` : c ? `${fr(c)} kg` : r ? `${r} rép.` : 'sans chiffre'
}

function exerciceEnSeries(el, lignes) {
  const prevu = lignesExercice(el, true).prescription.replace(' · charge libre', '') // « charge libre » n'aide pas à comparer
  const faites = (lignes ?? []).filter((l) => l.fait !== false)
  const base = { cle: el.id, nom: el.nom || 'Exercice', prevu }
  if (faites.length === 0) return { ...base, fait: '', statut: 'pas-fait', ecart: 'Pas fait' }
  const moins = []
  const n = parseInt(String(el.series ?? '').trim(), 10)
  if (n > 0 && faites.length < n) moins.push(`${pluriel(faites.length, 'série')} sur ${n}`)
  const rp = enDuree(el) ? null : repsPrevues(el.reps) // une durée n'est pas comparée à des répétitions
  if (rp !== null) {
    const manque = faites.reduce((t, l) => (/^\d+$/.test(String(l.reps ?? '').trim()) ? t + Math.max(0, rp - Number(l.reps)) : t), 0)
    if (manque > 0) moins.push(`${pluriel(manque, 'répétition')} en moins`)
  }
  const cp = nombre(el.charge)
  const charges = faites.map((l) => nombre(l.charge)).filter((c) => !Number.isNaN(c))
  let plus = ''
  if (cp > 0 && charges.length) {
    const bas = Math.min(...charges)
    const haut = Math.max(...charges)
    if (bas < cp) moins.push(`${fr(arrondi(cp - bas))} kg de moins`)
    else if (haut > cp) plus = `${fr(arrondi(haut - cp))} kg de plus`
  }
  const fait = faites.map(texteFait).join(', ')
  if (moins.length) return { ...base, fait, statut: 'moins', ecart: moins.join(', ') }
  if (plus) return { ...base, fait, statut: 'plus', ecart: plus }
  return { ...base, fait, statut: 'prevu', ecart: 'Comme prévu' }
}

// EMOM, AMRAP, TABATA, HIIT : une ligne pour le bloc, d'après « Mon résultat »
function blocAutreFormat(bloc, r) {
  const base = { cle: bloc.id, nom: resumeFormat(bloc), prevu: (bloc.elements ?? []).map((e) => e.nom).filter(Boolean).join(', ') }
  const res = String(r?.resultat ?? '').trim()
  if (!r?.fait && !res) return { ...base, fait: '', statut: 'pas-fait', ecart: 'Pas fait' }
  const f = bloc.format
  const cible = nombre(f === 'emom' ? bloc.duree : f === 'amrap' ? '' : bloc.tours)
  const unite = f === 'emom' ? 'minute' : 'tour'
  const reps = String(r?.reps ?? '').trim()
  const fait = res ? `${pluriel(nombre(res) || 0, unite)}${f === 'amrap' && reps ? ` et ${reps} rép.` : ''}` : 'validé'
  if (res && cible > 0 && nombre(res) < cible) return { ...base, fait, statut: 'moins', ecart: `${pluriel(nombre(res), unite)} sur ${fr(cible)}` }
  return { ...base, fait, statut: 'prevu', ecart: 'Comme prévu' }
}

// { lignes: [{ cle, nom, prevu, fait, statut, ecart }], aRegarder, verdict }
// statut : 'pas-fait', 'moins' (en dessous du prévu), 'prevu', 'plus' (plus lourd que prévu), 'retire' (exercice retiré du programme)
export function comparerSeance(seance, sf) {
  const series = sf?.series ?? {}
  const lignes = []
  const connus = new Set()
  for (const bloc of seance?.blocs ?? []) {
    if ((bloc.format ?? 'series') === 'series') {
      for (const el of bloc.elements ?? []) { connus.add(el.id); lignes.push(exerciceEnSeries(el, series[el.id])) }
    } else {
      for (const el of bloc.elements ?? []) connus.add(el.id)
      lignes.push(blocAutreFormat(bloc, sf?.blocs?.[bloc.id]))
    }
  }
  for (const [id, l] of Object.entries(series)) {
    const faites = (l ?? []).filter((x) => x.fait !== false)
    if (!connus.has(id) && faites.length) lignes.push({ cle: id, nom: 'Exercice retiré du programme', prevu: '', fait: faites.map(texteFait).join(', '), statut: 'retire', ecart: '' })
  }
  const aRegarder = lignes.filter((l) => l.statut === 'moins' || l.statut === 'pas-fait').length
  const mieux = lignes.filter((l) => l.statut === 'plus')
  const compares = lignes.filter((l) => l.statut !== 'retire').length
  let verdict = ''
  if (sf?.statut !== 'terminée') verdict = 'En cours'
  else if (aRegarder > 0) verdict = `${pluriel(aRegarder, 'exercice')} à regarder`
  else if (mieux.length === 1) verdict = `Tout fait, ${mieux[0].ecart} au ${mieux[0].nom.toLowerCase()}`
  else if (mieux.length > 1) verdict = `Tout fait, plus lourd sur ${mieux.length} exercices`
  else if (compares > 0) verdict = 'Tout fait comme prévu'
  return { lignes, aRegarder, verdict }
}
